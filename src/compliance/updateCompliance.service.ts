import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { DataSource, In, IsNull, MoreThan, Not, Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";
import { PolicyStatus } from "src/entities/policyDetails.entity";
import { PolicyDetails } from "src/entities/policyDetails.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { RecommendationService } from "src/recommendation/recommendation.service";
@Injectable()
export class UpdateComplianceService {
    private controlsNeedingRecommendations: Array<{appId: number, controlId: number, standardId: number}> = [];

    constructor(
        @InjectRepository(AsyncTask) private readonly asyncTaskRepo: Repository<AsyncTask>,
        private readonly dataSource: DataSource,
        private readonly logger: LoggerService,
        @InjectRepository(PolicyDetails) private readonly policyRepo: Repository<PolicyDetails>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        @InjectRepository(ApplicationControlMapping) private readonly appControlMapRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        @InjectRepository(StandardControlMapping) private readonly standardControlMapRepo: Repository<StandardControlMapping>,
        @InjectRepository(ControlChunkMapping) private readonly controlChunkRepo: Repository<ControlChunkMapping>,
        @InjectRepository(SourceV1) private readonly sourceRepo: Repository<SourceV1>,
        @InjectRepository(SourceVersion) private readonly sourceVersionRepo: Repository<SourceVersion>,
        private readonly aiHelperService: AiHelperService,
        private readonly awsS3ConfigService: AwsS3ConfigService,
        @Inject(forwardRef(() => RecommendationService))
        private readonly recommendationService: RecommendationService
    ) {
    
    }

    async processComplianceV2(message: any): Promise<any> {
        try {
            let body: any = {};

            if(typeof message === 'string') {
                body = JSON.parse(message);
            } else if(typeof message === 'object') {
                body = message;
            } else {
                this.logger.error('Invalid message type');
                throw new Error('Invalid message type');
            }

            const taskId = body.taskId;
            const status = body.status;
            const responsePayload = body;
            this.logger.info('Received SQS message compliance v2:', { taskId, status, responsePayload });

            if (!taskId) {
                this.logger.error('Task ID is missing');
                return;
            }
            
            const asyncTask = await this.asyncTaskRepo.findOne({ where: { id: taskId } });

            if (!asyncTask) {
                this.logger.error(`AsyncTask with id ${taskId} not found`);
                return;
            }

            switch (status) {
                case 'success':
                    asyncTask.status = TaskStatus.PROCESSED;
                    asyncTask.updated_at = new Date();
                    break;
                case 'in_progress':
                    asyncTask.status = TaskStatus.IN_PROCESS;
                    asyncTask.updated_at = new Date();
                    break;
                default:
                    asyncTask.status = TaskStatus.FAILED;
                    asyncTask.updated_at = new Date();
                    break;
            }

            // Check if policy_id exists in the request payload
            const policy_id = asyncTask.request_payload?.policy_id;
            if (policy_id && status === 'success') {
                const policy = await this.policyRepo.findOne({ where: { id: policy_id } });
                if (policy) {
                    policy.status = PolicyStatus.DRAFT;
                    policy.is_locked = false;
                    await this.policyRepo.save(policy);
                    this.logger.info(`Policy ${policy_id} updated with status ${PolicyStatus.DRAFT} and unlocked`);
                } 
            }

            // Recalculate percentage completion and mark compliance as synced after successful compliance processing
            if (status === 'success' && asyncTask.ops === TaskOps.UPDATE_COMPLIANCE) {
                const appId = asyncTask.app_id;
                const standardIds = asyncTask.request_payload?.standardIds || [];
                const updated_at = new Date();
                
                if (appId) {
                    // Mark compliance as no longer pending
                    try {
                        if (standardIds.length > 0) {
                            // Update only specific standards
                            await this.appStandardRepo.update(
                                { app_id: appId, standard_id: In(standardIds) },
                                { have_pending_compliance: false, compliance_updated_at: updated_at }
                            );
                        } else {
                            // Update all standards for the app
                            await this.appStandardRepo.update(
                                { app_id: appId },
                                { have_pending_compliance: false, compliance_updated_at: updated_at }
                            );
                        }
                        this.logger.info(`Marked compliance as synced for app ${appId}`);
                    } catch (error) {
                        this.logger.error(`Error marking compliance as synced: ${error.message}`, error);
                    }
                    
                    // Recalculate percentage completion
                    if (standardIds.length > 0) {
                        try {
                            await this.updateControlFamilyCompleteness(appId, standardIds);
                            this.logger.info(`Percentage completion recalculated for app ${appId} and standards ${standardIds.join(', ')}`);
                        } catch (error) {
                            this.logger.error(`Error recalculating percentage completion: ${error.message}`, error);
                            // Don't fail the entire process if percentage recalculation fails
                        }
                    } else {
                        // If standardIds not in payload, get all standards for the app
                        try {
                            const appStandards = await this.appStandardRepo.find({
                                where: { app_id: appId },
                                select: ['standard_id'],
                            });
                            const allStandardIds = appStandards.map(s => s.standard_id);
                            if (allStandardIds.length > 0) {
                                await this.updateControlFamilyCompleteness(appId, allStandardIds);
                                this.logger.info(`Percentage completion recalculated for app ${appId} and all standards`);
                            }
                        } catch (error) {
                            this.logger.error(`Error recalculating percentage completion: ${error.message}`, error);
                        }
                    }
                }
            }

            await this.asyncTaskRepo.save(asyncTask);
            this.logger.info(`AsyncTask ${taskId} updated with status ${asyncTask.status}`);
        } catch (error) {
            this.logger.error("Error processing compliance message:", error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }

    /**
     * Recalculates and updates percentage completion for each individual control
     * This is called after compliance processing completes to ensure percentages are up to date
     * Uses Gemini AI to analyze source data when available for more accurate percentage calculation per control
     * Provides explanation statements for each control based on LLM analysis
     */
    private async updateControlFamilyCompleteness(
        appId: number,
        standardIds: number[],
    ): Promise<void> {
        // Clear any previous controls needing recommendations
        this.controlsNeedingRecommendations = [];
        
        await this.dataSource.transaction(async (manager) => {
            // Get all active sources for this application
            let sourceTexts: string[] = [];
            try {
                const sources = await manager.find(SourceV1, {
                    where: { app_id: appId, is_active: true, is_available: true },
                    relations: ['current_version_entity'],
                });

                for (const source of sources) {
                    if (source?.current_version_entity?.is_text_available && source.current_version_entity.text_s3_path) {
                        try {
                            const s3Client = this.awsS3ConfigService.getS3();
                            const getCommand = this.awsS3ConfigService.getObjectCommand(source.current_version_entity.text_s3_path);
                            const response = await s3Client.send(getCommand);
                            const bodyContents = await response.Body.transformToByteArray();
                            const text = Buffer.from(bodyContents).toString('utf-8');
                            sourceTexts.push(text);
                            this.logger.log(`Retrieved ${text.length} characters from source ${source.id}`);
                        } catch (error) {
                            this.logger.warn(`Failed to retrieve source text from S3 for source ${source.id}: ${error.message}`);
                        }
                    }
                }

                // Combine all source texts, limit to 200k characters total to avoid token limits
                const combinedText = sourceTexts.join('\n\n---\n\n');
                if (combinedText.length > 200000) {
                    sourceTexts = [combinedText.substring(0, 200000)];
                } else {
                    sourceTexts = [combinedText];
                }

                if (sourceTexts[0]) {
                    this.logger.log(`Total source text available for analysis: ${sourceTexts[0].length} characters`);
                }
            } catch (error) {
                this.logger.warn(`Failed to get sources for LLM analysis: ${error.message}`);
            }

            const sourceText = sourceTexts[0] || null;

            for (const standardId of standardIds) {
                // Get all controls for this standard
                const standardControls = await manager.find(StandardControlMapping, {
                    where: { standard_id: standardId },
                });

                const controlIds = standardControls.map((sc: StandardControlMapping) => sc.control_id);

                if (controlIds.length === 0) {
                    continue;
                }

                // Get all controls with their details
                const controls = await manager.find(Control, {
                    where: { id: In(controlIds), active: true },
                });

                // Get application control mappings
                const appControls = await manager.find(ApplicationControlMapping, {
                    where: {
                        app_id: appId,
                        control_id: In(controlIds),
                    },
                });

                // Process each control individually
                for (const control of controls) {
                    const appControl = appControls.find(ac => ac.control_id === control.id);
                    if (!appControl) {
                        continue;
                    }

                    let percentage = 0;
                    let explanation = '';

                    // Try LLM analysis if source text is available
                    if (sourceText) {
                        try {
                            const prompt = `You are a compliance analyst. Analyze the provided source document against the following compliance control and determine the percentage completion (0-100) and provide a detailed explanation.

Control ID: ${control.control_name}
Control Name: ${control.control_name}
Control Text: ${control.control_text || control.control_long_name || 'N/A'}

Source Document:
${sourceText.substring(0, 150000)}

Based on your analysis of the source document, provide a JSON response with:
{
  "percentage_completion": <number between 0-100>,
  "explanation": "<detailed explanation of how well the source document addresses this control's requirements, what evidence exists, what's missing, and why you assigned this percentage>"
}

Consider:
- How well the document addresses the specific requirements for this control
- Evidence of implementation or coverage in the source
- Completeness of documentation related to this control
- Any gaps or missing elements

Respond ONLY with valid JSON, no additional text.`;

                            const aiResponse = await this.aiHelperService.generateStructuredResponse<{
                                percentage_completion: number;
                                explanation: string;
                            }>(prompt, 'You are an expert compliance analyst. Provide accurate, detailed analysis of control implementation based on source documents.');

                            if (aiResponse && aiResponse.percentage_completion !== undefined) {
                                percentage = Math.max(0, Math.min(100, Math.round(aiResponse.percentage_completion)));
                                explanation = aiResponse.explanation || '';
                                this.logger.log(`LLM calculated ${percentage}% completion for control ${control.control_name}: ${explanation.substring(0, 100)}...`);
                            } else {
                                this.logger.warn(`LLM analysis did not return valid percentage for control ${control.control_name}, falling back to chunk-based calculation`);
                            }
                        } catch (error) {
                            this.logger.warn(`LLM analysis failed for control ${control.control_name}: ${error.message}, falling back to chunk-based calculation`);
                        }
                    }

                    // Fallback to chunk-based calculation if LLM didn't provide a result
                    if (percentage === 0) {
                        const controlChunks = await manager.find(ControlChunkMapping, {
                            where: {
                                app_id: appId,
                                control_id: control.id,
                                is_active: true,
                            },
                        });

                        if (controlChunks.length === 0) {
                            percentage = 0;
                            explanation = 'No source chunks found for this control.';
                        } else {
                            // Calculate average relevance score for this control
                            const relevanceScores = controlChunks
                                .map((cc: ControlChunkMapping) => {
                                    const refData = cc.reference_data as any;
                                    return refData?.relevance_score || 0;
                                })
                                .filter((score: number) => score > 0);

                            const avgRelevance =
                                relevanceScores.length > 0
                                    ? relevanceScores.reduce((a: number, b: number) => a + b, 0) / relevanceScores.length
                                    : 0;

                            percentage = Math.round(avgRelevance);
                            explanation = `Calculated based on ${controlChunks.length} source chunk(s) with average relevance score of ${avgRelevance.toFixed(2)}.`;
                        }
                    }

                    // Update the control with percentage and explanation
                    // Store explanation in implementation_explanation if user hasn't set one
                    const updateData: any = { 
                        percentage_completion: percentage 
                    };

                    // Only update explanation if user hasn't set a custom one
                    // Store as a string for frontend display
                    if (!appControl.user_implementation_explanation && explanation) {
                        // Store as plain text string that the frontend can display directly
                        updateData.implementation_explanation = explanation;
                    }

                    await manager.update(
                        ApplicationControlMapping,
                        { id: appControl.id },
                        updateData,
                    );
                    
                    // If percentage > 0, update status to partially_implemented for controls that are currently
                    // not_implemented or planned, so the percentage will be visible in the view
                    // This only affects controls that haven't been manually set by users
                    let updatedStatus = appControl.implementation_status;
                    if (percentage > 0 && !appControl.user_implementation_status) {
                        if (appControl.implementation_status === ApplicationControlMappingStatus.NOT_IMPLEMENTED ||
                            appControl.implementation_status === ApplicationControlMappingStatus.PLANNED) {
                            updatedStatus = ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED;
                            await manager.update(
                                ApplicationControlMapping,
                                { id: appControl.id },
                                { implementation_status: ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED },
                            );
                        }
                    }

                    // Generate recommendations for controls that need them
                    // Only generate if control is not_implemented or partially_implemented
                    if ((updatedStatus === ApplicationControlMappingStatus.NOT_IMPLEMENTED || 
                         updatedStatus === ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED) &&
                        percentage < 100) {
                        try {
                            // Check if recommendations already exist for this control
                            const existingRecommendations = await manager.query(`
                                SELECT COUNT(*) as count 
                                FROM application_control_recommendation 
                                WHERE application_id = $1 AND control_id = $2 AND standard_id = $3
                            `, [appId, control.id, standardId]);
                            
                            const recCount = parseInt(existingRecommendations[0]?.count || '0');
                            
                            // Only generate if no recommendations exist
                            if (recCount === 0) {
                                this.logger.log(`Will generate recommendations for control ${control.control_name} (${control.id}) after transaction`);
                                // Store the control IDs that need recommendations
                                // We'll generate them after the transaction commits
                                this.controlsNeedingRecommendations.push({
                                    appId,
                                    controlId: control.id,
                                    standardId
                                });
                            }
                        } catch (error) {
                            this.logger.warn(`Failed to check/generate recommendations for control ${control.control_name}: ${error.message}`);
                        }
                    }
                }
            }
        });

        // Generate recommendations after transaction completes
        if (this.controlsNeedingRecommendations.length > 0) {
            this.logger.log(`Generating recommendations for ${this.controlsNeedingRecommendations.length} controls`);
            // Generate recommendations asynchronously to avoid blocking
            this.generateRecommendationsAsync(this.controlsNeedingRecommendations).catch(error => {
                this.logger.error(`Error generating recommendations: ${error.message}`, error);
            });
            // Clear the list for next run
            this.controlsNeedingRecommendations = [];
        }
    }

    /**
     * Generate recommendations asynchronously for controls that need them
     */
    private async generateRecommendationsAsync(
        controls: Array<{appId: number, controlId: number, standardId: number}>
    ): Promise<void> {
        for (const { appId, controlId, standardId } of controls) {
            try {
                await this.recommendationService.generateRecommendationsForControl(
                    appId,
                    controlId,
                    standardId
                );
                this.logger.log(`Generated recommendations for control ${controlId} in app ${appId}`);
            } catch (error) {
                this.logger.warn(`Failed to generate recommendations for control ${controlId}: ${error.message}`);
            }
        }
    }
}
