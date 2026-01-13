import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/logger/logger.service';
import { PermissionValidatorService } from '../permissionValidator.service';
import { Reflector } from '@nestjs/core';
import { RoleHierarchyService } from '../roleHierarchy.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private reflector: Reflector,
    private readonly roleHierarchyService: RoleHierarchyService,
    private readonly permissionValidator: PermissionValidatorService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.get<number[]>('allowedRoles', context.getHandler()) || [];
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      this.logger.error('No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const publicKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
      this.logger.debug('Public key available:', !!publicKey);

      if (!this.jwtService) {
        this.logger.error('JWT Service is not initialized');
        throw new UnauthorizedException('Authentication service error');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        algorithms: ['RS256'],
        issuer: 'progrc-auth',
        audience: 'progrc-auth',
      });
      
      // Determine token source for logging
      const headerToken = this.extractTokenFromHeader(request);
      const cookieToken = this.extractTokenFromCookie(request);
      const tokenSource = headerToken ? 'header' : (cookieToken ? 'cookie' : 'unknown');
      
      // Log the payload for debugging impersonation
      this.logger.log(`JwtAuthGuard: Token verified, payload extracted`, {
        userId: payload['userId'],
        email: payload['email'] || payload['sub'],
        tenant_id: payload['tenant_id'],
        customerId: payload['customerId'],
        role_id: payload['role_id'],
        hasImpersonateExpTime: !!payload['impersonateExpTime'],
        tokenSource: tokenSource,
        hasHeaderToken: !!headerToken,
        hasCookieToken: !!cookieToken,
        payloadKeys: Object.keys(payload)
      });
      
      // WARN if using cookie token without tenant_id/customerId (likely old token)
      if (tokenSource === 'cookie' && !payload['tenant_id'] && !payload['customerId'] && payload['role_id'] === 1) {
        this.logger.warn(`JwtAuthGuard: Using cookie token without tenant_id/customerId for SuperAdmin. This might be an old token. Frontend should send new token in Authorization header.`);
      }
      
      // Audit log for SuperAdmin actions
      const isSuperAdmin = payload['role_id'] === 1 || payload['role_id'] === 2; // SuperAdmin or SuperAdminReadOnly
      if (isSuperAdmin) {
        this.logger.log(`[AUDIT] SuperAdmin action: ${request.method} ${request.url}`, {
          userId: payload['userId'],
          email: payload['email'],
          roleId: payload['role_id'],
          customerId: payload['customerId'],
          ip: request.ip || request.headers['x-forwarded-for'] || 'unknown',
          userAgent: request.headers['user-agent'],
          timestamp: new Date().toISOString()
        });
      }
      
      await this.roleHierarchyService.verifyUserAccess({
        userId: payload['userId'],
        customerId: payload['customerId'],
        impersonateTimeExpiration: payload['impersonateExpTime']
      }, allowedRoles);

      request.user_data = payload;
      request.token = token;
      const permitted = await this.permissionValidator.accessAllowed(request);
      if (!permitted) {
        // Log denied access attempts for SuperAdmin
        if (isSuperAdmin) {
          this.logger.warn(`[AUDIT] SuperAdmin access denied: ${request.method} ${request.url}`, {
            userId: payload['userId'],
            email: payload['email'],
            ip: request.ip || request.headers['x-forwarded-for'] || 'unknown'
          });
        }
        throw new ForbiddenException('Access Denied');
      }
      return true;
    } catch (error) {
      this.logger.error('JWT verification failed:', {
        error: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Handle token expiration specifically
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      
      // Handle other JWT verification errors
      if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Invalid token');
      }

      // Handle existing UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // All other errors are treated as forbidden
      throw new ForbiddenException(error);
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Prefer header token over cookie token (header is more reliable for impersonation)
    // This ensures that when frontend sets a new token in localStorage and sends it via Authorization header,
    // it takes precedence over any old token in cookies
    return this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies['accessToken'];
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error('JWT validation failed:', {
        error: err?.message,
        info: info?.message
      });
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }

  getRequest(context: any): Request {
    const request = context.switchToHttp().getRequest();
    request.token = this.extractTokenFromRequest(request);
    return request;
  }
} 