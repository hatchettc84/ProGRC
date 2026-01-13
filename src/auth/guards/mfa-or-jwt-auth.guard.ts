import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException, CanActivate } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class MfaOrJwtAuthGuard implements CanActivate {
  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Prioritize Authorization header token (important for impersonation)
    const headerToken = this.extractTokenFromHeader(request);
    const cookieToken = request.cookies['preAuthToken'] || request.cookies['accessToken'];
    
    // CRITICAL: Use console.log for debugging since logger might not be working
    console.log('🔐 MfaOrJwtAuthGuard: canActivate called', {
      hasHeaderToken: !!headerToken,
      hasCookieToken: !!cookieToken,
      path: request.path,
      method: request.method
    });
    
    // Try header token first (has impersonation data)
    if (headerToken) {
      console.log('🔐 MfaOrJwtAuthGuard: Found header token, attempting verification');
      this.logger.log('MfaOrJwtAuthGuard: Found header token, attempting verification');
      try {
        const publicKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
        // Try access token first (audience: 'progrc-auth')
        try {
          const payload = await this.jwtService.verifyAsync(headerToken, {
            publicKey: publicKey,
            algorithms: ['RS256'],
            issuer: 'progrc-auth',
            audience: 'progrc-auth',
          });
          console.log('✅ MfaOrJwtAuthGuard: Header access token verified', {
            userId: payload['userId'],
            email: payload['email'] || payload['sub'],
            tenant_id: payload['tenant_id'],
            customerId: payload['customerId'],
            role_id: payload['role_id'],
            payloadKeys: Object.keys(payload)
          });
          this.logger.log(`MfaOrJwtAuthGuard: Header access token verified`, {
            userId: payload['userId'],
            email: payload['email'] || payload['sub'],
            tenant_id: payload['tenant_id'],
            customerId: payload['customerId'],
            role_id: payload['role_id'],
            payloadKeys: Object.keys(payload)
          });
          request.user_data = payload;
          return true;
        } catch (error) {
          this.logger.debug('Header access token verification failed', {
            error: error.message,
            name: error.name,
            audience: 'progrc-auth'
          });
        }
        
        // Try preAuth token (audience: 'progrc-mfa')
        try {
          const payload = await this.jwtService.verifyAsync(headerToken, {
            publicKey: publicKey,
            algorithms: ['RS256'],
            issuer: 'progrc-auth',
            audience: 'progrc-mfa',
          });
          this.logger.log(`MfaOrJwtAuthGuard: Header preAuth token verified`);
          request.user_data = payload;
          return true;
        } catch (error) {
          this.logger.debug('Header preAuth token verification failed');
        }
      } catch (error) {
        this.logger.debug('Header token verification failed, falling back to cookies');
      }
    }
    
    // Fall back to cookie tokens if no header token or header token failed
    if (cookieToken) {
      this.logger.log('MfaOrJwtAuthGuard: No valid header token, falling back to cookie token');
      try {
        const publicKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
        // Try preAuthToken first
        try {
          const payload = await this.jwtService.verifyAsync(cookieToken, {
            publicKey: publicKey,
            algorithms: ['RS256'],
            issuer: 'progrc-auth',
            audience: 'progrc-mfa',
          });
          this.logger.log(`MfaOrJwtAuthGuard: Cookie preAuth token verified`);
          request.user_data = payload;
          return true;
        } catch (error) {
          this.logger.debug('Cookie preAuth token verification failed, trying access token');
        }
        
        // Try accessToken
        try {
          const payload = await this.jwtService.verifyAsync(cookieToken, {
            publicKey: publicKey,
            algorithms: ['RS256'],
            issuer: 'progrc-auth',
            audience: 'progrc-auth',
          });
          this.logger.log(`MfaOrJwtAuthGuard: Cookie access token verified`);
          request.user_data = payload;
          return true;
        } catch (error) {
          this.logger.error('Cookie access token verification failed:', {
            error: error.message,
            name: error.name
          });
        }
      } catch (error) {
        this.logger.error('Cookie token verification failed:', error.message);
      }
    }

    this.logger.error('MfaOrJwtAuthGuard: No valid token found', {
      hasHeaderToken: !!headerToken,
      hasCookieToken: !!cookieToken
    });
    throw new UnauthorizedException('No valid token provided');
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

} 