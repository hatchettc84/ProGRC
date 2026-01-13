import { Controller, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureFlagService } from 'src/feature-flag/feature-flag.service';
import { CreateFeatureFlagDto } from 'src/feature-flag/dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from 'src/feature-flag/dto/update-feature-flag.dto';
import { FeatureFlag } from 'src/entities/featureFlag.entity';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';

@ApiTags('Feature Flag Management')
@Controller('feature-flags')
export class FeatureFlagManagementController {
  constructor(private readonly featureFlagService: FeatureFlagService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new feature flag (No Auth Required)' })
  @ApiResponse({ status: 201, description: 'Feature flag created successfully', type: FeatureFlag })
  async create(@Body() createFeatureFlagDto: CreateFeatureFlagDto): Promise<StandardResponse<FeatureFlag>> {
    const featureFlag = await this.featureFlagService.create(createFeatureFlagDto);
    return StandardResponse.success('Feature flag created successfully', featureFlag);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature flag (No Auth Required)' })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully', type: FeatureFlag })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async update(@Param('id') id: string, @Body() updateFeatureFlagDto: UpdateFeatureFlagDto): Promise<StandardResponse<FeatureFlag>> {
    const featureFlag = await this.featureFlagService.update(+id, updateFeatureFlagDto);
    return StandardResponse.success('Feature flag updated successfully', featureFlag);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feature flag (No Auth Required)' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async remove(@Param('id') id: string): Promise<StandardResponse<void>> {
    await this.featureFlagService.remove(+id);
    return StandardResponse.success('Feature flag deleted successfully');
  }
} 