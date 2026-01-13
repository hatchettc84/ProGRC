import { AuthenticatedRequest } from "src/common/interfaces";
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Request, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Roles } from "src/decorators/roles.decorator";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { convertToValidAppId } from "src/utils/appIdConverter";
import { RemoveExceptionEnhancementRequest, ReviewedRequest, RiskLevelRequest, SetAdditionalParamReq, SetEvidenceEnhancementRequestV2, SetEvidenceRequestV2, SetExceptionEnhancementRequest, SetExplationEnhancementRequest } from "./controlDetails.dto";
import { ControlEvidenceV2Service } from "./service/controlEvidenceV2.service";
import { ControlExceptionV2Service } from "./service/controlExceptionV2.service";
import { GetComplianceV2Service } from "./service/getComplianceV2.service";
import { GetControlEnhancementV2Service } from "./service/getControlEnhancementV2.service";
import { GetReferenceV2Service } from "./service/getReferenceV2Service.service";
import { GetSourceV2Service } from "./service/getSource.service";
import { GetStandardControlV2Service, ControlResponse } from "./service/getStandardControlV2.service";
import { SetRiskLevelV2Service } from "./service/setRiskLevelV2.service";
import { SyncComplianceV2Service } from "./service/syncComplianceV2.service";
import { GetControlDetailsService } from "./service/getControlDetails.service";
import { User } from "src/entities/user.entity";
import { GetControlEvaluationService } from "./service/getControlEvaluation.service";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UpdateComplianceService } from "./service/updateCompliance.service";
import { LoggerService } from "src/logger/logger.service";

