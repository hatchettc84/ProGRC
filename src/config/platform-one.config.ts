import { registerAs } from '@nestjs/config';

export default registerAs('platformOne', () => ({
  clientId: process.env.P1_CLIENT_ID,
  clientSecret: process.env.P1_CLIENT_SECRET,
  redirectUri: process.env.P1_REDIRECT_URI,
  authUrl: process.env.P1_AUTH_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
})); 