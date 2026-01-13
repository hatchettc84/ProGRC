import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class MfaAuthGuard extends AuthGuard('mfa') {

  constructor(private readonly logger: LoggerService, private readonly jwtService: JwtService, private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const publicKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
        this.logger.debug('Public key available:', !!publicKey);
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        algorithms: ['RS256'],
        issuer: 'progrc-auth',
        audience: 'progrc-mfa',
      });
      request.user_data = payload;
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
    const token = request.headers.authorization?.split(' ')[1];
    return request.cookies['preAuthToken'] || token;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid pre-auth token');
    }
    return user;
  }

  getRequest(context: any): Request {
    const request = context.switchToHttp().getRequest();
    request.token = this.extractTokenFromRequest(request);
    return request;
  }
} 