import * as jwt from 'jsonwebtoken';

export interface GameWardenJwtPayload {
  // Standard JWT claims
  iss: string; // issuer
  sub: string; // subject (unique Keycloak user ID)
  aud: string | string[]; // audience
  exp: number; // expiration time
  iat: number; // issued at
  nbf?: number; // not before
  
  // Game Warden specific claims
  email: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  
  // Group memberships (e.g., "/Customers/mycompany/developers")
  groups?: string[];
  
  // Realm access roles
  realm_access?: {
    roles: string[];
  };
  
  // Resource access (if applicable)
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
  
  // Session info
  session_state?: string;
  acr?: string;
  
  // Additional claims
  [key: string]: any;
}

export interface GameWardenUser {
  id: string; // sub from JWT
  email: string;
  name?: string;
  groups: string[];
  roles: string[];
  sessionState?: string;
  emailVerified?: boolean;
}

export interface GameWardenAuthConfig {
  jwksUrl: string;
  audience: string;
  issuer: string;
  algorithms: jwt.Algorithm[];
  tokenExpirationBuffer?: number; // seconds
} 