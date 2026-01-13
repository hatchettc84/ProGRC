import { Controller, Get, Query, UseInterceptors, Post, Body, Patch, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { BulkCreateRecommendationsDto } from 'src/recommendation/dto/create-recommendation.dto';
import { RecommendationService } from 'src/recommendation/recommendation.service';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) { }

    @Post('/')
    @ApiOperation({ summary: 'Bulk add recommendations' })
    async bulkAddRecommendations(
        @Body() body: BulkCreateRecommendationsDto
    ) {
        const params = {
            applicationId: body.applicationId,
            controlId: body.controlId,
            standardId: body.standardId,
            recommendations: body.recommendations
        }
        return await this.recommendationService.bulkAddRecommendations(params);
    }
}
