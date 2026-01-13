import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GameWardenController } from './game-warden.controller';
import { GameWardenJwtService } from '../services/game-warden-jwt.service';
import { GameWardenAuthGuard } from '../guards/game-warden-auth.guard';
import { ConfigService } from '@nestjs/config';
import { GameWardenUser } from '../interfaces/game-warden.interface';

// Mock JWT tokens for testing
const createMockJwtToken = (payload: any): string => {
  // This is a simplified mock - in real tests you'd use a proper JWT library
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const mockUserPayload = {
  iss: 'https://login.afwerx.dso.mil/auth/realms/gamewarden',
  sub: '123e4567-e89b-12d3-a456-426614174000',
  aud: 'test-client-id',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  email: 'test@example.com',
  name: 'Test User',
  groups: ['/Customers/mycompany/developers'],
  realm_access: {
    roles: ['user', 'developer'],
  },
};

const mockAdminPayload = {
  ...mockUserPayload,
  realm_access: {
    roles: ['user', 'admin'],
  },
};

const mockCustomerPayload = {
  ...mockUserPayload,
  groups: ['/Customers/mycompany/customers'],
  realm_access: {
    roles: ['user', 'customer'],
  },
};

describe('GameWardenController (e2e)', () => {
  let app: INestApplication;
  let gameWardenJwtService: GameWardenJwtService;

  // Mock the GameWardenJwtService
  const mockGameWardenJwtService = {
    validateToken: jest.fn(),
    hasRequiredGroups: jest.fn(),
    hasRequiredRoles: jest.fn(),
    getUserGroupsByPattern: jest.fn(),
    isAdmin: jest.fn(),
  };

  // Mock the GameWardenAuthGuard
  const mockGameWardenAuthGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GameWardenController],
      providers: [
        {
          provide: GameWardenJwtService,
          useValue: mockGameWardenJwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              jwksUrl: 'https://test.jwks.url',
              audience: 'test-audience',
              issuer: 'https://test.issuer.url',
            }),
          },
        },
      ],
    })
      .overrideGuard(GameWardenAuthGuard)
      .useValue(mockGameWardenAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    gameWardenJwtService = moduleFixture.get<GameWardenJwtService>(GameWardenJwtService);
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('GET /auth/game-warden/public-info', () => {
    it('should return public information without authentication', async () => {
      // Mock guard to allow access (public endpoint)
      mockGameWardenAuthGuard.canActivate.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .get('/auth/game-warden/public-info')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /auth/game-warden/profile', () => {
    it('should return user profile with valid authentication', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups,
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .get('/auth/game-warden/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', mockUser.id);
      expect(response.body.data).toHaveProperty('email', mockUser.email);
      expect(response.body.data).toHaveProperty('name', mockUser.name);
      expect(response.body.data).toHaveProperty('groups', mockUser.groups);
      expect(response.body.data).toHaveProperty('roles', mockUser.roles);
    });

    it('should return 401 without authentication', async () => {
      // Mock guard to deny access
      mockGameWardenAuthGuard.canActivate.mockResolvedValue(false);

      await request(app.getHttpServer())
        .get('/auth/game-warden/profile')
        .expect(401);
    });
  });

  describe('GET /auth/game-warden/groups', () => {
    it('should return groups for user with required permissions', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups,
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.getUserGroupsByPattern.mockReturnValue(['/Customers/mycompany/developers']);
      mockGameWardenJwtService.hasRequiredGroups.mockReturnValue(true);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .get('/auth/game-warden/groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userGroups', mockUser.groups);
      expect(response.body.data).toHaveProperty('matchingGroups');
      expect(response.body.data).toHaveProperty('hasRequiredGroups', true);
    });

    it('should return 403 for user without required groups', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: ['/Customers/mycompany/customers'], // Different groups
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.hasRequiredGroups.mockReturnValue(false);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      await request(app.getHttpServer())
        .get('/auth/game-warden/groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });

  describe('GET /auth/game-warden/admin-only', () => {
    it('should allow access for admin user', async () => {
      const mockUser: GameWardenUser = {
        id: mockAdminPayload.sub,
        email: mockAdminPayload.email,
        name: mockAdminPayload.name,
        groups: mockAdminPayload.groups,
        roles: mockAdminPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.isAdmin.mockReturnValue(true);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .get('/auth/game-warden/admin-only')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toContain(mockUser.name);
    });

    it('should deny access for non-admin user', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups,
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.isAdmin.mockReturnValue(false);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      await request(app.getHttpServer())
        .get('/auth/game-warden/admin-only')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });

  describe('POST /auth/game-warden/validate-token', () => {
    it('should validate a valid token', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups,
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.validateToken.mockResolvedValue(mockUser);
      mockGameWardenJwtService.isAdmin.mockReturnValue(false);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .post('/auth/game-warden/validate-token')
        .set('Authorization', 'Bearer valid-token')
        .send({ token: 'another-valid-token' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('valid', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', mockUser.id);
      expect(response.body.data.user).toHaveProperty('email', mockUser.email);
    });

    it('should handle invalid token validation', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups,
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.validateToken.mockRejectedValue(new Error('Invalid token'));

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .post('/auth/game-warden/validate-token')
        .set('Authorization', 'Bearer valid-token')
        .send({ token: 'invalid-token' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('valid', false);
    });
  });

  describe('GET /auth/game-warden/customer-groups', () => {
    it('should return customer groups for user with customer group membership', async () => {
      const mockUser: GameWardenUser = {
        id: mockCustomerPayload.sub,
        email: mockCustomerPayload.email,
        name: mockCustomerPayload.name,
        groups: mockCustomerPayload.groups,
        roles: mockCustomerPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.getUserGroupsByPattern.mockReturnValue(['/Customers/mycompany/customers']);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      const response = await request(app.getHttpServer())
        .get('/auth/game-warden/customer-groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('customerGroups');
      expect(response.body.data.customerGroups).toContain('/Customers/mycompany/customers');
    });

    it('should return 403 for user without customer group membership', async () => {
      const mockUser: GameWardenUser = {
        id: mockUserPayload.sub,
        email: mockUserPayload.email,
        name: mockUserPayload.name,
        groups: mockUserPayload.groups, // No customer groups
        roles: mockUserPayload.realm_access.roles,
      };

      // Mock service methods
      mockGameWardenJwtService.hasRequiredGroups.mockReturnValue(false);

      // Mock guard to allow access and set user
      mockGameWardenAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.gameWardenUser = mockUser;
        return Promise.resolve(true);
      });

      await request(app.getHttpServer())
        .get('/auth/game-warden/customer-groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });

  describe('Error handling', () => {
    it('should handle missing Authorization header', async () => {
      // Mock guard to throw UnauthorizedException
      mockGameWardenAuthGuard.canActivate.mockImplementation(() => {
        throw new Error('No authorization token provided');
      });

      await request(app.getHttpServer())
        .get('/auth/game-warden/profile')
        .expect(500); // This will be handled by the global exception filter
    });

    it('should handle invalid token format', async () => {
      // Mock guard to throw UnauthorizedException
      mockGameWardenAuthGuard.canActivate.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      await request(app.getHttpServer())
        .get('/auth/game-warden/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(500); // This will be handled by the global exception filter
    });
  });
}); 