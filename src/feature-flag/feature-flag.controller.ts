import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureFlagService } from './feature-flag.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlag } from '../entities/featureFlag.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/masterData/userRoles.entity';
import { AuthGuard } from 'src/guards/authGuard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('feature-flags')
@Controller('feature-flags')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) { }

  // TODO: Remove this endpoint
  @Post()
  @ApiOperation({ summary: 'Create a new feature flag' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SuperAdmin)
  @ApiResponse({ status: 201, description: 'Feature flag created successfully', type: FeatureFlag })
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagService.create(createFeatureFlagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature flags' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'List of all feature flags', type: [FeatureFlag] })
  findAll() {
    return this.featureFlagService.findAll();
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a feature is enabled' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Feature flag status', type: Boolean })
  async checkFeature(
    @Query('name') name: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.featureFlagService.isFeatureEnabled(name, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feature flag by id' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Feature flag found', type: FeatureFlag })
  findOne(@Param('id') id: string) {
    return this.featureFlagService.findOne(+id);
  }

  // TODO: Remove this endpoint
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Update a feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully', type: FeatureFlag })
  update(@Param('id') id: string, @Body() updateFeatureFlagDto: UpdateFeatureFlagDto) {
    return this.featureFlagService.update(+id, updateFeatureFlagDto);
  }

  // TODO: Remove this endpoint
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted successfully' })
  remove(@Param('id') id: string) {
    return this.featureFlagService.remove(+id);
  }
}
