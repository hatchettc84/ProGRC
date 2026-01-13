import { Body, Controller, Post, Put, Request, UseGuards, Res, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import * as metadata from '../common/metadata';
import { AuthService } from './auth.service';
import { CognitoService } from './cognitoAuth.service';
import { ResetPasswordService } from 'src/customer/member/resetPassword.service';
import { SetInitialPasswordRequest, SignUpDto } from './dto/auth.dto';
import { UserRole } from 'src/masterData/userRoles.entity';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MfaAuthGuard } from 'src/auth/guards/mfa-auth.guard';
import { User } from 'src/entities/user.entity';
// MfaType removed - use MfaDeviceType from auth/mfa.types.ts for new MFA system
const userRoles = metadata['userRoles'];

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth('JWT-auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cognitoService: CognitoService,
    private readonly resetPasswordSrvc: ResetPasswordService
  ) { }


  @Post('/verify_signup')
  @ApiOperation({ summary: 'Verify Signup Otp of new created super admin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'new user email' },
        confirmationCode: { type: 'string', description: 'Code received on email' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'It will verify code via cognito and return success or faliure message.' })
  verifySignOtp(@Request() req: any) {
    return this.cognitoService.confirmSignUpCommand(req.body);
  }

  @Post('/resend_signup_otp')
  @ApiOperation({ summary: 'Resend Signup Otp' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'email' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'It will Resend Signup Otp.' })
  resendSignupOtp(@Request() req: any) {
    return this.cognitoService.resendConfirmationCodeCommand(req.body);
  }

  @Post('/forgot_password')
  @ApiOperation({ summary: 'Send Code to reset password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'user email' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'It willSend Code to reset password.' })
  forgotPassword(@Request() req: any) {
    return this.cognitoService.forgotPasswordCommand(req.body);
  }

  @Post('/confirm_forgot_password')
  @ApiOperation({ summary: 'Verify Forgot Password Otp and set new password.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'new user email' },
        confirmationCode: { type: 'string', description: 'Code received on email' },
        newPassword: { type: 'string', description: 'The new password' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Return success or faliure message.' })
  confirmForgotPassword(@Request() req: any) {
    return this.cognitoService.confirmForgotPasswordCommand(req.body);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    
    if (user.mfa_enabled) {
      // If MFA is enabled, return a pre-auth token
      const preAuthToken = await this.authService.generatePreAuthToken(user);
      return { requiresMfa: true, preAuthToken };
    }

    // If no MFA, generate and set tokens
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);
    
    // Set tokens as HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { message: 'Login successful' };
  }









  // Legacy MFA endpoints removed - use /auth/mfa/* endpoints from MfaController

  // Helper method for setting auth cookies
  private setAuthCookies(res: Response, tokens: { accessToken: string, refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const decoded = await this.authService.verifyRefreshToken(refreshToken);
    const user = await this.authService.getUserById(decoded.sub);
    
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.generateTokens(user);
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { message: 'Token refresh successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logout successful' };
  }

  // Legacy MFA setup endpoint removed - use /auth/mfa/setup/* endpoints from MfaController

  @UseGuards(JwtAuthGuard)
  @Put('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    const user = req.user as User;
    await this.authService.validateUser(user.email, body.currentPassword);
    await this.authService.updatePassword(user.id, body.newPassword);
    return { message: 'Password changed successfully' };
  }
  // TODO: Remove this endpoint
  @Post('/org_admin')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.csm)
  createOrgAdmin(@Request() req: any) {
    const { role_id } = req.body;
    if (!role_id) {
      req.body['role_id'] = userRoles['org_admin'];
      req.body['role'] = 'org_admin';
    }
    return this.authService.createOrgUser(req.body, req['user_data']['userId']);
  }

  @Post('/reset_password')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.OrgMember)
  @ApiOperation({ summary: 'Set Initial Password for Newly invited users.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'email' },
        id: { type: 'string', description: 'user id' },
        newPassword: { type: 'string', description: 'Password sent in invite email.' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Return success or faliure message.' })
  setInitialPassword(@Request() req: any, @Body() body: SetInitialPasswordRequest) {
    return this.resetPasswordSrvc.resetPasswordUser(req['user_data'], { userId: body.id, customerId: req['user_data']['customerId'] });
  }
}
