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
import { PromptVariablesService } from '../prompts/prompt-variables.service';
import { getPromptForControl } from '../prompts/control-prompts';
import { App } from 'src/entities/app.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { LLMOutputValidatorService } from '../validation/llm-output-validator.service';
import { EvidenceSuggestionService } from '../validation/evidence-suggestion.service';
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
        private readonly recommendationService: RecommendationService,
        private readonly promptVariablesService: PromptVariablesService,
        @InjectRepository(App) private readonly appRepo: Repository<App>,
        @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
        private readonly llmOutputValidator: LLMOutputValidatorService,
        private readonly evidenceSuggestionService: EvidenceSuggestionService,
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
     * ✅ OPTIMIZATION: Instant scoring using pre-computed chunk relevance scores
     * This method calculates compliance scores instantly using existing ControlChunkMapping data
     * No LLM calls required - uses relevance scores already computed during document processing
     * Returns immediately, then LLM refinement can run in background
     */
    async calculateInstantScores(
        appId: number,
        standardIds: number[],
    ): Promise<void> {
        this.logger.log(`[INSTANT SCORING] Calculating instant scores for app ${appId}, standards: ${standardIds.join(', ')}`);
        const startTime = Date.now();

        await this.dataSource.transaction(async (manager) => {
            // Process all standards in parallel for maximum speed
            await Promise.all(
                standardIds.map(standardId =>
                    this.calculateInstantScoresForStandard(manager, appId, standardId)
                        .catch(error => {
                            this.logger.error(`[INSTANT SCORING] Error processing standard ${standardId}: ${error.message}`, error);
                            return null;
                        })
                )
            );
        });

        const duration = Date.now() - startTime;
        this.logger.log(`[INSTANT SCORING] Completed in ${duration}ms for app ${appId}`);
    }

    /**
     * Calculate instant scores for a single standard using chunk relevance scores
     */
    private async calculateInstantScoresForStandard(
        manager: any,
        appId: number,
        standardId: number
    ): Promise<void> {
        // Get all controls for this standard
        const standardControls = await manager.find(StandardControlMapping, {
            where: { standard_id: standardId },
        });

        if (standardControls.length === 0) {
            return;
        }

        const controlIds = standardControls.map((sc: StandardControlMapping) => sc.control_id);

        // Get all control chunks with relevance scores (already computed)
        const controlChunks = await manager.find(ControlChunkMapping, {
            where: {
                app_id: appId,
                control_id: In(controlIds),
                is_active: true,
            },
        });

        // Group chunks by control_id and calculate average relevance score
        const controlScores = new Map<number, { total: number; count: number }>();

        controlChunks.forEach((chunk: ControlChunkMapping) => {
            const refData = chunk.reference_data as any;
            const relevanceScore = refData?.relevance_score || 0;

            if (relevanceScore > 0) {
                const existing = controlScores.get(chunk.control_id) || { total: 0, count: 0 };
                controlScores.set(chunk.control_id, {
                    total: existing.total + relevanceScore,
                    count: existing.count + 1,
                });
            }
        });

        // Get all application control mappings for this standard
        const appControls = await manager.find(ApplicationControlMapping, {
            where: {
                app_id: appId,
                control_id: In(controlIds),
            },
        });

        // Update all controls with calculated percentages
        const updatePromises = appControls.map(async (appControl: ApplicationControlMapping) => {
            const scoreData = controlScores.get(appControl.control_id);
            
            if (scoreData && scoreData.count > 0) {
                const percentage = Math.max(0, Math.min(100, Math.round(scoreData.total / scoreData.count)));
                
                // Only update if user hasn't manually set a percentage
                if (!appControl.user_implementation_explanation) {
                    await manager.update(
                        ApplicationControlMapping,
                        { id: appControl.id },
                        {
                            percentage_completion: percentage,
                            implementation_explanation: `Calculated from ${scoreData.count} source chunk(s) with average relevance score of ${(scoreData.total / scoreData.count).toFixed(2)}.`,
                        }
                    );
                } else {
                    // Still update percentage even if user has explanation
                    await manager.update(
                        ApplicationControlMapping,
                        { id: appControl.id },
                        { percentage_completion: percentage }
                    );
                }
            } else {
                // No chunks found, set to 0
                if (!appControl.user_implementation_explanation) {
                    await manager.update(
                        ApplicationControlMapping,
                        { id: appControl.id },
                        {
                            percentage_completion: 0,
                            implementation_explanation: 'No source chunks found for this control.',
                        }
                    );
                } else {
                    await manager.update(
                        ApplicationControlMapping,
                        { id: appControl.id },
                        { percentage_completion: 0 }
                    );
                }
            }
        });

        await Promise.all(updatePromises);
        this.logger.log(`[INSTANT SCORING] Updated ${appControls.length} controls for standard ${standardId}`);
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
            // ✅ OPTIMIZATION: Reduced source text size for faster LLM processing
            const reducedSourceText = sourceText ? sourceText.substring(0, 50000) : null; // Reduced from 75k to 50k for faster processing

            // Process standards in parallel for better performance
            await Promise.all(
                standardIds.map(standardId =>
                    this.processStandardControls(
                        manager,
                        appId,
                        standardId,
                        reducedSourceText
                    ).catch(error => {
                        this.logger.error(`Error processing standard ${standardId}: ${error.message}`, error);
                        return null;
                    })
                )
            );
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
     * Process all controls for a single standard
     */
    private async processStandardControls(
        manager: any,
        appId: number,
        standardId: number,
        sourceText: string | null
    ): Promise<void> {
        // Get all controls for this standard
        const standardControls = await manager.find(StandardControlMapping, {
            where: { standard_id: standardId },
        });

        const controlIds = standardControls.map((sc: StandardControlMapping) => sc.control_id);

        if (controlIds.length === 0) {
            return;
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

        // Create control processing tasks
        const controlTasks = controls
            .map(control => {
                const appControl = appControls.find(ac => ac.control_id === control.id);
                return appControl ? { control, appControl } : null;
            })
            .filter(Boolean) as Array<{ control: Control; appControl: ApplicationControlMapping }>;

        if (controlTasks.length === 0) {
            return;
        }

        const totalControls = controlTasks.length;
        this.logger.log(`Processing ${totalControls} controls for standard ${standardId}`);

        // ✅ OPTIMIZATION: Increased batch sizes for faster processing
        // Group controls into LLM batches (analyze 20 controls per LLM API call - increased from 10)
        const LLM_BATCH_SIZE = 20; // Controls per LLM API call (increased from 10)
        const PARALLEL_BATCHES = 24; // Number of LLM batches to process concurrently (increased from 12)
        
        // Create LLM batches
        const llmBatches: Array<Array<{ control: Control; appControl: ApplicationControlMapping }>> = [];
        for (let i = 0; i < controlTasks.length; i += LLM_BATCH_SIZE) {
            llmBatches.push(controlTasks.slice(i, i + LLM_BATCH_SIZE));
        }

        this.logger.log(`Grouped ${totalControls} controls into ${llmBatches.length} LLM batches (${LLM_BATCH_SIZE} controls per batch)`);

        // Process LLM batches in parallel groups
        for (let i = 0; i < llmBatches.length; i += PARALLEL_BATCHES) {
            const parallelGroup = llmBatches.slice(i, i + PARALLEL_BATCHES);
            const groupNumber = Math.floor(i / PARALLEL_BATCHES) + 1;
            const totalGroups = Math.ceil(llmBatches.length / PARALLEL_BATCHES);

            this.logger.log(`Processing LLM batch group ${groupNumber}/${totalGroups} (${parallelGroup.length} batches, ~${parallelGroup.length * LLM_BATCH_SIZE} controls)`);

            // Process all batches in this group in parallel
            await Promise.all(
                parallelGroup.map(batch =>
                    this.processControlBatchWithLLM(
                        manager,
                        appId,
                        standardId,
                        batch,
                        sourceText
                    ).catch(error => {
                        this.logger.error(`Error processing LLM batch: ${error.message}`, error);
                        // Fallback to individual processing if batch fails
                        return this.fallbackToIndividualProcessing(manager, appId, standardId, batch, sourceText);
                    })
                )
            );

            const processedCount = Math.min((i + PARALLEL_BATCHES) * LLM_BATCH_SIZE, totalControls);
            this.logger.log(`Completed LLM batch group ${groupNumber}/${totalGroups}. Progress: ${processedCount}/${totalControls} controls (${Math.round((processedCount / totalControls) * 100)}%)`);
        }

        this.logger.log(`Finished processing all ${totalControls} controls for standard ${standardId}`);
    }

    /**
     * Process a batch of controls using a single LLM API call (BIGGEST PERFORMANCE IMPROVEMENT)
     */
    private async processControlBatchWithLLM(
        manager: any,
        appId: number,
        standardId: number,
        batch: Array<{ control: Control; appControl: ApplicationControlMapping }>,
        sourceText: string | null
    ): Promise<void> {
        const batchResults = new Map<number, { percentage: number; explanation: string }>();

        // Try batch LLM analysis if source text is available
        if (sourceText && batch.length > 0) {
            try {
                // Get customer_id from app
                const app = await manager.findOne(App, { where: { id: appId } });
                const customerId = app?.customer_id || 'unknown';
                
                // Build prompt context once for the batch
                const promptContext = await this.promptVariablesService.buildPromptContext(
                    appId,
                    standardId,
                    customerId
                );

                // Use control-family-specific prompts for batch
                const controlsDescription = batch.map(({ control }, index) => {
                    const familyPrompt = getPromptForControl(control.control_name);
                    return `${index + 1}. Control ID: ${control.control_name}
   Name: ${control.control_long_name || control.control_name}
   Family: ${control.control_name.substring(0, 2)}
   Text: ${(control.control_text || 'N/A').substring(0, 500)}

   Analysis Focus: ${familyPrompt.analysisInstructions.split('\n').slice(0, 3).join(' ')}`;
                }).join('\n\n');

                // Context-aware batch prompt
                const prompt = `You are an expert compliance analyst with specialized knowledge in multiple security control families.

## Application Context
- Application: ${promptContext.appName}
${promptContext.appDescription ? `- Description: ${promptContext.appDescription}` : ''}
${promptContext.industryType ? `- Industry: ${promptContext.industryType}` : ''}
- Compliance Framework: ${promptContext.complianceFramework}
${promptContext.knownTechnologies && promptContext.knownTechnologies.length > 0 ? `- Detected Technologies: ${promptContext.knownTechnologies.join(', ')}` : ''}

## Controls to Analyze
${controlsDescription}

## Source Document
${sourceText}

## Instructions
For EACH control:
1. Apply family-specific analysis (AC vs AU vs IR require different approaches)
2. Look for concrete evidence in the source document
3. Match evidence to specific control requirements
4. Identify gaps precisely
5. Provide actionable recommendations

## Required JSON Output
{
  "controls": [
    {
      "control_id": "<control_name>",
      "implementation_status": "not_implemented|partially_implemented|implemented|not_applicable|planned",
      "percentage_completion": <0-100>,
      "explanation": "<detailed explanation with specific evidence from source>",
      "evidence_found": ["Evidence item 1", "Evidence item 2"],
      "gaps": ["Gap 1", "Gap 2"],
      "recommendations": [
        {
          "priority": "high|medium|low",
          "action": "Specific actionable recommendation",
          "rationale": "Why this is needed"
        }
      ]
    }
  ]
}

IMPORTANT:
- Only cite evidence that actually exists in the source
- Be specific, not vague
- Match percentage to status (not_implemented: 0-20%, partial: 30-70%, implemented: 80-100%)
- Recommendations must be actionable within weeks

Respond ONLY with valid JSON.`;

                const aiResponse = await this.aiHelperService.generateStructuredResponse<{
                    controls: Array<{
                        control_id: string;
                        percentage_completion: number;
                        explanation: string;
                        implementation_status?: string;
                        evidence_found?: string[];
                        gaps?: string[];
                        recommendations?: Array<{
                            priority: string;
                            action: string;
                            rationale: string;
                        }>;
                    }>;
                }>(prompt, 'You are an expert compliance analyst with specialized knowledge in security control families. Provide accurate, detailed analysis based on control-specific requirements. Analyze all controls in the batch.');

                if (aiResponse && aiResponse.controls && Array.isArray(aiResponse.controls)) {
                    // Validate and process results with enhanced structure
                    let totalQualityScore = 0;
                    let validatedCount = 0;

                    for (const result of aiResponse.controls) {
                        const matchingControl = batch.find(({ control }) => control.control_name === result.control_id);
                        if (matchingControl) {
                            // Validate LLM response quality
                            const validation = await this.llmOutputValidator.validateControlAnalysis(
                                result,
                                sourceText,
                                result.control_id
                            );

                            totalQualityScore += validation.qualityScore;
                            validatedCount++;

                            // Use corrected data if validation found issues
                            const finalResult = validation.correctedData || result;

                            // Log validation issues
                            if (!validation.isValid || validation.warnings.length > 0) {
                                this.logger.warn(
                                    `Control ${result.control_id} validation: ${this.llmOutputValidator.getValidationSummary(validation)}`
                                );
                            }

                            // Generate evidence suggestions
                            let evidenceSuggestions = [];
                            try {
                                evidenceSuggestions = await this.evidenceSuggestionService.generateEvidenceSuggestions(
                                    result.control_id,
                                    finalResult.implementation_status || 'not_implemented',
                                    finalResult.gaps || [],
                                    finalResult.evidence_found || []
                                );
                                this.logger.debug(
                                    `Generated ${evidenceSuggestions.length} evidence suggestions for ${result.control_id}`
                                );
                            } catch (error) {
                                this.logger.warn(
                                    `Failed to generate evidence suggestions for ${result.control_id}: ${error.message}`
                                );
                            }

                            // Map enhanced response fields
                            const enhancedExplanation = {
                                summary: finalResult.explanation || '',
                                evidence_found: finalResult.evidence_found || [],
                                gaps: finalResult.gaps || [],
                                recommendations: finalResult.recommendations || [],
                                implementation_status: finalResult.implementation_status || 'not_implemented',
                                quality_score: validation.qualityScore,
                                evidence_suggestions: evidenceSuggestions
                            };

                            batchResults.set(matchingControl.control.id, {
                                percentage: Math.max(0, Math.min(100, Math.round(finalResult.percentage_completion))),
                                explanation: JSON.stringify(enhancedExplanation)
                            });

                            // Log quality metrics
                            this.logger.debug(
                                `Control ${result.control_id}: ${finalResult.evidence_found?.length || 0} evidence items, ` +
                                `${finalResult.gaps?.length || 0} gaps, ${finalResult.recommendations?.length || 0} recommendations, ` +
                                `quality: ${validation.qualityScore}/100`
                            );
                        }
                    }

                    const avgQuality = validatedCount > 0 ? (totalQualityScore / validatedCount).toFixed(1) : 'N/A';
                    this.logger.log(
                        `✅ LLM batch analysis completed for ${batchResults.size}/${batch.length} controls ` +
                        `with enhanced prompts (avg quality: ${avgQuality}/100)`
                    );
                } else {
                    this.logger.warn(`LLM batch analysis did not return valid results, falling back to individual processing`);
                }
            } catch (error) {
                this.logger.warn(`LLM batch analysis failed: ${error.message}, falling back to individual processing`);
            }
        }

        // Process each control in the batch (using LLM results if available, otherwise fallback)
        await Promise.all(
            batch.map(({ control, appControl }) =>
                this.processControlWithResults(
                    manager,
                    appId,
                    standardId,
                    control,
                    appControl,
                    batchResults.get(control.id),
                    sourceText
                ).catch(error => {
                    this.logger.error(`Error processing control ${control.control_name}: ${error.message}`, error);
                    return null;
                })
            )
        );
    }

    /**
     * Fallback to individual processing if batch LLM fails
     */
    private async fallbackToIndividualProcessing(
        manager: any,
        appId: number,
        standardId: number,
        batch: Array<{ control: Control; appControl: ApplicationControlMapping }>,
        sourceText: string | null
    ): Promise<void> {
        this.logger.log(`Falling back to individual processing for ${batch.length} controls`);
        await Promise.all(
            batch.map(({ control, appControl }) =>
                this.processControlWithResults(manager, appId, standardId, control, appControl, null, sourceText)
            )
        );
    }

    /**
     * Process a single control with pre-computed results or calculate them
     */
    private async processControlWithResults(
        manager: any,
        appId: number,
        standardId: number,
        control: Control,
        appControl: ApplicationControlMapping,
        llmResult: { percentage: number; explanation: string } | null | undefined,
        sourceText: string | null
    ): Promise<void> {
        let percentage = 0;
        let explanation = '';

        // Use LLM batch result if available
        if (llmResult) {
            percentage = llmResult.percentage;
            explanation = llmResult.explanation;
        } else {
            // Fallback to individual LLM call or chunk-based calculation
            if (sourceText) {
                try {
                    const prompt = `You are a compliance analyst. Analyze the provided source document against the following compliance control and determine the percentage completion (0-100) and provide a detailed explanation.

Control ID: ${control.control_name}
Control Name: ${control.control_name}
Control Text: ${control.control_text || control.control_long_name || 'N/A'}

Source Document:
${sourceText.substring(0, 50000)}

Based on your analysis of the source document, provide a JSON response with:
{
  "percentage_completion": <number between 0-100>,
  "explanation": "<detailed explanation>"
}

Respond ONLY with valid JSON, no additional text.`;

                    const aiResponse = await this.aiHelperService.generateStructuredResponse<{
                        percentage_completion: number;
                        explanation: string;
                    }>(prompt, 'You are an expert compliance analyst.');

                    if (aiResponse && aiResponse.percentage_completion !== undefined) {
                        percentage = Math.max(0, Math.min(100, Math.round(aiResponse.percentage_completion)));
                        explanation = aiResponse.explanation || '';
                    }
                } catch (error) {
                    this.logger.warn(`Individual LLM analysis failed for control ${control.control_name}: ${error.message}`);
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
        }

        // Update the control with percentage and explanation
        const updateData: any = { 
            percentage_completion: percentage 
        };

        if (!appControl.user_implementation_explanation && explanation) {
            updateData.implementation_explanation = explanation;
        }

        await manager.update(
            ApplicationControlMapping,
            { id: appControl.id },
            updateData,
        );
        
        // Update status if needed
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

        // Track controls that need recommendations
        if ((updatedStatus === ApplicationControlMappingStatus.NOT_IMPLEMENTED || 
             updatedStatus === ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED) &&
            percentage < 100) {
            try {
                const existingRecommendations = await manager.query(`
                    SELECT COUNT(*) as count 
                    FROM application_control_recommendation 
                    WHERE application_id = $1 AND control_id = $2 AND standard_id = $3
                `, [appId, control.id, standardId]);
                
                const recCount = parseInt(existingRecommendations[0]?.count || '0');
                
                if (recCount === 0) {
                    this.controlsNeedingRecommendations.push({
                        appId,
                        controlId: control.id,
                        standardId
                    });
                }
            } catch (error) {
                this.logger.warn(`Failed to check recommendations for control ${control.control_name}: ${error.message}`);
            }
        }
    }

    /**
     * Generate recommendations asynchronously for controls that need them
     */
    private async generateRecommendationsAsync(
        controls: Array<{appId: number, controlId: number, standardId: number}>
    ): Promise<void> {
        // Process recommendations in parallel batches as well
        const BATCH_SIZE = 5; // Smaller batch for recommendations as they're more resource-intensive
        this.logger.log(`Generating recommendations for ${controls.length} controls in batches of ${BATCH_SIZE}`);

        for (let i = 0; i < controls.length; i += BATCH_SIZE) {
            const batch = controls.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(controls.length / BATCH_SIZE);

            await Promise.all(
                batch.map(({ appId, controlId, standardId }) =>
                    this.recommendationService.generateRecommendationsForControl(
                        appId,
                        controlId,
                        standardId
                    ).catch(error => {
                        this.logger.warn(`Failed to generate recommendations for control ${controlId}: ${error.message}`);
                        return null;
                    })
                )
            );

            this.logger.log(`Completed recommendation batch ${batchNumber}/${totalBatches} (${Math.min(i + BATCH_SIZE, controls.length)}/${controls.length} controls)`);
        }

        this.logger.log(`Finished generating recommendations for ${controls.length} controls`);
    }
}
