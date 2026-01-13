import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService
  ) {
    const refreshSecret = config.get('REFRESH_TOKEN_SIGNATURE') || process.env.REFRESH_TOKEN_SIGNATURE || 'default-refresh-secret-change-in-production';
    if (!refreshSecret || refreshSecret === 'default-refresh-secret-change-in-production') {
      console.warn('[JwtRefreshStrategy] Using default refresh token secret. Set REFRESH_TOKEN_SIGNATURE in production!');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request.cookies['refreshToken'] || 
                 request.headers.authorization?.split(' ')[1];
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
      algorithms: ['HS256'],
      issuer: 'progrc-auth',
      audience: 'progrc-auth-refresh',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      if (!user || user.is_locked) {
        throw new UnauthorizedException('User not found or account is locked');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 