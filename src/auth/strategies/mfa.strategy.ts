import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthService } from '../services/jwt-auth.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class MfaStrategy extends PassportStrategy(Strategy, 'mfa') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtAuthService: JwtAuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    let publicKey = configService.get('ACCESS_TOKEN_SIGNATURE_PUBLIC');
    console.log('[MfaStrategy] Initializing - ConfigService key exists:', !!publicKey, 'length:', publicKey ? publicKey.length : 0);
    
    if (!publicKey || publicKey.trim().length < 50) {
      publicKey = process.env.ACCESS_TOKEN_SIGNATURE_PUBLIC;
      console.log('[MfaStrategy] Using process.env - exists:', !!publicKey, 'length:', publicKey ? publicKey.length : 0);
    }
    
    const trimmedKey = (publicKey || '').trim();
    console.log('[MfaStrategy] Final key length:', trimmedKey.length);
    
    if (!trimmedKey || trimmedKey.length < 50) {
      const errorMsg = `MfaStrategy: ACCESS_TOKEN_SIGNATURE_PUBLIC is not configured`;
      console.error('[MfaStrategy] ERROR:', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('[MfaStrategy] Key validated, initializing PassportStrategy...');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from Authorization header or cookie
        (request) => {
          if (request.token) {
            return request.token;
          }
          // Fallback to Authorization header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }
          // Fallback to cookie
          return request.cookies?.preAuthToken;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: trimmedKey,
      algorithms: ['RS256'],
      issuer: 'progrc-auth',
    });
    console.log('[MfaStrategy] Initialized successfully');
  }

  async validate(payload: any) {
    // Validate that this is a pre-auth token
    if (!payload.mfa_required) {
      throw new UnauthorizedException('Invalid token type - pre-auth token required');
    }

    // Check token expiration (pre-auth tokens should have short expiry)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Pre-auth token expired');
    }

    try {
      // Get user from database
      const user = await this.userRepository.findOne({
        where: { id: payload.userId || payload.sub },
        select: [
          'id', 'name', 'email', 'customer_id', 'role_id', 
          'mfa_enabled', 'primary_mfa_type', 'is_locked'
        ],
        relations: ['mfa_devices']
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user account is locked
      if (user.is_locked) {
        throw new UnauthorizedException('User account is locked');
      }

      // Verify that user has MFA enabled (or that MFA is being enforced)
      if (!user.mfa_enabled && !payload.mfa_enforcement) {
        throw new UnauthorizedException('MFA not enabled for user');
      }

      // Attach additional context for MFA verification
      return {
        ...user,
        pre_auth_context: {
          issued_at: payload.iat,
          expires_at: payload.exp,
          mfa_required: payload.mfa_required,
          enforcement: payload.mfa_enabled,
        }
      };
    } catch (error) {
      console.error('MFA token validation error:', error);
      throw new UnauthorizedException('Invalid pre-auth token');
    }
  }
} 