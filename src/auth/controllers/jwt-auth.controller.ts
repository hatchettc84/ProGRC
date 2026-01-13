import { Controller, Post, Body, Get, UseGuards, Request, Res, UseInterceptors, HttpCode, HttpStatus, UnauthorizedException, Delete, BadRequestException } from '@nestjs/common';
import { JwtAuthService } from '../services/jwt-auth.service';
import { SignupDto, LoginDto, ResetPasswordDto, ConfirmResetPasswordDto, SetPasswordDto, SetTemporaryPasswordDto, SetNewPasswordDto } from '../dto/jwt-auth.dto';
import { AuthResponseDto } from '../dto/jwt-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MfaAuthGuard } from '../guards/mfa-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiCookieAuth, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { Response } from 'express';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { UserRole } from 'src/masterData/userRoles.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from '../../entities/user.entity';
import { MfaOrJwtAuthGuard } from '../guards/mfa-or-jwt-auth.guard';
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('Authentication')
@Controller('jwt-auth')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth()
export class JwtAuthController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly logger: LoggerService
  ) {}

  @Post('signup')
  @ApiOperation({ 
    summary: 'Register a new user account',
    description: 'Creates a new user account with the provided details and returns authentication tokens'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: StandardResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'User already exists or invalid input data',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { 
          type: 'string', 
          description: 'Full name of the user',
          example: 'John Doe'
        },
        email: { 
          type: 'string', 
          description: 'Email address of the user',
          example: 'john.doe@example.com'
        },
        password: { 
          type: 'string', 
          description: 'Password for the account (must meet security requirements)',
          example: 'StrongP@ss123'
        },
      },
    },
  })
  async signup(@Body() signupDto: SignupDto, @Res() res: Response): Promise<StandardResponse> {
    const {response, accessToken, refreshToken} = await this.jwtAuthService.signup(signupDto);
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: process.env.ENVIRONMENT === 'prod', // Only secure in production (HTTPS)
      maxAge: 4 * 60 * 60 * 1000,
    };
    
    if (process.env.ENVIRONMENT !== 'dev') {
      cookieOptions['sameSite'] = 'strict';
    } else {
      cookieOptions['sameSite'] = 'lax'; // Changed from 'none' to 'lax' for HTTP compatibility
    }

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return StandardResponse.success("Successfully signed up", response);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Authenticate user and return token',
    description: 'Authenticates user credentials and returns JWT tokens for access'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials',
    type: StandardResponse
  })
  @ApiBadRequestResponse({ 
    description: 'Password reset required or invalid input',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { 
          type: 'string', 
          description: 'Email address of the user',
          example: 'john.doe@example.com'
        },
        password: { 
          type: 'string', 
          description: 'User password',
          example: 'StrongP@ss123'
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('preAuthToken');
    let {response, accessToken, refreshToken, preAuthToken, requiresMfa } = await this.jwtAuthService.login(loginDto);
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: process.env.ENVIRONMENT === 'prod', // Only secure in production (HTTPS)
      maxAge: 4 * 60 * 60 * 1000,
    };
    
    if (process.env.ENVIRONMENT !== 'dev') {
      cookieOptions['sameSite'] = 'strict';
    } else {
      cookieOptions['sameSite'] = 'lax'; // Changed from 'none' to 'lax' for HTTP compatibility
    }

    if(requiresMfa) {
      res.cookie('preAuthToken', preAuthToken, cookieOptions);
    } else {
      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return StandardResponse.success("Successfully logged in", response);
  }

  @UseGuards(MfaOrJwtAuthGuard)
  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      await this.jwtAuthService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('preAuthToken');

    return StandardResponse.success("Successfully logged out");
  }

  @Get('me')
  @UseGuards(MfaOrJwtAuthGuard)
  @Roles(UserRole.CSM, UserRole.CSM_AUDITOR, UserRole.AUDITOR, UserRole.OrgMember, UserRole.OrgAdmin)
  @ApiOperation({ 
    summary: 'Get current user profile information',
    description: 'Retrieves the profile information of the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile data retrieved successfully',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authenticated',
    type: StandardResponse
  })
  async getMe(@Request() req): Promise<StandardResponse> {
    // Log what we're receiving from the guard
    this.logger.log('getMe controller: req.user_data', {
      userId: req.user_data?.userId,
      email: req.user_data?.email,
      tenant_id: req.user_data?.tenant_id,
      customerId: req.user_data?.customerId,
      role_id: req.user_data?.role_id,
      keys: Object.keys(req.user_data || {})
    });
    const response = await this.jwtAuthService.getMe(req.user_data);
    // Log what we're returning
    // Type assertion needed because response.user may have tenant_id/customerId added dynamically
    const userResponse = response as any;
    this.logger.log('getMe controller: response from service', {
      hasUser: !!userResponse?.user,
      tenant_id: userResponse?.user?.tenant_id,
      customerId: userResponse?.user?.customerId,
      userKeys: userResponse?.user ? Object.keys(userResponse.user) : []
    });
    return StandardResponse.success("Successfully fetched User details", userResponse);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Initiate password reset process',
    description: 'Sends a password reset code to the user\'s email address'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reset code sent to email',
    type: StandardResponse
  })
  @ApiBadRequestResponse({ 
    description: 'User not found or invalid email',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { 
          type: 'string', 
          description: 'Email address of the user requesting password reset',
          example: 'john.doe@example.com'
        },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.jwtAuthService.resetPassword(resetPasswordDto);
  }

  @Post('confirm-reset-password')
  @ApiOperation({ 
    summary: 'Complete password reset with confirmation code',
    description: 'Verifies the reset code and sets a new password for the user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successful',
    type: StandardResponse
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid reset code, expired code, or password requirements not met',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'confirmationCode', 'newPassword'],
      properties: {
        email: { 
          type: 'string', 
          description: 'Email address of the user',
          example: 'john.doe@example.com'
        },
        confirmationCode: { 
          type: 'string', 
          description: 'Reset code received via email',
          example: '123456'
        },
        newPassword: { 
          type: 'string', 
          description: 'New password (must meet security requirements)',
          example: 'NewStrongP@ss123'
        },
      },
    },
  })
  async confirmResetPassword(@Body() confirmResetPasswordDto: ConfirmResetPasswordDto): Promise<void> {
    return this.jwtAuthService.confirmResetPassword(confirmResetPasswordDto);
  }

  @Get('refresh-token')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generates new access token using refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Access token refreshed successfully',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or expired refresh token',
    type: StandardResponse
  })
  async refreshToken(@Request() req, @Res() res: Response){
    const {accessToken, refreshToken} = await this.jwtAuthService.refreshToken(req.user_data);
    this.setAuthCookies(res, { accessToken, refreshToken });

    // Return both tokens so frontend can update localStorage
    return res.json(StandardResponse.success("Successfully refreshed access token", {
      accessToken: accessToken,
      refreshToken: refreshToken
    }));
  }

  @Post('set-temporary-password')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.CSM, UserRole.OrgAdmin, UserRole.SuperAdmin)
  @ApiOperation({ 
    summary: 'Set temporary password for a user',
    description: 'Sets a temporary password for a user and sends it via email'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Temporary password set successfully',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authorized',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'temporaryPassword'],
      properties: {
        email: { 
          type: 'string', 
          description: 'Email address of the user',
          example: 'john.doe@example.com'
        },
        temporaryPassword: { 
          type: 'string', 
          description: 'Temporary password to set',
          example: 'TempP@ss123'
        },
      },
    },
  })
  async setTemporaryPassword(@Body() setTemporaryPasswordDto: SetTemporaryPasswordDto): Promise<StandardResponse> {
    await this.jwtAuthService.setTemporaryPassword(setTemporaryPasswordDto);
    return StandardResponse.success("Temporary password set successfully");
  }

  @Post('set-new-password')
  @UseGuards(MfaOrJwtAuthGuard)
  @Roles(UserRole.CSM, UserRole.OrgAdmin, UserRole.SuperAdmin, UserRole.OrgMember, UserRole.AUDITOR, UserRole.CSM_AUDITOR)
  @ApiOperation({ 
    summary: 'Set new password for a user',
    description: 'Sets a new password for a user who is using a temporary password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'New password set successfully',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'User is not authorized',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'newPassword'],
      properties: {
        email: { 
          type: 'string', 
          description: 'Email address of the user',
          example: 'john.doe@example.com'
        },
        newPassword: { 
          type: 'string', 
          description: 'New password to set',
          example: 'NewStrongP@ss123'
        },
      },
    },
  })
  async setNewPassword(
    @Body() setNewPasswordDto: SetNewPasswordDto,
    @Request() req
  ): Promise<StandardResponse> {
    await this.jwtAuthService.setNewPassword(setNewPasswordDto, req.user_data);
    return StandardResponse.success("New password set successfully");
  }

  // === MFA Authentication Methods ===

  @UseGuards(MfaAuthGuard)
  @Post('mfa/verify/totp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify TOTP code for MFA authentication',
    description: 'Verifies a TOTP code from an authenticator app and completes the login process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA verification successful',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid TOTP code',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { 
          type: 'string', 
          description: 'TOTP code from authenticator app',
          example: '123456'
        },
        device_id: { 
          type: 'string', 
          description: 'Optional device ID if user has multiple TOTP devices',
          example: 'uuid-string'
        },
      },
    },
  })
  async verifyTotpMfa(@Request() req, @Body() body: { code: string, device_id?: string }, @Res({ passthrough: true }) res: Response) {
    const user = req.user_data;
    const isValid = await this.jwtAuthService.verifyTotpCode(user.userId, body.code, body.device_id);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    // Generate and set tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);
    this.setAuthCookies(res, { accessToken, refreshToken });

    return StandardResponse.success('MFA verification successful');
  }

  @UseGuards(MfaAuthGuard)
  @Post('mfa/verify/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify email OTP for MFA authentication',
    description: 'Verifies an OTP code sent via email and completes the login process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA verification successful',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid email OTP',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { 
          type: 'string', 
          description: 'OTP code received via email',
          example: '123456'
        },
      },
    },
  })
  async verifyEmailMfa(@Request() req, @Body() body: { code: string }, @Res({ passthrough: true }) res: Response) {
    const user = req.user_data;
    const isValid = await this.jwtAuthService.verifyEmailOtp(user.userId, body.code, 'LOGIN');

    if (!isValid) {
      throw new BadRequestException('Invalid email OTP');
    }

    // Generate and set tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);
    this.setAuthCookies(res, { accessToken, refreshToken });

    return StandardResponse.success('MFA verification successful');
  }

  @UseGuards(MfaAuthGuard)
  @Post('mfa/verify/backup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify backup code for MFA authentication',
    description: 'Verifies a backup recovery code and completes the login process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA verification successful',
    type: StandardResponse
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid backup code',
    type: StandardResponse
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { 
          type: 'string', 
          description: 'Backup recovery code',
          example: 'ABCD1234'
        },
      },
    },
  })
  async verifyBackupCode(@Request() req, @Body() body: { code: string }, @Res({ passthrough: true }) res: Response) {
    const user = req.user_data;
    const isValid = await this.jwtAuthService.verifyBackupCode(user.userId, body.code);

    if (!isValid) {
      throw new BadRequestException('Invalid backup code');
    }

    // Generate and set tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);
    this.setAuthCookies(res, { accessToken, refreshToken });

    return StandardResponse.success('MFA verification successful');
  }

  @UseGuards(MfaAuthGuard)
  @Post('mfa/send-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send email OTP for MFA authentication',
    description: 'Sends an OTP code to the user\'s email address for MFA verification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email OTP sent successfully',
    type: StandardResponse
  })
  async sendMfaEmailOtp(@Request() req) {
    const user = req.user_data;
    await this.jwtAuthService.sendEmailOtp(user.userId, 'LOGIN');
    return StandardResponse.success('Email OTP sent successfully');
  }

  // Helper method for setting auth cookies
  private setAuthCookies(res: Response, tokens: { accessToken: string, refreshToken: string }) {
    // For HTTP (non-HTTPS) environments, we need to adjust cookie settings
    const isHttps = process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'prod';
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      secure: isHttps, // Only secure for HTTPS
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
    };

    // For HTTP environments (like VPS), use 'lax' instead of 'strict' or 'none'
    // This allows cookies to work properly with HTTP
    if (isHttps) {
      cookieOptions['sameSite'] = 'strict';
    } else {
      // For HTTP, use 'lax' to allow cookies to be sent
      cookieOptions['sameSite'] = 'lax';
    }

    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.clearCookie('preAuthToken');
  }
} 