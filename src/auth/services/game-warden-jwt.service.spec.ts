import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { GameWardenJwtService } from './game-warden-jwt.service';
import { GameWardenUser, GameWardenJwtPayload } from '../interfaces/game-warden.interface';
import * as jwt from 'jsonwebtoken';

// Mock jwks-rsa
jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getSigningKey: jest.fn().mockResolvedValue({
      getPublicKey: jest.fn().mockReturnValue('mock-public-key'),
    }),
  })),
}));

describe('GameWardenJwtService', () => {
  let service: GameWardenJwtService;
  let configService: ConfigService;

  const mockConfig = {
    jwksUrl: 'https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs',
    audience: 'test-client-id',
    issuer: 'https://login.afwerx.dso.mil/auth/realms/gamewarden',
    algorithms: ['RS256'],
    tokenExpirationBuffer: 300,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameWardenJwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockConfig),
          },
        },
      ],
    }).compile();

    service = module.get<GameWardenJwtService>(GameWardenJwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should validate a valid token and return user', async () => {
      const mockPayload: GameWardenJwtPayload = {
        iss: mockConfig.issuer,
        sub: '123e4567-e89b-12d3-a456-426614174000',
        aud: mockConfig.audience,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: 'test@example.com',
        name: 'Test User',
        groups: ['/Customers/mycompany/developers'],
        realm_access: {
          roles: ['user', 'developer'],
        },
      };

      // Mock jwt.verify to return our payload
      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest.spyOn(jwt, 'decode').mockReturnValue({
        header: { kid: 'test-key-id' },
        payload: mockPayload,
      } as any);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({
        id: mockPayload.sub,
        email: mockPayload.email,
        name: mockPayload.name,
        groups: mockPayload.groups,
        roles: mockPayload.realm_access.roles,
        sessionState: undefined,
        emailVerified: undefined,
      });
    });

    it('should throw UnauthorizedException for missing sub claim', async () => {
      const mockPayload = {
        iss: mockConfig.issuer,
        aud: mockConfig.audience,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: 'test@example.com',
      };

      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest.spyOn(jwt, 'decode').mockReturnValue({
        header: { kid: 'test-key-id' },
        payload: mockPayload,
      } as any);

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Missing subject claim in token')
      );
    });

    it('should throw UnauthorizedException for missing email claim', async () => {
      const mockPayload = {
        iss: mockConfig.issuer,
        sub: '123e4567-e89b-12d3-a456-426614174000',
        aud: mockConfig.audience,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload as any);
      jest.spyOn(jwt, 'decode').mockReturnValue({
        header: { kid: 'test-key-id' },
        payload: mockPayload,
      } as any);

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Missing email claim in token')
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });
      jest.spyOn(jwt, 'decode').mockReturnValue({
        header: { kid: 'test-key-id' },
        payload: {},
      } as any);

      await expect(service.validateToken('expired-token')).rejects.toThrow(
        new UnauthorizedException('Token has expired')
      );
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      jest.spyOn(jwt, 'decode').mockReturnValue(null);

      await expect(service.validateToken('invalid-format')).rejects.toThrow(
        new UnauthorizedException('Invalid token format')
      );
    });
  });

  describe('hasRequiredGroups', () => {
    const mockUser: GameWardenUser = {
      id: 'test-id',
      email: 'test@example.com',
      groups: ['/Customers/mycompany/developers', '/Customers/mycompany/admins'],
      roles: ['user', 'developer'],
    };

    it('should return true when user has required groups', () => {
      const result = service.hasRequiredGroups(mockUser, ['developers', 'admins']);
      expect(result).toBe(true);
    });

    it('should return true when user has exact group match', () => {
      const result = service.hasRequiredGroups(mockUser, ['/Customers/mycompany/developers']);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required groups', () => {
      const result = service.hasRequiredGroups(mockUser, ['managers', 'executives']);
      expect(result).toBe(false);
    });

    it('should return true when no groups required', () => {
      const result = service.hasRequiredGroups(mockUser, []);
      expect(result).toBe(true);
    });
  });

  describe('hasRequiredRoles', () => {
    const mockUser: GameWardenUser = {
      id: 'test-id',
      email: 'test@example.com',
      groups: ['/Customers/mycompany/developers'],
      roles: ['user', 'developer', 'admin'],
    };

    it('should return true when user has required roles', () => {
      const result = service.hasRequiredRoles(mockUser, ['developer', 'admin']);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required roles', () => {
      const result = service.hasRequiredRoles(mockUser, ['manager', 'executive']);
      expect(result).toBe(false);
    });

    it('should return true when no roles required', () => {
      const result = service.hasRequiredRoles(mockUser, []);
      expect(result).toBe(true);
    });
  });

  describe('getUserGroupsByPattern', () => {
    const mockUser: GameWardenUser = {
      id: 'test-id',
      email: 'test@example.com',
      groups: ['/Customers/mycompany/developers', '/Customers/mycompany/admins', '/Internal/team1'],
      roles: ['user'],
    };

    it('should return groups matching pattern', () => {
      const result = service.getUserGroupsByPattern(mockUser, 'developers');
      expect(result).toEqual(['/Customers/mycompany/developers']);
    });

    it('should return empty array when no matches', () => {
      const result = service.getUserGroupsByPattern(mockUser, 'nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('isAdmin', () => {
    it('should return true for user with admin role', () => {
      const adminUser: GameWardenUser = {
        id: 'test-id',
        email: 'admin@example.com',
        groups: ['/Customers/mycompany/developers'],
        roles: ['user', 'admin'],
      };

      const result = service.isAdmin(adminUser);
      expect(result).toBe(true);
    });

    it('should return true for user in admin group', () => {
      const adminUser: GameWardenUser = {
        id: 'test-id',
        email: 'admin@example.com',
        groups: ['/Customers/mycompany/admins', '/admin'],
        roles: ['user'],
      };

      const result = service.isAdmin(adminUser);
      expect(result).toBe(true);
    });

    it('should return false for regular user', () => {
      const regularUser: GameWardenUser = {
        id: 'test-id',
        email: 'user@example.com',
        groups: ['/Customers/mycompany/developers'],
        roles: ['user'],
      };

      const result = service.isAdmin(regularUser);
      expect(result).toBe(false);
    });
  });
}); 