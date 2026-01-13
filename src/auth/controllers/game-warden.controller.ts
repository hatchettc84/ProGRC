import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { GameWardenAuthGuard } from '../guards/game-warden-auth.guard';
import { GameWardenJwtService } from '../services/game-warden-jwt.service';
import { 
  Public, 
  RequireGroups, 
  RequireRoles, 
  RequireAdmin, 
  CurrentUser 
} from '../decorators/game-warden.decorators';
import { GameWardenUser } from '../interfaces/game-warden.interface';
import { StandardResponse } from '../../common/dto/standardResponse.dto';
import {
  ValidateTokenDto,
  UserProfileDto,
  GroupInfoDto,
  CustomerGroupsDto,
  TokenValidationResponseDto,
  PublicInfoDto,
  AdminMessageDto,
} from '../dto/game-warden.dto';

@ApiTags('Game Warden Authentication')
@ApiBearerAuth()
@Controller('auth/game-warden')
@UseGuards(GameWardenAuthGuard)
export class GameWardenController {
  constructor(private readonly gameWardenJwtService: GameWardenJwtService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  async getProfile(@CurrentUser() user: GameWardenUser): Promise<StandardResponse<UserProfileDto>> {
    const isAdmin = this.gameWardenJwtService.isAdmin(user);
    
    const profile: UserProfileDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      groups: user.groups,
      roles: user.roles,
      emailVerified: user.emailVerified,
      isAdmin,
    };

    return StandardResponse.success('Profile retrieved successfully', profile);
  }

  @Get('groups')
  @RequireGroups('developers', 'engineers')
  @ApiOperation({ summary: 'Get user groups (requires developers or engineers group)' })
  @ApiResponse({ status: 200, description: 'User groups retrieved successfully', type: GroupInfoDto })
  @ApiResponse({ status: 403, description: 'Insufficient group permissions' })
  async getUserGroups(@CurrentUser() user: GameWardenUser): Promise<StandardResponse<GroupInfoDto>> {
    const matchingGroups = this.gameWardenJwtService.getUserGroupsByPattern(user, 'developers');
    const hasRequiredGroups = this.gameWardenJwtService.hasRequiredGroups(user, ['developers', 'engineers']);

    const response: GroupInfoDto = {
      userGroups: user.groups,
      matchingGroups,
      hasRequiredGroups,
    };

    return StandardResponse.success('Groups retrieved successfully', response);
  }

  @Get('admin-only')
  @RequireAdmin()
  @ApiOperation({ summary: 'Admin-only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted', type: AdminMessageDto })
  @ApiResponse({ status: 403, description: 'Insufficient admin permissions' })
  async adminOnly(@CurrentUser() user: GameWardenUser): Promise<StandardResponse<AdminMessageDto>> {
    return StandardResponse.success('Admin access granted', {
      message: `Welcome, ${user.name || user.email}! You have admin privileges.`,
    });
  }

  @Post('validate-token')
  @RequireRoles('validator', 'admin')
  @ApiOperation({ summary: 'Validate a JWT token (requires validator or admin role)' })
  @ApiResponse({ status: 200, description: 'Token validation completed', type: TokenValidationResponseDto })
  @ApiResponse({ status: 403, description: 'Insufficient role permissions' })
  async validateToken(
    @Body() body: ValidateTokenDto,
    @CurrentUser() user: GameWardenUser,
  ): Promise<StandardResponse<TokenValidationResponseDto>> {
    try {
      const validatedUser = await this.gameWardenJwtService.validateToken(body.token);
      return StandardResponse.success('Token is valid', {
        valid: true,
        user: {
          id: validatedUser.id,
          email: validatedUser.email,
          name: validatedUser.name,
          groups: validatedUser.groups,
          roles: validatedUser.roles,
          emailVerified: validatedUser.emailVerified,
          isAdmin: this.gameWardenJwtService.isAdmin(validatedUser),
        },
      });
    } catch (error) {
      return StandardResponse.success('Token validation completed', {
        valid: false,
      });
    }
  }

  @Get('public-info')
  @Public()
  @ApiOperation({ summary: 'Public endpoint - no authentication required' })
  @ApiResponse({ status: 200, description: 'Public information retrieved', type: PublicInfoDto })
  async getPublicInfo(): Promise<StandardResponse<PublicInfoDto>> {
    return StandardResponse.success('Public information retrieved', {
      message: 'This is public information available to everyone',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('customer-groups')
  @RequireGroups('customers')
  @ApiOperation({ summary: 'Customer-specific endpoint' })
  @ApiResponse({ status: 200, description: 'Customer groups retrieved', type: CustomerGroupsDto })
  @ApiResponse({ status: 403, description: 'Customer group membership required' })
  async getCustomerGroups(@CurrentUser() user: GameWardenUser): Promise<StandardResponse<CustomerGroupsDto>> {
    const customerGroups = this.gameWardenJwtService.getUserGroupsByPattern(user, 'Customers');
    
    return StandardResponse.success('Customer groups retrieved', {
      customerGroups,
    });
  }
} 