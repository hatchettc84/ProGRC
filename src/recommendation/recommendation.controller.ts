import { Controller, Get, Query, UseInterceptors, Post, Body, Patch, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { ApiOperation, ApiTags, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BulkCreateRecommendationsDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { AuthGuard } from 'src/guards/authGuard';
import { UserRole } from 'src/masterData/userRoles.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RecommendationStatus, RecommendationAction } from 'src/entities/recommendation/applicationControlRecommendation.entity';
import { PaginatedResponse } from 'src/common/dto/paginatedResponse.dto';
import { GenerateRecommendationsAiDto } from './dto/generate-recommendations-ai.dto';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) { }

    @Get("")
    @ApiOperation({ summary: 'Get recommendations for an application' })
    @ApiQuery({ name: 'applicationId', required: true, description: 'Application ID' })
    @ApiQuery({ name: 'standardId', required: false, description: 'Standard ID' })
    @ApiQuery({ name: 'controlId', required: false, description: 'Control ID' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10)', type: Number })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns paginated recommendations',
        type: PaginatedResponse
    })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.AUDITOR)
    async getRecommendations(
        @Query('applicationId') applicationId: number,
        @Query('standardId') standardId?: number,
        @Query('controlId') controlId?: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.recommendationService.getRecommendations({
            applicationId,
            standardId,
            controlId,
            page,
            limit
        });
    }

    @Get('/filtered')
    @ApiOperation({ summary: 'Get filtered recommendations using direct control ID' })
    @ApiQuery({ name: 'applicationId', required: true, description: 'Application ID' })
    @ApiQuery({ name: 'controlId', required: false, description: 'Direct control ID from recommendation table' })
    @ApiQuery({ name: 'standardId', required: false, description: 'Standard ID' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10)', type: Number })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns paginated filtered recommendations',
        type: PaginatedResponse
    })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.AUDITOR)
    async getFilteredRecommendations(
        @Query('applicationId') applicationId: number,
        @Query('controlId') controlId?: number,
        @Query('standardId') standardId?: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.recommendationService.getFilteredRecommendations({
            applicationId,
            controlId,
            standardId,
            page,
            limit
        });
    }

    @Post(':applicationId/control/:controlId/standard/:standardId')
    @ApiOperation({ summary: 'Add recommendations for a control' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @ApiParam({ name: 'controlId', description: 'Control ID' })
    @ApiParam({ name: 'standardId', description: 'Standard ID' })
    @ApiResponse({ status: 201, description: 'Recommendations added successfully' })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
    async addRecommendations(
        @Param('applicationId') applicationId: number,
        @Param('controlId') controlId: number,
        @Param('standardId') standardId: number,
        @Body('recommendations') recommendations: string[]
    ) {
        return this.recommendationService.bulkAddRecommendations({
            applicationId,
            controlId,
            standardId,
            recommendations
        });
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update recommendation status' })
    @ApiParam({ name: 'id', description: 'Recommendation ID' })
    @ApiResponse({ status: 200, description: 'Status updated successfully' })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
    async updateRecommendationStatus(
        @Param('id') id: number,
        @Body() updateDto: UpdateRecommendationDto
    ) {
        return this.recommendationService.updateRecommendationStatus(
            id,
            updateDto.status,
            updateDto.action
        );
    }

    @Post(':applicationId/generate-ai')
    @ApiOperation({ summary: 'Generate AI-powered recommendations for a control' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @ApiResponse({ status: 201, description: 'Recommendations generated successfully' })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    async generateRecommendationsAi(
        @Param('applicationId') applicationId: number,
        @Body() dto: GenerateRecommendationsAiDto
    ) {
        const recommendations = await this.recommendationService.generateRecommendationsForControl(
            applicationId,
            dto.controlId,
            dto.standardId
        );
        return StandardResponse.success('Recommendations generated successfully', recommendations);
    }

    @Post(':id/enhance-steps')
    @ApiOperation({ summary: 'Enhance recommendation with AI-generated implementation steps' })
    @ApiParam({ name: 'id', description: 'Recommendation ID' })
    @ApiResponse({ status: 200, description: 'Implementation steps generated successfully' })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    async enhanceRecommendationSteps(
        @Param('id') id: number
    ) {
        const steps = await this.recommendationService.enhanceRecommendationWithSteps(id);
        return StandardResponse.success('Implementation steps generated successfully', { steps });
    }

    @Post(':applicationId/prioritize')
    @ApiOperation({ summary: 'Prioritize recommendations using AI' })
    @ApiParam({ name: 'applicationId', description: 'Application ID' })
    @ApiResponse({ status: 200, description: 'Recommendations prioritized successfully' })
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    async prioritizeRecommendations(
        @Param('applicationId') applicationId: number,
        @Body('recommendationIds') recommendationIds: number[]
    ) {
        if (!Array.isArray(recommendationIds) || recommendationIds.length === 0) {
            throw new BadRequestException('recommendationIds must be a non-empty array');
        }
        const priorities = await this.recommendationService.prioritizeRecommendations(
            applicationId,
            recommendationIds
        );
        return StandardResponse.success('Recommendations prioritized successfully', priorities);
    }
}
