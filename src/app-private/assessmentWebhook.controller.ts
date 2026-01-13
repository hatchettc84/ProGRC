import { Body, Controller, Post, UseGuards, UseInterceptors, BadRequestException, Patch, Param, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { AssessmentsWebhookService } from "src/assessment/service/assessmentsWebhook.service";
import { AssessmentTypeRequest, AssessmentUpdateTypeRequest, createWebhookAssessmentSection, UpdateAssessmentSectionDto } from "src/assessment/assessment.dto";

@Controller('webhook/assessments')
@UseInterceptors(TransformInterceptor)
@ApiTags('Assessments')
export class AssessmentWebhookController {
    constructor(
        private readonly assessmentsWebhook: AssessmentsWebhookService
    ) { }

    @Post(':assessment_id/appId/:appId')
    //@UseGuards(XApiKeyGuard)
    @ApiSecurity('x-api-key')
    @ApiBody({ type: AssessmentTypeRequest })
    @ApiResponse({
        status: 201,
        description: 'Assessment sections processed successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request data.',
    })
    async assessmentWebhook(
        @Param('assessment_id') assessmentId: number,
        @Param('appId') appId: number,
        @Body() request: AssessmentTypeRequest
    ): Promise<{ message: string; count: number }> {
        if (!request || !request.data || !Array.isArray(request.data)) {
            throw new BadRequestException('Invalid request data. Expected an array of assessment sections.');
        }

        if (request.type === 'assessments') {
            const result = await this.assessmentsWebhook.createAssessment(request.data, assessmentId, appId);
            return {
                message: 'Assessment sections processed successfully.',
                count: result.count,
            };
        } else {
            throw new BadRequestException('Invalid request type.');
        }
    }

    @Patch(':assessment_id/customer_id/:customer_id/appId/:appId')
    @ApiSecurity('x-api-key')
    @ApiBody({ type: AssessmentUpdateTypeRequest })
    @ApiResponse({
        status: 200,
        description: 'Assessment sections updated successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request data.',
    })
    @ApiResponse({
        status: 403,
        description: 'Assessment section not found.',
    })
    async updateAssessmentSection(
        @Param('assessment_id') assessmentId: number,
        @Param('appId') appId: number,
        @Param('customer_id') customerId: string,
        @Body() request: AssessmentUpdateTypeRequest
    ): Promise<{ message: string }> {
        // Validate request type
        if (request.type !== 'updateAssessment') {
            throw new BadRequestException('Invalid request type. Expected "updateAssessment".');
        }

        // Validate data array
        if (!request.data || !Array.isArray(request.data)) {
            throw new BadRequestException('Invalid request data. Expected an array of sections.');
        }

        try {
            // Pass validated data to the service class
            const updatedCount = await this.assessmentsWebhook.updateAssessmentSections(
                request.data, // List of UpdateAssessmentSectionDto
                assessmentId,
                appId,
                customerId
            );

            return {
                message: `Assessment sections updated successfully.`,

            };
        } catch (error) {
            if (error.message === 'Assessment section not found') {
                throw new NotFoundException('Assessment section not found.');
            }
            throw new InternalServerErrorException('Failed to update assessment sections.');
        }
    }

}