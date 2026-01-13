import { Controller, Get, Post, Body, UseGuards, HttpCode, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlatformOneService } from '../services/platform-one.service';
import { PlatformOneStateResponseDto, PlatformOneCallbackDto, PlatformOneTokenResponseDto } from '../dto/platform-one.dto';
import { StandardResponse } from '../../common/dto/standardResponse.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@ApiTags('Platform One SSO')
@Controller('auth/p1')
export class PlatformOneController {
  constructor(private readonly platformOneService: PlatformOneService) {}

  @Get('state')
  @ApiOperation({ summary: 'Generate state parameter for SSO' })
  @ApiResponse({ status: 200, type: PlatformOneStateResponseDto })
  @RateLimit({ points: 5, duration: 60 })
  async generateState(): Promise<StandardResponse<PlatformOneStateResponseDto>> {
    const { state, sessionId } = this.platformOneService.generateState();
    return StandardResponse.success('State generated successfully', { state, sessionId });
  }

  @Post('callback')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Platform One SSO callback' })
  @ApiResponse({ status: 200, type: PlatformOneTokenResponseDto })
  @RateLimit({ points: 5, duration: 60 })
  async handleCallback(
    @Body() callbackDto: PlatformOneCallbackDto,
  ): Promise<StandardResponse<PlatformOneTokenResponseDto>> {
    if (!this.platformOneService.validateState(callbackDto.sessionId, callbackDto.state)) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    const tokenData = await this.platformOneService.exchangeCodeForToken(callbackDto.code);
    const userInfo = await this.platformOneService.getUserInfo(tokenData.access_token);
    const tokens = await this.platformOneService.generateTokens(userInfo);

    return StandardResponse.success('Authentication successful', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        groups: userInfo.groups || [],
      },
    });
  }

  @Post('mock/success')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mock successful Platform One SSO callback' })
  @ApiResponse({ status: 200, type: PlatformOneTokenResponseDto })
  async mockSuccessCallback(
    @Body() callbackDto: PlatformOneCallbackDto,
  ): Promise<StandardResponse<PlatformOneTokenResponseDto>> {
    // Validate state to maintain consistency with real flow
    if (!this.platformOneService.validateState(callbackDto.sessionId, callbackDto.state)) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    // Mock user data
    const mockUserInfo = {
      sub: 'mock-user-123',
      email: 'test.user@example.com',
      name: 'Test User',
      groups: ['group1', 'group2'],
    };

    // Generate real JWT tokens with mock data
    const tokens = await this.platformOneService.generateTokens(mockUserInfo);

    return StandardResponse.success('Mock authentication successful', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: mockUserInfo.sub,
        email: mockUserInfo.email,
        name: mockUserInfo.name,
        groups: mockUserInfo.groups,
      },
    });
  }

  @Post('mock/failure')
  @HttpCode(400)
  @ApiOperation({ summary: 'Mock failed Platform One SSO callback' })
  @ApiResponse({ status: 400, description: 'Mock authentication failure' })
  async mockFailureCallback(
    @Body() callbackDto: PlatformOneCallbackDto,
  ): Promise<StandardResponse<null>> {
    // Validate state to maintain consistency with real flow
    if (!this.platformOneService.validateState(callbackDto.sessionId, callbackDto.state)) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    // Simulate various failure scenarios based on the code
    switch (callbackDto.code) {
      case 'invalid_code':
        throw new BadRequestException('Invalid authorization code');
      case 'expired_code':
        throw new BadRequestException('Authorization code has expired');
      case 'server_error':
        throw new BadRequestException('Platform One server error');
      default:
        throw new BadRequestException('Authentication failed');
    }
  }
}
