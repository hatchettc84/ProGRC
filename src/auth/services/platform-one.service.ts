import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { User } from '../../entities/user.entity';

interface StateStore {
  state: string;
  sessionId: string;
  expiresAt: number;
}

@Injectable()
export class PlatformOneService {
  private readonly logger = new Logger(PlatformOneService.name);
  private stateStore: Map<string, StateStore> = new Map();
  private readonly STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly jwtAuthService: JwtAuthService,
  ) {
    // Clean up expired states every minute
    setInterval(() => this.cleanupExpiredStates(), 60 * 1000);
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [key, value] of this.stateStore.entries()) {
      if (value.expiresAt < now) {
        this.stateStore.delete(key);
      }
    }
  }

  generateState(): { state: string; sessionId: string } {
    const state = crypto.randomBytes(32).toString('hex');
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + this.STATE_EXPIRY;

    this.stateStore.set(sessionId, {
      state,
      sessionId,
      expiresAt,
    });

    return { state, sessionId };
  }

  validateState(sessionId: string, state: string): boolean {
    const storedState = this.stateStore.get(sessionId);
    if (!storedState) {
      return false;
    }

    if (storedState.expiresAt < Date.now()) {
      this.stateStore.delete(sessionId);
      return false;
    }

    const isValid = storedState.state === state;
    if (isValid) {
      this.stateStore.delete(sessionId);
    }

    return isValid;
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const tokenResponse = await axios.post(
        `${this.configService.get('P1_AUTH_URL')}/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.configService.get('P1_REDIRECT_URI'),
          client_id: this.configService.get('P1_CLIENT_ID'),
          client_secret: this.configService.get('P1_CLIENT_SECRET'),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return tokenResponse.data;
    } catch (error) {
      this.logger.error('Failed to exchange code for token', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.configService.get('P1_AUTH_URL')}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get user info', error);
      throw new UnauthorizedException('Failed to get user information');
    }
  }

  async generateTokens(userInfo: any): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    // Create a User object with the required fields for token generation
    const user = new User();
    user.id = userInfo.sub;
    user.email = userInfo.email;
    user.name = userInfo.name;
    user.role_id = userInfo.role_id || 1; // Default role if not provided
    user.customer_id = userInfo.customer_id;
    user.mfa_enabled = false; // Platform One users don't use MFA through our system

    // Use the existing JwtAuthService to generate tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 14400, // 4 hours in seconds, matching JwtAuthService
    };
  }
} 