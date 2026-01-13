import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService
  ) {
    // Get public key from multiple sources with fallback
    let publicKey = config.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
    console.log('[JwtStrategy] Initializing - ConfigService key exists:', !!publicKey, 'length:', publicKey ? publicKey.length : 0);
    
    if (!publicKey || publicKey.trim().length < 50) {
      publicKey = process.env.ACCESS_TOKEN_SIGNATURE_PUBLIC;
      console.log('[JwtStrategy] Using process.env - exists:', !!publicKey, 'length:', publicKey ? publicKey.length : 0);
    }
    
    const trimmedKey = (publicKey || '').trim();
    console.log('[JwtStrategy] Final key length:', trimmedKey.length, 'starts with:', trimmedKey.substring(0, 30));
    
    if (!trimmedKey || trimmedKey.length < 50) {
      const errorMsg = `ACCESS_TOKEN_SIGNATURE_PUBLIC is not configured. ConfigService: ${!!config.get('ACCESS_TOKEN_SIGNATURE_PUBLIC')}, process.env: ${!!process.env.ACCESS_TOKEN_SIGNATURE_PUBLIC}, length: ${trimmedKey.length}`;
      console.error('[JwtStrategy] ERROR:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('[JwtStrategy] Key validated, initializing PassportStrategy...');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request.token
      ]),
      ignoreExpiration: false,
      secretOrKey: trimmedKey,
      algorithms: ['RS256'],
      issuer: 'progrc-auth',
      audience: 'progrc-auth'
    });
    console.log('[JwtStrategy] Initialized successfully');
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