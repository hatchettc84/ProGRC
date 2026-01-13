import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { InviteStatus, User } from 'src/entities/user.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { EmailService } from 'src/notifications/email.service';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { CognitoService } from './cognitoAuth.service';

const mockCustomer = (overrides = {}) => {
  const defaultCustomer = {
    id: '1',
    logo_image_key: 'logo.png',
    owner_id: 'owner-id',
    organization_name: 'Test Organization',
    license_type: 'basic',
    created_by_user: null,
    created_by: 'user-id',
    updated: null,
    updated_by: 'user-id',
    members: [],
    is_onboarding_complete: false,
    created_at: new Date(),
    updated_at: new Date(),
    notes: 'This is a mock customer.',
    deleted: false,
    customer_csms: [],
    ...overrides,
  };

  return defaultCustomer;
};

const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  name: 'Test User',
  role_id: 1,
  customer_id: 'customer-id',
  invite_status: 'NOT_SENT',
  profile_image_key: 'profile-image-key',
  mobile: '1234567890',
  created_at: new Date(),
  updated_at: new Date(),
  deleted: false,
  appUsers: [],
  csms: [],
  role: {

    id: 1,

    name: 'Admin',

    role_name: 'Admin Role',

    is_org_role: true,

  },

  customer: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let cognitoService: jest.Mocked<CognitoService>;
  let configService: jest.Mocked<ConfigService>;
  let userRepository: jest.Mocked<Repository<User>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let dataSource: jest.Mocked<DataSource>;
  let emailService: jest.Mocked<EmailService>;
  let resetPasswordTokenService: jest.Mocked<ResetPasswordTokenService>;

  const mockCognitoService = {
    createOrgUser: jest.fn(),
    getUserDataByToken: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneByOrFail: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    manager: {
      transaction: jest.fn().mockImplementation((cb) => cb()),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CognitoService, useValue: mockCognitoService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Customer), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: EmailService, useValue: {
            sendEmail: jest.fn(),
          }
        },
        {
          provide: ResetPasswordTokenService, useValue: {
            createResetPasswordToken: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    cognitoService = module.get<CognitoService>(CognitoService) as jest.Mocked<CognitoService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    userRepository = module.get<Repository<User>>(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer)) as jest.Mocked<Repository<Customer>>;
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  describe('createOrg', () => {
    it('should create a new organization', async () => {
      const org_id = 'org-id';
      const org_name = 'Test Organization';
      const created_by = 'user-id';
      const license_type = 'basic';

      const customerMock = mockCustomer({
        organization_name: 'Test Organization',
        is_onboarding_complete: true,
      });

      customerRepository.create.mockReturnValue(customerMock);
      customerRepository.save.mockResolvedValue(customerMock);

      const result = await service.createOrg(org_id, org_name, created_by, license_type);

      expect(customerRepository.create).toHaveBeenCalledWith({
        organization_name: org_name,
        created_by,
        license_type,
      });
      expect(customerRepository.save).toHaveBeenCalledWith(customerMock);
      expect(result).toEqual(customerMock);
    });
  });

  describe('createOrgUser', () => {
    it('should throw BadRequestException on error', async () => {
      const body = {
        org_id: 'org-id',
        org_name: 'Test Org',
        email: 'test@example.com',
        role: 'admin',
        role_id: 1,
        name: 'Test User',
        create_new_org: true,
        license_type: 'Beta',
      };
      const created_by = 'user-id';

      userRepository.findOneByOrFail.mockRejectedValue(new Error('User not found'));

      await expect(service.createOrgUser(body, created_by)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {


    it('should reject invalid token', async () => {
      const token = 'invalid-token';

      cognitoService.getUserDataByToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(token)).rejects.toEqual('Invalid token');
    });
  });

  describe('verifyUserAccess', () => {
    it('should verify user access and return user', async () => {
      const userId = 'user-id';
      const allowedRoles = ['admin'];
      const mockUserData = {
        id: 'mock-user-id',
        name: 'Mock User',
        mobile: '1234567890',
        profile_image_key: 'mock-image-key',
        email: 'mockuser@example.com',
        customer_id: 'mock-customer-id',
        customer: mockCustomer({
          id: 'mock-customer-id',
          organization_name: 'Mock Customer',
        }),
        invite_status: InviteStatus.SENT,
        role: {
          id: 1,
          name: 'Mock Role',
          role_name: 'Mock Role Name',
          is_org_role: true,
        } as UserRoles, // Use partial mock of the `UserRoles` entity if necessary
        role_id: 1,
        appUsers: [],
        created_at: new Date('2023-01-01T00:00:00Z'),
        updated_at: new Date('2023-01-02T00:00:00Z'),
        deleted: false,
        csms: [],
      };

      userRepository.find.mockResolvedValue([mockUserData]);

      const result = await service.verifyUserAccess(userId, allowedRoles);

      expect(userRepository.find).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(mockUserData);
    });

  });
});
