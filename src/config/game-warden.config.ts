import { registerAs } from '@nestjs/config';
import { GameWardenAuthConfig } from '../auth/interfaces/game-warden.interface';

export default registerAs('gameWarden', (): GameWardenAuthConfig => {
  // Provide default values for development/testing
  const config: GameWardenAuthConfig = {
    jwksUrl: process.env.KEYCLOAK_JWKS_URL || 'https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs',
    audience: process.env.JWT_AUDIENCE || 'your-client-id-here',
    issuer: process.env.KEYCLOAK_ISSUER || 'https://login.afwerx.dso.mil/auth/realms/gamewarden',
    algorithms: ['RS256'] as const,
    tokenExpirationBuffer: parseInt(process.env.JWT_EXPIRATION_BUFFER || '300', 10), // 5 minutes default
  };

  // Log configuration for debugging (only in development)
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    console.log('Game Warden Configuration:', {
      jwksUrl: config.jwksUrl,
      audience: config.audience,
      issuer: config.issuer,
      tokenExpirationBuffer: config.tokenExpirationBuffer,
    });
  }

  return config;
}); 