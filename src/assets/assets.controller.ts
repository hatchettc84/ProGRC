import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Asset } from 'src/entities/source/assets.entity';
import { AuthGuard } from 'src/guards/authGuard';
import { convertToValidAppId } from 'src/utils/appIdConverter';
import * as metadata from '../common/metadata';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const userRoles = metadata['userRoles'];

@Controller('assets')
export class AssetsController {
  constructor(private assetService: AssetsService) { }

  @ApiTags('assets') // Group this API under the 'assets' tag in Swagger UI
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Update an asset by ID' })
  @ApiParam({ name: 'id', description: 'ID of the asset to update' })
  @ApiBody({
    description: 'Data to update the asset',
    schema: {
      example: {
        source_type: 'example_source',
        source_version: 'a34d1d4d-12db-4ff6-bb8a-87c1c7840cc9',
        asset_id: 'e8dd7e22-f014-4725-bc4a-1bdf8f11f458',
        name: 'Updated Asset Name',
        llm_summary: 'This is an updated asset summary.',
        embeddings_small: [0.1, 0.2, 0.3],  // Replace with actual format
        embeddings_large: [0.1, 0.2, 0.3, 0.4],  // Replace with actual format
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The asset has been successfully updated',
    schema: {
      example: {
        id: 'd756c84a-848c-44e3-be0a-3df1809e24c1',
        source_type: 'example_source',
        source_version: 'a34d1d4d-12db-4ff6-bb8a-87c1c7840cc9',
        asset_id: 'e8dd7e22-f014-4725-bc4a-1bdf8f11f458',
        name: 'Updated Asset Name',
        llm_summary: 'This is an updated asset summary.',
        embeddings_small: [0.1, 0.2, 0.3],  // Replace with actual format
        embeddings_large: [0.1, 0.2, 0.3, 0.4],  // Replace with actual format
        created_at: '2024-10-15T12:34:56.789Z',
        updated_at: '2024-10-16T14:21:45.123Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async updateAsset(@Request() req: any, @Param('id') id: number, @Body() updateData: Partial<Asset>): Promise<Asset> {
    try {
      const updatedAsset = await this.assetService.updateAsset(id, updateData, req['user_data']);
      return updatedAsset;
    } catch (error) {
      // Automatically throws NotFoundException when asset is not found
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @HttpCode(HttpStatus.NO_CONTENT) // To return 204 No Content on successful deletion
  @ApiResponse({ status: 204, description: 'Asset successfully deleted' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async deleteAsset(@Request() req: any, @Param('id') id: number): Promise<void> {
    const deleted = await this.assetService.deleteAsset(req['user_data'], id);
    if (!deleted) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }
  }

}
