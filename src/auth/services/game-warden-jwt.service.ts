import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { GameWardenJwtPayload, GameWardenUser, GameWardenAuthConfig } from '../interfaces/game-warden.interface';

@Injectable()
export class GameWardenJwtService {
  private readonly logger = new Logger(GameWardenJwtService.name);
  private jwksClient: jwksClient.JwksClient | null = null;
  private config: GameWardenAuthConfig | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get or initialize the Game Warden configuration
   */
  private getConfig(): GameWardenAuthConfig {
    if (!this.config) {
      this.config = this.configService.get<GameWardenAuthConfig>('gameWarden');
      
      if (!this.config) {
        this.logger.error('Game Warden configuration not found');
        throw new Error('Game Warden configuration not found. Please check your environment variables and configuration setup.');
      }

      this.logger.log('Game Warden configuration loaded successfully', {
        jwksUrl: this.config.jwksUrl,
        audience: this.config.audience,
        issuer: this.config.issuer,
      });

      // Initialize JWKS client
      this.jwksClient = jwksClient({
        jwksUri: this.config.jwksUrl,
        rateLimit: true,
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 600000, // 10 minutes
      });
    }

    return this.config;
  }

  /**
   * Get the JWKS client
   */
  private getJwksClient(): jwksClient.JwksClient {
    if (!this.jwksClient) {
      this.getConfig(); // This will initialize the JWKS client
    }
    return this.jwksClient!;
  }

  /**
   * Extract and validate JWT token from Authorization header
   */
  async validateToken(token: string): Promise<GameWardenUser> {
    try {
      // Decode token to get header without verification
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Get the public key from JWKS
      const key = await this.getJwksClient().getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      // Verify the token
      const payload = jwt.verify(token, publicKey, {
        algorithms: this.getConfig().algorithms as jwt.Algorithm[],
        audience: this.getConfig().audience,
        issuer: this.getConfig().issuer,
        clockTolerance: this.getConfig().tokenExpirationBuffer,
      }) as unknown as GameWardenJwtPayload;

      // Extract user information
      const user = this.extractUserFromPayload(payload);
      
      this.logger.debug(`Token validated successfully for user: ${user.email}`);
      return user;

    } catch (error) {
      this.logger.error('Token validation failed', {
        error: error.message,
        name: error.name,
      });

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      
      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not yet valid');
      }

      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Extract user information from JWT payload
   */
  private extractUserFromPayload(payload: GameWardenJwtPayload): GameWardenUser {
    if (!payload.sub) {
      throw new UnauthorizedException('Missing subject claim in token');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Missing email claim in token');
    }

    // Extract groups from payload
    const groups = payload.groups || [];
    
    // Extract roles from realm_access
    const roles = payload.realm_access?.roles || [];

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.preferred_username,
      groups,
      roles,
      sessionState: payload.session_state,
      emailVerified: payload.email_verified,
    };
  }

  /**
   * Check if user belongs to any of the required groups
   */
  hasRequiredGroups(user: GameWardenUser, requiredGroups: string[]): boolean {
    if (!requiredGroups || requiredGroups.length === 0) {
      return true;
    }

    return requiredGroups.some(requiredGroup => 
      user.groups.some(userGroup => 
        userGroup === requiredGroup || userGroup.endsWith(`/${requiredGroup}`)
      )
    );
  }

  /**
   * Check if user has any of the required roles
   */
  hasRequiredRoles(user: GameWardenUser, requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some(requiredRole => 
      user.roles.includes(requiredRole)
    );
  }

  /**
   * Get user groups that match a specific pattern
   */
  getUserGroupsByPattern(user: GameWardenUser, pattern: string): string[] {
    return user.groups.filter(group => group.includes(pattern));
  }

  /**
   * Check if user has admin privileges (has admin role or is in admin group)
   */
  isAdmin(user: GameWardenUser): boolean {
    const adminRoles = ['admin', 'administrator', 'super-admin'];
    const adminGroups = ['/admin', '/administrators', '/super-admin'];
    
    return this.hasRequiredRoles(user, adminRoles) || 
           this.hasRequiredGroups(user, adminGroups);
  }
} 