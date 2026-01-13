import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoService } from './cognitoAuth.service';
import { AuthGuard } from 'src/guards/authGuard';
import { ChangePasswordCommandOutput, ConfirmForgotPasswordCommandOutput, ConfirmSignUpCommandOutput, ForgotPasswordCommandOutput, ResendConfirmationCodeCommandOutput, RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { InviteStatus, User } from 'src/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let cognitoService: jest.Mocked<CognitoService>;

  const mockAuthService = {
    createOrgUser: jest.fn(),
  };

  const mockCognitoService = {
    signUpCommand: jest.fn(),
    confirmSignUpCommand: jest.fn(),
    resendConfirmationCodeCommand: jest.fn(),
    forgotPasswordCommand: jest.fn(),
    confirmForgotPasswordCommand: jest.fn(),
    signInCommand: jest.fn(),
    changePasswordCommand: jest.fn(),
    respondToNewPasswordChallenge: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CognitoService, useValue: mockCognitoService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    cognitoService = module.get(CognitoService);
  });

  describe('registerRootUser', () => {
    it('should create a new super admin user', async () => {
      const mockRequest = { body: { email: 'test@example.com', password: 'password' } };
      const mockUser: User = {
        id: 'user-id',
        name: 'Test User',
        mobile: '1234567890',
        profile_image_key: 'profile-image-key',
        email: 'test@example.com',
        customer_id: 'customer-id',
        customer: null,
        invite_status: InviteStatus.NOT_SENT,
        role: null,
        role_id: 1,
        appUsers: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted: false,
        csms: [],
    };

      const mockResponse = { message: 'User created successfully!', data: mockUser };

      cognitoService.signUpCommand.mockResolvedValue(mockResponse.data);
   
    cognitoService.signUpCommand.mockResolvedValue(mockUser);

      const result = await controller.registerRootUser(mockRequest);

      expect(cognitoService.signUpCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifySignOtp', () => {
    it('should verify signup OTP', async () => {
      const mockRequest = { body: { email: 'test@example.com', confirmationCode: '123456' } };
      const mockResponse: ConfirmSignUpCommandOutput = { $metadata: { httpStatusCode: 200 } };
      

      cognitoService.confirmSignUpCommand.mockResolvedValue(mockResponse);

      const result = await controller.verifySignOtp(mockRequest);

      expect(cognitoService.confirmSignUpCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resendSignupOtp', () => {
    it('should resend signup OTP', async () => {
      const mockRequest = { body: { email: 'test@example.com' } };
      const mockResponse: ResendConfirmationCodeCommandOutput = { $metadata: { httpStatusCode: 200 } };



      cognitoService.resendConfirmationCodeCommand.mockResolvedValue(mockResponse);

      const result = await controller.resendSignupOtp(mockRequest);

      expect(cognitoService.resendConfirmationCodeCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send code to reset password', async () => {
      const mockRequest = { body: { email: 'test@example.com' } };
      const mockResponse: ForgotPasswordCommandOutput = { $metadata: { httpStatusCode: 200 } };

      cognitoService.forgotPasswordCommand.mockResolvedValue(mockResponse);

      const result = await controller.forgotPassword(mockRequest);

      expect(cognitoService.forgotPasswordCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('confirmForgotPassword', () => {
    it('should verify forgot password OTP and set new password', async () => {
      const mockRequest = { body: { email: 'test@example.com', confirmationCode: '123456', newPassword: 'newpassword' } };
      const mockResponse: ConfirmForgotPasswordCommandOutput = { $metadata: { httpStatusCode: 200 } };
      
      cognitoService.confirmForgotPasswordCommand.mockResolvedValue(mockResponse);

      const result = await controller.confirmForgotPassword(mockRequest);

      expect(cognitoService.confirmForgotPasswordCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should login user and return access token', async () => {
      const mockRequest = { body: { email: 'test@example.com', password: 'password' } };
      const mockResponse = { data: { token: 'token' } };

      cognitoService.signInCommand.mockResolvedValue(mockResponse);

      const result = await controller.login(mockRequest);

      expect(cognitoService.signInCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePwd', () => {
    it('should change password', async () => {
      const mockRequest = { body: { oldPassword: 'oldpassword', newPassword: 'newpassword' } };
      const mockResponse: ChangePasswordCommandOutput = { $metadata: { httpStatusCode: 200 } };

      cognitoService.changePasswordCommand.mockResolvedValue(mockResponse);

      const result = await controller.updatePwd(mockRequest);

      expect(cognitoService.changePasswordCommand).toHaveBeenCalledWith(mockRequest.body);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createOrgAdmin', () => {
    it('should create an organization admin', async () => {
      const mockRequest = { body: { role_id: 'roleId' }, user_data: { userId: 'userId' } };
      const mockResponse = { message: 'Organization admin created successfully' };

      authService.createOrgUser.mockResolvedValue(mockResponse);

      const result = await controller.createOrgAdmin(mockRequest);

      expect(authService.createOrgUser).toHaveBeenCalledWith(mockRequest.body, mockRequest.user_data.userId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setInitialPassword', () => {
    it('should set initial password for newly invited users', async () => {
      const mockRequest = { body: { email: 'test@example.com', newPassword: 'newpassword' }, headers: { authorization: 'token' } };
      const mockResponse: RespondToAuthChallengeCommandOutput = { $metadata: { httpStatusCode: 200 } };

      cognitoService.respondToNewPasswordChallenge.mockResolvedValue(mockResponse);

      const result = await controller.setInitialPassword(mockRequest);

      expect(cognitoService.respondToNewPasswordChallenge).toHaveBeenCalledWith(mockRequest.body.email, mockRequest.body.newPassword, mockRequest.headers.authorization);
      expect(result).toEqual(mockResponse);
    });
  });
});