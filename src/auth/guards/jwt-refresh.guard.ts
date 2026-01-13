import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { LoggerService } from "src/logger/logger.service";
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      this.logger.error('No token provided in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('REFRESH_TOKEN_SIGNATURE'),
        algorithms: ['HS256'],
        issuer: 'progrc-auth',
        audience: 'progrc-auth-refresh',
      });
      
      // Determine token source for logging
      const headerToken = this.extractTokenFromHeader(request);
      const cookieToken = this.extractTokenFromCookie(request);
      const tokenSource = headerToken ? 'header' : (cookieToken ? 'cookie' : 'unknown');
      
      // Log the payload for debugging impersonation
      this.logger.log(`JwtRefreshGuard: Refresh token verified, payload extracted`, {
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
        this.logger.warn(`JwtRefreshGuard: Using cookie refresh token without tenant_id/customerId for SuperAdmin. This might be an old token. Frontend should send new refresh token in Authorization header.`);
      }
      
      request.payload = payload;
      request.user_data = payload;
    } catch (error) {
      this.logger.error('Invalid token', error);
      
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

      // All other errors are treated as unauthorized
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Prefer header token over cookie token (header is more reliable for impersonation)
    // This ensures that when frontend sets a new refresh token in localStorage and sends it via Authorization header,
    // it takes precedence over any old token in cookies
    return this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies['refreshToken'];
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
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