@ApiTags('Compliance V2')
@Controller('compliances')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class ComplianceV2Controller {
    constructor(
        private readonly getComplianceV2Service: GetComplianceV2Service,
        private readonly syncComplianceV2Service: SyncComplianceV2Service,
        private readonly getStandardControlV2Service: GetStandardControlV2Service,
        private readonly getControlenahancementV2Service: GetControlEnhancementV2Service,
        private readonly controlEvidenceV2Service: ControlEvidenceV2Service,
        private readonly controlExceptionV2Service: ControlExceptionV2Service,
        private readonly getSourceService: GetSourceV2Service,
        private readonly getReferenceV2Service: GetReferenceV2Service,
        private readonly setRiskLevelV2Service: SetRiskLevelV2Service,
        private readonly getControlDetailsServices: GetControlDetailsService,
        private readonly getControlEvaluationService: GetControlEvaluationService,
        private readonly updateComplianceService: UpdateComplianceService,
        private readonly logger: LoggerService,
    ) { }

    @Get('')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiQuery({ name: 'appId', description: 'application id', required: true })
    @ApiResponse({
        status: 200,
        description: 'List of compliances for application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '11' },
                            standard_name: { type: 'string', example: 'Fedramp Moderate Baseline' },
                            framework_name: { type: 'string', example: 'NIST 800-53' },
                            control_total: { type: 'number', example: 0 },
                            source_total: { type: 'number', example: 0 },
                            exception_total: { type: 'number', example: 0 },
                            percentage_completion: { type: 'number', example: 0 },
                            used: { type: 'boolean', example: true }
                        }
                    }
                }
            }
        }
    })
    async getCompliances(
        @Req() req: any,
        @Query('appId') strAppId: string
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        return this.getComplianceV2Service.getForApplication(req['user_data'], appId);
    }

    @Get('apps/:appId/pendings')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiQuery({ name: 'standard_id', description: 'standard id', required: false })
    @ApiParam({ name: 'appId', description: 'application id', required: true })
    @ApiResponse({
        status: 200,
        description: 'List of pending compliances for application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        have_pending_compliance: { type: 'boolean', example: false }
                    }
                }
            }
        }
    })
    async havePendingUpdateCompliances(
        @Req() req: any,
        @Param('appId') appId: string,
        @Query('standard_id') standardId: number
    ): Promise<any> {
        const havePendingCompliance: boolean = await this.getComplianceV2Service.havePendingCompliance(
            req['user_data'], convertToValidAppId(appId), standardId);

        return { have_pending_compliance: havePendingCompliance };
    }

    @ApiResponse({
        status: 200,
        description: 'List of compliances for application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '11' },
                            name: { type: 'string', example: 'Fedramp Moderate Baseline' },
                            description: { type: 'string', example: 'NIST 800-53' },
                            control_total: { type: 'number', example: 0 },
                            source_total: { type: 'number', example: 0 },
                            exception_total: { type: 'number', example: 0 },
                            recommendation_count: { type: 'number', example: 0 },
                            percentage_completion: { type: 'number', example: 0 },
                        }
                    }
                }
            }
        }
    })
    @Get('apps/:appId/standards/:standardId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    async getStandardDetails(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('standardId') strStandardId: string,
    ): Promise<void> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const standardId = convertToValidAppId(strStandardId)
        if (!standardId) {
            throw new BadRequestException('standardId is required');
        }
        return this.getComplianceV2Service.getForApplicationStandard(req['user_data'], appId, standardId);
    }

    @Get('apps/:appId/standards/:standardId/sources')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'List of compliances for application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 11 },
                            name: { type: 'string', example: 'source name' },
                            source_type: { type: 'string', example: 'FILE' },
                            source_file: { type: 'string', example: 'http://google.com/source.json' },
                            updated_at: { type: 'string', format: 'date-time', example: '2024-10-07T10:57:16.977Z' },
                        }
                    }
                }
            }
        }
    })
    async getApplicationStandardSource(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('standardId') strStandardId: string,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const standardId = convertToValidAppId(strStandardId)
        if (!standardId) {
            throw new BadRequestException('standardId is required');
        }
        const sources: SourceV1[] = await this.getSourceService.getSourceForApplicationStandard(req['user_data'], appId, standardId);

        return sources.map((source) => {
            return {
                id: source.id,
                name: source.name,
                source_type: source.type_source.name,
                source_file: source.file_bucket_key,
                updated_at: source.updated_at
            }
        })
    }

    @Get('apps/:appId/controls/:controlId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'Control Details',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Account Management' },
                        description: { type: 'string', example: 'The organization manages information system accounts by specifying account types.' },
                        percentage_completion: { type: 'string', example: '0.00' },
                        risk_levels: { type: 'string', example: 'low' },
                        implementation: { type: 'string', example: 'testing implementation' },
                        status: { type: 'string', example: 'implemented' },
                        evidence_document: { type: 'string', example: 'http://google.com/abc.png' },
                        evidence_description: { type: 'string', example: 'already implemented' },
                        enhancement_total: { type: 'number', example: 0 },
                        source_total: { type: 'number', example: 0 },
                        exception_total: { type: 'number', example: 0 },
                        recommendation_count: { type: 'number', example: 0 }
                    }
                }
            }
        }
    })
    async getControlDetails(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('standardId is required');
        }
        return await this.getStandardControlV2Service.getControlDetail(req['user_data'], appId, controlId);
    }

    @Get('apps/:appId/controls/:controlId/references')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'List of compliances for application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 11 },
                            chunk_text: { type: 'string', example: 'chunk text' },
                            source_name: { type: 'string', example: 'source name' },
                            source_file: { type: 'string', example: 'http://google.com/source.json' }
                        }
                    }
                }
            }
        }
    })
    async getApplicationStandardReferences(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
        @Query('childControlId') childControlId: number,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }
        const chunks: SourceChunkMapping[] = await this.getReferenceV2Service.getForApplicationControl(req['user_data'], appId, controlId, childControlId);

        return chunks.map((source) => {
            return {
                id: source.id,
                chunk_text: source.chunk_text,
                source_name: source.source.name,
                source_file: source.source_file,
                updated_at: source.updated_at,
                line_number: source.line_number,
                page_number: source.page_number,
            }
        })
    }

    @Post('apps/:appId/sync')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                skipSourceValidation: { type: 'boolean', description: 'Skip source validation and processing', default: false }
            }
        },
        required: false
    })
    async syncComplianceForApp(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Body() body?: { skipSourceValidation?: boolean }
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);

        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const skipSourceValidation = body?.skipSourceValidation || false;

        // ✅ OPTIMIZATION: Calculate instant scores first for immediate feedback
        try {
            const appStandards = await this.syncComplianceV2Service['appStandardRepo'].find({
                where: { app_id: appId },
                select: ['standard_id'],
            });
            const standardIds = appStandards.map(s => s.standard_id);

            if (standardIds.length > 0) {
                this.logger.log(`[INSTANT SCORING] Calculating instant scores for app ${appId}, standards: ${standardIds.join(', ')}`);
                await this.updateComplianceService.calculateInstantScores(appId, standardIds);
                this.logger.log(`[INSTANT SCORING] Instant scores calculated for app ${appId}`);
            }
        } catch (error) {
            this.logger.warn(`[INSTANT SCORING] Failed to calculate instant scores: ${error.message}`);
            // Continue with queue processing even if instant scoring fails
        }

        // Trigger full LLM analysis in background via queue
        await this.syncComplianceV2Service.syncForApplication(req['user_data'], appId, skipSourceValidation);

        return StandardResponse.success(
            'Compliance sync started successfully. Instant scores applied, LLM refinement running in background.',
            {
                appId,
                message: 'Scores calculated instantly using chunk data. LLM refinement running in background for enhanced accuracy.'
            }
        );
    }

    @Post('apps/:appId/sync-instant')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiOperation({ summary: 'Calculate instant compliance scores using pre-computed chunk data (fast, no LLM)' })
    @ApiResponse({
        status: 200,
        description: 'Instant scores calculated successfully',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Instant compliance scores calculated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        appId: { type: 'number', example: 1 },
                        standardIds: { type: 'array', items: { type: 'number' }, example: [1, 2] },
                        message: { type: 'string', example: 'Scores calculated instantly. LLM refinement running in background.' }
                    }
                }
            }
        }
    })
    async syncComplianceInstant(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Body() data?: { standardIds?: number[] }
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);

        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        // Get standard IDs from body or fetch all for the app
        let standardIds: number[] = [];
        if (data?.standardIds && data.standardIds.length > 0) {
            standardIds = data.standardIds;
        } else {
            const appStandards = await this.syncComplianceV2Service['appStandardRepo'].find({
                where: { app_id: appId },
                select: ['standard_id'],
            });
            standardIds = appStandards.map(s => s.standard_id);
        }

        if (standardIds.length === 0) {
            throw new BadRequestException('No standards found for this application');
        }

        // ✅ Calculate instant scores immediately (uses pre-computed chunk relevance scores)
        await this.updateComplianceService.calculateInstantScores(appId, standardIds);

        // Then trigger full LLM analysis in background via queue
        await this.syncComplianceV2Service.syncForApplication(req['user_data'], appId, true);

        return StandardResponse.success(
            'Instant compliance scores calculated successfully',
            {
                appId,
                standardIds,
                message: 'Scores calculated instantly using chunk data. LLM refinement running in background for enhanced accuracy.'
            }
        );
    }

    @Post('apps/:appId/resync')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiOperation({ summary: 'Resync compliance for specific standards/controls (with instant scoring)' })
    async syncComplianceForSubLevel(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Body() data: { standardIds: number[], type: string, controlIds: number[] }
    ): Promise<any> {
        // ✅ DEBUG: Log request body to diagnose instant scoring issue
        this.logger.log(`[RESYNC DEBUG] Request body: ${JSON.stringify(data)}`);
        
        let { standardIds, type, controlIds } = data;
        
        // ✅ FIX: Handle snake_case from frontend (standard_ids) or camelCase (standardIds)
        if (!standardIds && data && (data as any).standard_ids) {
            standardIds = (data as any).standard_ids;
            this.logger.log(`[RESYNC DEBUG] Converted standard_ids to standardIds: ${JSON.stringify(standardIds)}`);
        }
        
        const appId = convertToValidAppId(strAppId);

        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        this.logger.log(`[RESYNC DEBUG] standardIds: ${JSON.stringify(standardIds)}, length: ${standardIds?.length || 0}`);

        // ✅ FIX: If standardIds is empty/undefined, fetch from app_standards table
        if (!standardIds || standardIds.length === 0) {
            this.logger.log(`[RESYNC DEBUG] standardIds is empty, fetching from app_standards for app ${appId}`);
            try {
                const appStandards = await this.syncComplianceV2Service['appStandardRepo'].find({
                    where: { app_id: appId },
                    select: ['standard_id'],
                });
                standardIds = appStandards.map(s => s.standard_id);
                this.logger.log(`[RESYNC DEBUG] Fetched standardIds from database: ${JSON.stringify(standardIds)}`);
            } catch (error) {
                this.logger.warn(`[RESYNC DEBUG] Failed to fetch standardIds: ${error.message}`);
            }
        }

        // ✅ OPTIMIZATION: Calculate instant scores first for immediate feedback
        if (standardIds && standardIds.length > 0) {
            try {
                this.logger.log(`[INSTANT SCORING] Calculating instant scores for app ${appId}, standards: ${standardIds.join(', ')}`);
                await this.updateComplianceService.calculateInstantScores(appId, standardIds);
                this.logger.log(`[INSTANT SCORING] Instant scores calculated for app ${appId}`);
            } catch (error) {
                this.logger.warn(`[INSTANT SCORING] Failed to calculate instant scores: ${error.message}`);
                // Continue with queue processing even if instant scoring fails
            }
        }

        await this.syncComplianceV2Service.syncForSubLevel(req['user_data'], appId, standardIds, type, controlIds);
        
        return StandardResponse.success(
            'Compliance resync started successfully. Instant scores applied, LLM refinement running in background.',
            { appId, standardIds, type, controlIds }
        );
    }

    @ApiResponse({
        status: 200,
        description: 'Access Control Data',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category_name: { type: 'string', example: 'Access Control' },
                            percentage_completion: { type: 'number', example: 0.36 },
                            total_enhancements: { type: 'number', example: 108 },
                            controls: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', example: 123 },
                                        name: { type: 'string', example: 'Account Management' },
                                        risk_level: { type: 'string', example: 'high' },
                                        enhancement_total: { type: 'number', example: 2 },
                                        percentage_completion: { type: 'number', example: 10.00 },
                                        status: { type: 'string', example: 'not_applicable' },
                                        evidence_document: { type: 'string', example: 'http://google.com/abc.png' },
                                        evidence_description: { type: 'string', example: 'already implemented' },
                                    },
                                },
                            },
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 1 },
                    },
                },
            },
        },
    })
    @Get('apps/:appId/standards/:standardId/family/:familyName/controls')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiParam({ name: 'familyName', description: 'Control family name (e.g., AC, AT, AU)', required: true })
    @ApiResponse({
        status: 200,
        description: 'Get controls by family name for an application and standard',
    })
    async getControlsByFamily(
        @Request() req: AuthenticatedRequest,
        @Param('appId') strAppId: string,
        @Param('standardId') strStandardId: string,
        @Param('familyName') familyName: string,
    ): Promise<StandardResponse<ControlResponse[]>> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const standardId = convertToValidAppId(strStandardId);
        if (!standardId) {
            throw new BadRequestException('standardId is required');
        }
        
        if (!familyName) {
            throw new BadRequestException('familyName is required');
        }

        const controls = await this.getStandardControlV2Service.getControlsByFamily(
            req['user_data'],
            appId,
            standardId,
            familyName
        );

        return StandardResponse.success('Controls retrieved successfully', controls);
    }

    @Get('apps/:appId/standards/:standardId/controls')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    async getComplianceStandardControls(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('standardId') strStandardId: string,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const standardId = convertToValidAppId(strStandardId);
        if (!standardId) {
            throw new BadRequestException('standardId is required');
        }

        const [controls, total] = await this.getStandardControlV2Service.getForApplication(req['user_data'], appId, standardId);

        return StandardResponse.successWithTotal("success", controls, { total });
    }


    @ApiResponse({
        status: 200,
        description: 'Access Control Data',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '36dcf231-bb2f-4269-8ea5-4cd9db73be1b' },
                            name: { type: 'string', example: 'Automated Temporary and Emergency Account Management' },
                            description: {
                                type: 'string',
                                example: 'Automatically [Selection: remove; disable] temporary and emergency accounts after [Assignment: organization-defined time period for each type of account].'
                            },
                            status: { type: 'string', example: 'not_applicable' },
                            exception: { type: 'boolean', example: true },
                            exception_reason: { type: 'string', nullable: true, example: 'exception test' },
                            percentage_completion: { type: 'string', example: '0.00' },
                            asset_total: { type: 'string', example: 0 }
                        },
                    },
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 1 },
                    },
                },
            },
        },
    })
    @Get('apps/:appId/controls/:controlId/exceptions')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    async getComplianceControlExceptions(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const controlId = convertToValidAppId(strControlId);
        if (!controlId) {
            throw new BadRequestException('standardId is required');
        }

        const [controls, total] = await this.getStandardControlV2Service.getControlExceptionForApplication(req['user_data'], appId, controlId);

        return StandardResponse.successWithTotal("success", controls.map((control) => {
            return {
                id: control.id,
                name: control.control.getControlFullName(),
                description: control.control.control_summary,
                status: control.user_implementation_status || control.implementation_status,
                exception: control.isException(),
                exception_reason: control.exception_reason,
                percentage_completion: control.getPercentageStatus(),
                source_total: control.source_total,
            }
        }), { total });
    }


    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiQuery({ name: 'enhancementId', description: 'Enhancement ID' })
    @ApiResponse({
        status: 200,
        description: 'List of standard control enhancements',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '4315da5a-2e4b-4baf-8044-bd339ec4ca10' },
                            name: { type: 'string', example: 'Automated System Account Management' },
                            description: { type: 'string', example: 'Support the management of system accounts using [Assignment: organization-defined automated mechanisms].' },
                            implementation: { type: 'string', example: 'testing implementation' },
                            status: { type: 'string', example: 'implemented' },
                            exception: { type: 'boolean', example: false },
                            exception_reason: { type: 'string', nullable: true, example: null },
                            risk_levels: { type: 'string', example: 'low' },
                            percentage_completion: { type: 'string', example: '0.00' },
                            evidence_document: { type: 'string', nullable: true, example: null },
                            evidence_description: { type: 'string', nullable: true, example: null },
                            source_total: { type: 'number', example: 0 },
                            created_at: { type: 'string', example: '2021-06-09T08:45:01.000Z' }
                        }
                    }
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 2 }
                    }
                }
            }
        }
    })
    @Get('apps/:appId/controls/:controlId/enhancements')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    async getControlEnhancements(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
        @Query('enhancementId') enhancementId: string,
    ) {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }
        const [enhancements, total, evidences] = await this.getControlenahancementV2Service.getForControl(req['user_data'], appId, controlId, enhancementId);

        return StandardResponse.successWithTotal("success", enhancements.map((enhancement) => {
            return {
                id: enhancement.id,
                name: enhancement.control_name + " - " + enhancement.control_long_name,
                description: enhancement.control_summary,
                implementation: enhancement.implementation_explanation,
                status: enhancement.implementation_status,
                exception: enhancement.exception ? true : false,
                exception_reason: enhancement.exception_reason,
                risk_level: enhancement.risk_level,
                percentage_completion: Number(enhancement.deno) ? Number((Number(enhancement.num) / Number(enhancement.deno)).toFixed(2)) : 0,
                evidences: evidences.filter((evidence) => evidence.application_control_enhancement_id === enhancement.id),
                created_at: enhancement.created_at,
                updated_at: enhancement.updated_at,
                is_reviewed: enhancement.is_reviewed,
                is_synced: new Date(enhancement.updated_at) > new Date(enhancement.source_updated_at),
                control_id: enhancement.control_id,

            }
        }), { total })
    }

    @Post('apps/:appId/evidences')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async insertComplianceEvidence(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Body() data: SetEvidenceRequestV2,
    ) {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        await this.controlEvidenceV2Service.setEvidenceForControl(req['user_data'], appId, data);
    }

    @Put('apps/:appId/controls/:controlId/evidences/:evidenceId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async updateComplianceEvidence(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
        @Param('evidenceId') evidenceId: number,
        @Body() data: SetEvidenceRequestV2,
    ) {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }

        await this.controlEvidenceV2Service.updateEvidenceForControl(req['user_data'], appId, controlId, data, evidenceId);
    }

    @Delete('apps/:appId/controls/:controlId/evidences')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async removeComplianceEvidence(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
    ) {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }

        await this.controlEvidenceV2Service.removeControlEvidence(req['user_data'], appId, controlId);
    }

    @Delete('apps/:appId/evidence/:evidenceId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async deleteComplianceEvidence(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('evidenceId') evidenceId: number,
    ) {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        await this.controlEvidenceV2Service.deleteControlEvidence(req['user_data'], appId, evidenceId);
    }

    @Put('apps/:appId/controls/exceptions')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                exception_reason: { type: 'string', example: 'exception test' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Set exception enhancement',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async setExceptionEnhancement(
        @Req() req: any,
        @Param('appId') appId: string,
        @Body() data: SetExceptionEnhancementRequest,
    ): Promise<void> {
        await this.controlExceptionV2Service.setEnhancementsException(req['user_data'], convertToValidAppId(appId), data);
    }

    @Delete('apps/:appId/controls/exceptions')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Delete exception of enhancement',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async deleteExceptionEnhancement(
        @Req() req: any,
        @Param('appId') appId: string,
        @Body() data: RemoveExceptionEnhancementRequest,
    ): Promise<void> {
        await this.controlExceptionV2Service.removeException(req['user_data'], convertToValidAppId(appId), data.ids);
    }

    @Put('apps/:appId/controls/risk-levels')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                risk_levels: { type: 'string', example: 'low,moderate,high' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Update risk levels',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async updateControlRiskLevel(
        @Req() req: any,
        @Param('appId') appId: string,
        @Body() data: RiskLevelRequest,
    ): Promise<void> {
        await this.setRiskLevelV2Service.setForApplicationControls(req['user_data'], convertToValidAppId(appId), data.ids, data.riskLevels);
    }

    @Get('apps/:appId/isSynced')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async isSynced(@Req() req: any, @Param('appId') appId: string, @Query('standardId') standardId: number, @Query('controlId') controlId: number): Promise<any> {
        const isSynced = await this.syncComplianceV2Service.isSynced(convertToValidAppId(appId), standardId, controlId);
        return StandardResponse.success("success", { isSynced: isSynced });
    }


    @Put('apps/:appId/controls/reviewed')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                is_reviewed: { type: 'boolean', example: 'false' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Update review status',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async updateControlReviewStatus(
        @Req() req: any,
        @Param('appId') appId: string,
        @Body() data: ReviewedRequest,
    ): Promise<void> {
        await this.setRiskLevelV2Service.setReviewedStatusForApplicationControls(req['user_data'], convertToValidAppId(appId), data.ids, data.isReviewed);
    }



    @Get('apps/:appId/standard/:standardId/controls/:controlId/controlData')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'Control Data',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        controlText: { type: 'string', example: 'controlText' },
                        discussion: { type: 'string', example: 'Management' },
                        additionalParameters: { type: 'string', example: 'Ac-1' },

                    }
                }
            }
        }
    })
    async getControlData(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('controlId') strControlId: string,
        @Param('standardId') strStandardId: string,

    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }

        const standardId = convertToValidAppId(strStandardId)
        if (!controlId) {
            throw new BadRequestException('standardId is required');
        }
        return await this.getControlDetailsServices.getControlDetails(req['user_data'], appId, standardId, controlId);
    }


    @Put('apps/:appId/implementationData')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                user_implementation_status: { type: 'string', example: 'implemented' },
                user_implementation_explation: { type: 'text', example: 'test-for ' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Set exception user implementation status/explanation',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async setExplationStatusEnhancement(
        @Req() req: any,
        @Param('appId') appId: string,
        @Body() data: SetExplationEnhancementRequest,
    ): Promise<void> {
        await this.getControlenahancementV2Service.updateStatusAndExplanation(req['user_data'], convertToValidAppId(appId), data);
    }

    @Put('apps/:appId/standard/:standardId/additionalParameter')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                user_additional_parameters: { type: 'string', example: 'AC-1' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Set exception user additional parameters',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            }
        }
    })
    async setUserDefinedAdditionalParam(
        @Req() req: any,
        @Param('appId') appId: string,
        @Param('standardId') standardId: string,
        @Body() data: SetAdditionalParamReq,
    ): Promise<void> {
        await this.getControlenahancementV2Service.updateUserAddtionalParameter(req['user_data'], convertToValidAppId(appId), convertToValidAppId(standardId), data);
    }


    @Post('apps/:appId/evaluation')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiOperation({ summary: 'Evaluate compliance controls' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                standardIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of standard IDs to evaluate',
                },
                controlIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of control IDs to evaluate',
                },
                type: {
                    type: 'string',
                    enum: ['CONTROL', 'ENHANCEMENT', 'STANDARD'],
                    description: 'Type of evaluation',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Evaluation started successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    async syncEvaluation(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Body() data: { standardIds?: number[], type?: string, controlIds?: number[] }
    ): Promise<StandardResponse<{ message: string }>> {
        const { standardIds = [], type, controlIds = [] } = data;
        const appId = convertToValidAppId(strAppId);

        if (!appId) {
            throw new BadRequestException('appId is required');
        }

        // Validate that at least standardIds or controlIds are provided
        if ((!standardIds || standardIds.length === 0) && (!controlIds || controlIds.length === 0)) {
            throw new BadRequestException('At least one of standardIds or controlIds must be provided');
        }

        try {
            await this.syncComplianceV2Service.evaluateControls(
                req['user_data'],
                appId,
                standardIds || [],
                type || null,
                controlIds || []
            );
            return StandardResponse.success('Compliance evaluation started successfully', { message: 'Evaluation queued' });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Failed to start compliance evaluation');
        }
    }

    @Get('apps/:appId/standard/:standardId/controls/:controlId/evaluation')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'Control Evaluation Results',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    implementation_id: { type: 'number', example: 123 },
                    app_id: { type: 'number', example: 456 },
                    standard_id: { type: 'number', example: 789 },
                    control_id: { type: 'number', example: 101 },
                    requirement: { type: 'string', example: 'Requirement text' },
                    created_at: { type: 'string', format: 'date-time', example: '2025-03-18T10:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2025-03-18T10:00:00Z' },
                    explanation: { type: 'string', example: 'Explanation text' },
                    customer_id: { type: 'string', example: 'customer123' },
                    status: { type: 'string', example: 'Pass' },
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async getApplicationControlEvaluation(
        @Req() req: any,
        @Param('appId') strAppId: string,
        @Param('standardId') standardId: string,
        @Param('controlId') strControlId: string,
        @Query('childControlId') childControlId: number,
    ): Promise<any> {
        const appId = convertToValidAppId(strAppId);
        if (!appId) {
            throw new BadRequestException('appId is required');
        }
        const controlId = convertToValidAppId(strControlId)
        if (!controlId) {
            throw new BadRequestException('controlId is required');
        }

        const standard_id = convertToValidAppId(standardId)
        if (!standard_id) {
            throw new BadRequestException('controlId is required');
        }

        const evaluationResult: ControlEvaluationResult[] = await this.getControlEvaluationService.getForControlEvaluation(req['user_data'], appId, standard_id, controlId, childControlId);

        return evaluationResult;
    }

    @Get('standards/:standardId/controls')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiOperation({ summary: 'Get controls for a standard' })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiResponse({
        status: 200,
        description: 'List of controls for the standard',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            standard_id: { type: 'number', example: 1 },
                            control_id: { type: 'number', example: 1 },
                            additional_selection_parameters: { type: 'string', example: 'Parameter 1' },
                            additional_guidance: { type: 'string', example: 'Guidance text' },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                            control: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    name: { type: 'string', example: 'Control Name' },
                                    summary: { type: 'string', example: 'Control Summary' },
                                    description: { type: 'string', example: 'Control Description' },
                                    category: { type: 'string', example: 'Access Control' },
                                    family: { type: 'string', example: 'AC' },
                                    number: { type: 'string', example: 'AC-1' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getControlsByStandard(
        @Param('standardId') strStandardId: string,
    ): Promise<any> {
        const standardId = convertToValidAppId(strStandardId);
        if (!standardId) {
            throw new BadRequestException('standardId is required');
        }

        const controls = await this.getComplianceV2Service.getControlsByStandard(standardId);
        return StandardResponse.success('Controls retrieved successfully', controls);
    }

    @Get('apps/:appId/standards/:standardId/controls/:controlId/ai/suggest-evidence')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    @ApiOperation({ summary: 'Get AI-suggested evidence types for a control' })
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiParam({ name: 'controlId', description: 'Control ID', required: true })
    @ApiResponse({ status: 200, description: 'Evidence types suggested successfully' })
    async suggestEvidenceTypes(
        @Param('appId') appId: number,
        @Param('standardId') standardId: number,
        @Param('controlId') controlId: number,
    ) {
        const evidenceTypes = await this.getControlEvaluationService.suggestEvidenceTypes(
            appId,
            standardId,
            controlId
        );
        return StandardResponse.success('Evidence types suggested successfully', evidenceTypes);
    }

    @Post('apps/:appId/controls/:controlId/ai/evaluate-evidence')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM, UserRole.AUDITOR)
    @ApiOperation({ summary: 'Evaluate evidence quality using AI' })
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'controlId', description: 'Control ID', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                evidence_description: { type: 'string' },
                evidence_type: { type: 'string' },
            },
            required: ['evidence_description'],
        },
    })
    @ApiResponse({ status: 200, description: 'Evidence evaluated successfully' })
    async evaluateEvidenceQuality(
        @Param('appId') appId: number,
        @Param('controlId') controlId: number,
        @Body('evidence_description') evidenceDescription: string,
        @Body('evidence_type') evidenceType?: string,
    ) {
        const evaluation = await this.getControlEvaluationService.evaluateEvidenceQuality(
            appId,
            controlId,
            evidenceDescription,
            evidenceType
        );
        return StandardResponse.success('Evidence evaluated successfully', evaluation);
    }

    @Get('apps/:appId/standards/:standardId/controls/:controlId/ai/evaluation-narrative')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM, UserRole.AUDITOR)
    @ApiOperation({ summary: 'Generate AI-powered evaluation narrative' })
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiParam({ name: 'controlId', description: 'Control ID', required: true })
    @ApiResponse({ status: 200, description: 'Evaluation narrative generated successfully' })
    async generateEvaluationNarrative(
        @Param('appId') appId: number,
        @Param('standardId') standardId: number,
        @Param('controlId') controlId: number,
    ) {
        const narrative = await this.getControlEvaluationService.generateEvaluationNarrative(
            appId,
            standardId,
            controlId
        );
        return StandardResponse.success('Evaluation narrative generated successfully', { narrative });
    }

    @Get('apps/:appId/standards/:standardId/controls/:controlId/ai/missing-evidence')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.CSM)
    @ApiOperation({ summary: 'Identify missing evidence using AI' })
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiParam({ name: 'controlId', description: 'Control ID', required: true })
    @ApiResponse({ status: 200, description: 'Missing evidence identified successfully' })
    async identifyMissingEvidence(
        @Param('appId') appId: number,
        @Param('standardId') standardId: number,
        @Param('controlId') controlId: number,
    ) {
        const missingEvidence = await this.getControlEvaluationService.identifyMissingEvidence(
            appId,
            standardId,
            controlId
        );
        return StandardResponse.success('Missing evidence identified successfully', missingEvidence);
    }
}
