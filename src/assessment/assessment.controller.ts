import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { AuthGuard } from 'src/guards/authGuard';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import * as metadata from '../common/metadata';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentService } from './createAssessment.service';
import { CreateTrusCenter } from './service/createTrustCenter.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
const userRoles = metadata['userRoles'];

@Controller('assessments')
@ApiTags('Assessment')
@UseInterceptors(SnakeCaseInterceptor)
@ApiBearerAuth('JWT-auth')
export class AssessmentController {
    constructor(
        private assessmentSvc: AssessmentService,
        private readonly createAssessmentService: CreateAssessmentService,
        private readonly createTrustCenter: CreateTrusCenter
    ) { }
    //post create assessment,
    //fetch assessments,
    //delete assessment

    @Post('')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'testTittle' },
                application_id: { type: 'number', example: 1 },
                frameworks: {
                    type: 'array',
                    items: {
                        type: 'number'
                    },
                    example: [1, 2, 3]
                },
                template_id: { type: 'number', example: 1 },
            }
        }
    })
    async createAssessment(@Request() req: any,) {
        const message = await this.createAssessmentService.createAssessment(req['user_data'], req.body);
        return StandardResponse.success("success", { data: message });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(TransformInterceptor)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiResponse({
        status: 200,
        description: 'Assessment deleted successfully',
        schema: {
            properties: {
                code: {
                    type: 'number',
                    example: 200
                },
                message: {
                    type: 'string',
                    example: 'success'
                }
            }
        }
    })
    async deleteAssessment(@Request() req: any, @Param('id') id: number) {
        const message = await this.assessmentSvc.delete(req['user_data'], req.params.id);
        return StandardResponse.success("success", message);

    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(TransformInterceptor)
    async updateAssessment(@Request() req: any, @Param('id') id: number) {
        const message = this.createAssessmentService.update(req['user_data'], id, req.body);
        return StandardResponse.success("success", message);

    }

    @Get('')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessments(
        @Request() req: any,
        @Query('assessment_id') assessment_id: number,
        @Query('appId') application_id: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;

        const result = await this.assessmentSvc.fetchAssessments(req['user_data'], { assessment_id, application_id: +application_id, limit, offset });

        return StandardResponse.successWithTotal("Success", {
            assessments: result.assessments,
        }, { total: result.totalCount, limit, offset });
    }

    @Get(':assessment_id/details')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async getAssessmentDetail(@Request() req: any, @Param('assessment_id') assessment_id: number) {
        const assessment = await this.assessmentSvc.getAssessmentDetail(req['user_data'], assessment_id);
        return StandardResponse.success("Success", assessment);
    }


    @Get('status/:assessment_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsStatusById(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
    ) {
        // Fetch the assessment status from the service
        const assessmentsStatus: string = await this.assessmentSvc.fetchAssessmentsStatusById(req['user_data'], { assessment_id });

        // Return response with assessmentsStatus in the data field
        return StandardResponse.success("Success", assessmentsStatus);
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsStatus(
        @Request() req: any,
        @Query('assessment_id') assessment_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;

        // Fetch assessments and the total count
        const [assessments, total]: [{ id: number; status: string }[], number] = await this.assessmentSvc.fetchAssessmentsStatus(req['user_data'], { limit, offset });

        // Transform to include only id and status
        const formattedAssessments = assessments.map(assessment => ({
            id: assessment.id,
            status: assessment.status,
        }));

        // Return response with id, status, and total count
        return StandardResponse.successWithTotal("Success", formattedAssessments, { total, limit, offset });
    }


    @Get('selectedStandards')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async getOrganizationSelectedStandards(@Request() req: any) {
        return this.assessmentSvc.getStandardByOrgId(req['user_data']);
    }

    @Get('customer/standards')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async getcustomerSelectedStandards(@Request() req: any, @Query('organizationId') organizationId?: string) {
        return this.assessmentSvc.getStandardByCustomerId(req['user_data'], organizationId);
    }


    @Get('selectedTemplate')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    async getOrganizationSelectedTemplates(@Request() req: any, @Query('standardId') standardId?: string, @Query('entityType') entityType?: string,) {
        return this.assessmentSvc.getTemplateByOrgId(req['user_data'], standardId, entityType);
    }

    @Post('/assessments-outline')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    async createAssessmentOutline(@Request() req: any,) {
        return this.assessmentSvc.assessmentOutline(req['user_data'], req.body);
    }


    @Get(':asssessment_id/assessment-outline')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsOutline(
        @Request() req: any,
        @Param('asssessment_id') assessment_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;
        const [assessmentsOutl, total]: [AssessmentOutline[], number] = await this.assessmentSvc.fetchAssessmentsOutline(req['user_data'], { assessment_id, limit, offset });
        return StandardResponse.successWithTotal("Success", assessmentsOutl, { total, limit, offset });
    }


    @Get(':assessment_id/assessment-sections/:section_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsSection(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
    ) {
        const assessmentSec = await this.assessmentSvc.fetchAssessmentsSec(
            req['user_data'],
            { assessment_id, section_id }
        );

        return StandardResponse.success("Success", {
            data: assessmentSec,
        });
    }


    @Get(':assessment_id/assessment-sections')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async getAssessmentsSection(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Query('limit') limit: number = 10,
        @Query('offset') offset: number = 0,
    ) {
        const { tenant_id: orgId, userId } = req['user_data'];

        // Fetch the assessment sections with pagination
        const { sections: assessmentsSec, total } = await this.assessmentSvc.fetchAssessmentsSecList(
            { tenant_id: orgId, userId },
            { assessment_id, limit, offset }
        );

        // Return the standard response
        return StandardResponse.successWithTotal("Success", assessmentsSec, { total, limit, offset });
    }


    @Get(':asssessment_id/assessments-history')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsHistory(
        @Request() req: any,
        @Param('asssessment_id') assessment_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;
        const [assessmentsHistory, total]: [AssessmentHistory[], number] = await this.assessmentSvc.fetchAssessmentsHistory(req['user_data'], { assessment_id, limit, offset });
        return StandardResponse.successWithTotal("Success", assessmentsHistory, { total, limit, offset });
    }

    @Get(':asssessment_id/assessment-sections/:section_id/assessments-section-history')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsSectionHistory(
        @Request() req: any,
        @Param('asssessment_id') assessment_id: number,
        @Param('section_id') section_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;
        const [assessmentsHistory, total]: [AssessmentSectionsHistory[], number] = await this.assessmentSvc.fetchAssessmentsSectionHistory(req['user_data'], { assessment_id, section_id, limit, offset });
        return StandardResponse.successWithTotal("Success", assessmentsHistory, { total, limit, offset });
    }

    @Get(':assessment_id/assessment-history-list')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsSectionHistoryUsers(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        // Set default values for limit and offset if not provided
        limit = limit || 10;
        offset = offset || 0;

        // Fetch assessments section history details with combined data and total count
        const { combinedData, totalCount } = await this.assessmentSvc.fetchAssessmentsSectionHistoryDetails(
            req['user_data'],
            { assessment_id, limit, offset }
        );

        // Return the response with success status, data, and pagination details
        return StandardResponse.successWithTotal("Success", combinedData, { total: totalCount, limit, offset });
    }


    // @Put(':assessment_id/assessment-sections/:section_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly)
    @UseInterceptors(TransformInterceptor)
    async updateSection(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
        @Query('version') version: number,
        @Body() data: any // Assuming the body contains the content and s3_path
    ) {
        // Call the service to update the section and get the assessment history entry
        const assessmentHistoryEntry: AssessmentSections = await this.assessmentSvc.updateSection(req['user_data'], data, { assessment_id, section_id, version });

        // Return the response without total count
        return StandardResponse.success("Success", assessmentHistoryEntry); // Adjusting to match the updated response
    }


    @Put(':assessment_id/assessment-sections-history/:section_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly)
    @UseInterceptors(TransformInterceptor)
    async updateSectionHistory(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
        @Query('version') version: number
    ) {
        // Ensure `user_data` exists in request
        if (!req['user_data']) {
            throw new ForbiddenException('User data is missing in the request');
        }

        // Call the service to update the section history
        const assessmentHistoryEntry: AssessmentSections = await this.assessmentSvc.updateSectionHistory(
            req['user_data'],
            { assessment_id, section_id, version }
        );

        // Return success response with the updated assessment history entry
        return StandardResponse.success("Success", assessmentHistoryEntry);
    }



    // get user list section id wise

    @Get(':assessment_id/assessment-sections-history/:section_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonl, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async getAssessmentsSectionHistoryUsers(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        // Set default values for limit and offset if not provided
        limit = limit || 10;
        offset = offset || 0;

        // Fetch assessments section history details with combined data and total count
        const { combinedData, totalCount } = await this.assessmentSvc.getAssessmentsSectionHistoryDetails(
            req['user_data'],
            { assessment_id, section_id, limit, offset }
        );

        // Return the response with success status, data, and pagination details
        return StandardResponse.successWithTotal("Success", combinedData, { total: totalCount, limit, offset });
    }


    @Get(':assessment_id/assessment-sections-history/:section_id/assessments-section-history-version')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async getAssessmentsSectionHistoryVersion(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
        @Query('version') version: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;

        // Call service method to fetch history version details
        const result = await this.assessmentSvc.getAssessmentsSectionHistoryVersion(req['user_data'], { assessment_id, section_id, version, limit, offset });

        // Return successful response with data
        return StandardResponse.successWithTotal("Success", result, { total: 1, limit, offset });
    }

    // latest update api for single section
    // for old version apply need to provide the version. 
    @Put(':assessment_id/assessment-sections/:section_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly)
    @UseInterceptors(TransformInterceptor)
    async updateSectionDs(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('section_id') section_id: string,
        @Query('version') version: number,
        @Body() data: any // Assuming the body contains the content and s3_path
    ) {
        // Call the service to update the section and get the assessment history entry
        const assessmentHistoryEntry: AssessmentSections = await this.assessmentSvc.updateSection(req['user_data'], data, { assessment_id, section_id, version });

        // Return the response without total count
        return StandardResponse.success("Success", assessmentHistoryEntry); // Adjusting to match the updated response
    }


    //new apis for getting user list for version history

    @Get(':assessment_id/app_id/:app_id/assessment-sections-history')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async getAssessmentsSectionHistoryUsersByOutline(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('app_id') app_id: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        // Set default values for limit and offset if not provided
        limit = limit || 10;
        offset = offset || 0;

        // Fetch assessments section history details with combined data and total count
        const { combinedData, totalCount } = await this.assessmentSvc.getAssessmentsSectionHistoryDetailsByOutline(
            req['user_data'],
            { assessment_id, app_id, limit, offset }
        );

        // Return the response with success status, data, and pagination details
        return StandardResponse.successWithTotal("Success", combinedData, { total: totalCount, limit, offset });
    }


    //fetching the changed sections list and there there previous content
    @Get(':assessment_id/assessment-sections/:outline_id/assessments-section-history-version')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor)
    @UseInterceptors(TransformInterceptor)
    async fetchAssessmentsSectionHistoryVersion(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Param('outline_id') outline_id: number,
        @Query('version') version: number,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
    ) {
        limit = limit || 10;
        offset = offset || 0;

        // Call service method to fetch history version details
        const result = await this.assessmentSvc.fetchAssessmentsSectionHistoryVersion(req['user_data'], { assessment_id, outline_id, version, limit, offset });

        // Return successful response with data
        return StandardResponse.successWithTotal("Success", result, { total: 1, limit, offset });
    }

    //Update multiple section

    @Put(':assessment_id/assessment-sections')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly)
    @UseInterceptors(TransformInterceptor)
    async updateMultipleSections(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
        @Query('appId') appId: number,
        @Query('version') version: number,
        @Body() data: { sections: { section_id: string; content: any; s3_path?: string }[] }
    ) {
        // Validate request body
        if (!data || !data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
            throw new BadRequestException({
                error: "Invalid Request",
                message: "Request body must contain 'sections' as a non-empty array.",
            });
        }

        // Call the service to update all sections in one go
        const updateResults = await this.assessmentSvc.updateMultipleSections(
            req['user_data'],
            data,
            { assessment_id }
        );

        // Return the response for all updated sections
        return StandardResponse.success("Successfully updated sections", updateResults);
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                app_id: { type: 'number', example: 1 },
            },
            required: ['app_id']
        }
    })
    @Post(':assessment_id/export-to-trust-center')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(TransformInterceptor)
    async exportToTrustCenter(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
    ) {
        await this.createTrustCenter.createTrustCenterPDF(req['user_data'], assessment_id);
    }


    @ApiOperation({
        summary: 'Upload assessment',
        description: 'Uploads an assessment by moving the temporary location to permanent location'
    })
    @ApiParam({
        name: 'assessment_id',
        type: 'number',
        description: 'ID of the assessment to upload',
        required: true
    })
    @ApiResponse({
        status: 200,
        description: 'Assessment uploaded successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Assessment not found or uploaded assessment not found'
    })
    @ApiResponse({
        status: 403,
        description: 'Assessment is locked'
    })
    @Patch(':assessment_id/upload')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor, userRoles.csm_auditor)
    @UseInterceptors(TransformInterceptor)
    async uploadAssessment(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
    ) {
        await this.assessmentSvc.uploadAssessment(req['user_data'], assessment_id);
        return StandardResponse.success("Successfully uploaded assessment");
    }

    @ApiOperation({
        summary: 'Download assessment',
        description: 'Downloads an assessment file'
    })
    @ApiParam({
        name: 'assessment_id', 
        type: 'number',
        description: 'ID of the assessment to download',
        required: true
    })
    @ApiResponse({
        status: 200,
        description: 'Assessment downloaded successfully',
        schema: {
            properties: {
                downloadUrl: {
                    type: 'string',
                    description: 'Signed URL to download the assessment file'
                },
                assessment_id: {
                    type: 'number',
                    description: 'ID of the downloaded assessment'
                },
                name: {
                    type: 'string', 
                    description: 'Name of the assessment file'
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Assessment not found or assessment location not found'
    })
    @ApiResponse({
        status: 403,
        description: 'Assessment is locked'
    })
    @Get(':assessment_id/download')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.super_admin_readonly, userRoles.auditor, userRoles.csm_auditor)
    @UseInterceptors(TransformInterceptor)
    async downloadAssessment(
        @Request() req: any,
        @Param('assessment_id') assessment_id: number,
    ) {
        const response = await this.assessmentSvc.downloadAssessment(req['user_data'], assessment_id);
        return StandardResponse.success("Successfully downloaded assessment", response);
    }

}
