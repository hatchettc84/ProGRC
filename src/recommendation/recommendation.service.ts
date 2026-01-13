import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationControlMapping, ApplicationControlMappingStatus } from 'src/entities/compliance/applicationControlMapping.entity';
import { ApplicationControlRecommendation, RecommendationStatus, RecommendationAction } from 'src/entities/recommendation/applicationControlRecommendation.entity';
import { Repository, In } from 'typeorm';
import { PaginatedResponse } from 'src/common/dto/paginatedResponse.dto';
import { Control } from 'src/entities/compliance/control.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class RecommendationService {
    constructor(
        @InjectRepository(ApplicationControlRecommendation) private readonly appControlRecommendationRepo: Repository<ApplicationControlRecommendation>,
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
        private readonly aiHelper: AiHelperService,
        private readonly logger: LoggerService
    ) { }

    async getRecommendations(params: { 
        applicationId: number, 
        controlId?: number, 
        standardId?: number,
        page?: number,
        limit?: number 
    }): Promise<PaginatedResponse<ApplicationControlRecommendation>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        let queryBuilder = this.appControlRecommendationRepo.createQueryBuilder('recommendation')
            .where('recommendation.action IS NULL'); // Only get recommendations where action is null

        if (params.controlId) {
            const controlMapping = await this.appControlRepo.findOneOrFail({
                where: { id: params.controlId }
            });
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId })
                .andWhere('recommendation.standard_id = :standardId', { standardId: controlMapping.standard_id })
                .andWhere('recommendation.control_id = :controlId', { controlId: controlMapping.control_id });
        } else if (params.standardId) {
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId })
                .andWhere('recommendation.standard_id = :standardId', { standardId: params.standardId });
        } else {
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const items = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('recommendation.created_at', 'DESC')
            .getMany();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            items,
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPreviousPage
        };
    }

    async getFilteredRecommendations(params: { 
        applicationId: number, 
        controlId?: number, 
        standardId?: number,
        page?: number,
        limit?: number 
    }): Promise<PaginatedResponse<ApplicationControlRecommendation>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        let queryBuilder = this.appControlRecommendationRepo.createQueryBuilder('recommendation')
            .where('recommendation.action IS NULL'); // Only get recommendations where action is null

        if (params.controlId) {
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId })
                .andWhere('recommendation.control_id = :controlId', { controlId: params.controlId });
        } else if (params.standardId) {
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId })
                .andWhere('recommendation.standard_id = :standardId', { standardId: params.standardId });
        } else {
            queryBuilder = queryBuilder
                .andWhere('recommendation.application_id = :applicationId', { applicationId: params.applicationId });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const items = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('recommendation.created_at', 'DESC')
            .getMany();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            items,
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPreviousPage
        };
    }

    async bulkAddRecommendations(params: { applicationId: number, controlId: number, standardId: number, recommendations: string[] }) {
        const existingRecommendations = await this.appControlRecommendationRepo.find({
            where: {
                application_id: params.applicationId,
                control_id: params.controlId,
                standard_id: params.standardId
            }
        });

        const newRecommendationEntities = params.recommendations.map(recommendation =>
            this.appControlRecommendationRepo.create({
                application_id: params.applicationId,
                control_id: params.controlId,
                standard_id: params.standardId,
                recommendation: recommendation,
                status: RecommendationStatus.NEW
            })
        );

        for (const existing of existingRecommendations) {
            if (![RecommendationStatus.ACKNOWLEDGED, RecommendationStatus.N_A].includes(existing.status)) {
                existing.status = RecommendationStatus.ARCHIVED;
            }
        }

        await this.appControlRecommendationRepo.save(existingRecommendations);
        return await this.appControlRecommendationRepo.save(newRecommendationEntities);
    }

    async updateRecommendationStatus(id: number, status: RecommendationStatus, action?: RecommendationAction) {
        const recommendation = await this.appControlRecommendationRepo.findOneOrFail({ where: { id } });
        recommendation.status = status;
        if (action) {
            recommendation.action = action;
        }
        return await this.appControlRecommendationRepo.save(recommendation);
    }

    /**
     * Generate AI-powered recommendations for a control
     */
    async generateRecommendationsForControl(
        applicationId: number,
        controlId: number,
        standardId: number
    ): Promise<ApplicationControlRecommendation[]> {
        const controlMapping = await this.appControlRepo.findOne({
            where: { control_id: controlId, app_id: applicationId, standard_id: standardId },
        });

        if (!controlMapping) {
            throw new Error('Control mapping not found');
        }

        const control = await this.controlRepo.findOne({
            where: { id: controlMapping.control_id },
        });

        if (!control) {
            throw new Error('Control not found');
        }

        const standard = await this.standardRepo.findOne({
            where: { id: standardId },
        });

        // Check if control needs recommendations
        const needsRecommendations = [
            ApplicationControlMappingStatus.NOT_IMPLEMENTED,
            ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED,
        ].includes(controlMapping.implementation_status);

        if (!needsRecommendations) {
            this.logger.log(`Control ${controlId} is implemented, no recommendations needed`);
            return [];
        }

        // Generate recommendations using AI
        const prompt = this.buildRecommendationPrompt(control, standard, controlMapping);
        const systemMessage = `You are a GRC (Governance, Risk, and Compliance) expert. Generate actionable, specific recommendations to help organizations achieve compliance with controls.`;

        interface RecommendationResponse {
            recommendations: string[];
            priority_order?: number[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<RecommendationResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.6,
                max_tokens: 2000,
            }
        );

        if (!aiResponse || !aiResponse.recommendations || aiResponse.recommendations.length === 0) {
            this.logger.warn(`AI failed to generate recommendations for control ${controlId}`);
            // Fallback to basic recommendation
            return await this.createFallbackRecommendation(applicationId, controlId, standardId, control);
        }

        // Create recommendation entities
        const recommendations = aiResponse.recommendations.map((rec, index) =>
            this.appControlRecommendationRepo.create({
                application_id: applicationId,
                control_id: controlId,
                standard_id: standardId,
                recommendation: rec,
                status: RecommendationStatus.NEW,
                cluster: `AI-Generated-${Date.now()}`,
            })
        );

        return await this.appControlRecommendationRepo.save(recommendations);
    }

    /**
     * Enhance existing recommendations with AI-generated implementation steps
     */
    async enhanceRecommendationWithSteps(recommendationId: number): Promise<string[]> {
        const recommendation = await this.appControlRecommendationRepo.findOne({
            where: { id: recommendationId },
            relations: ['control'],
        });

        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        const controlMapping = await this.appControlRepo.findOne({
            where: {
                app_id: recommendation.application_id,
                control_id: recommendation.control_id,
                standard_id: recommendation.standard_id,
            },
        });

        const control = await this.controlRepo.findOne({
            where: { id: recommendation.control_id },
        });

        const prompt = `Given the following compliance recommendation, generate 3-5 specific, actionable implementation steps:

Recommendation: ${recommendation.recommendation}
Control: ${control?.control_name || 'Unknown'}
Control Description: ${control?.control_text?.substring(0, 500) || 'N/A'}
Current Status: ${controlMapping?.implementation_status || 'Unknown'}

Generate implementation steps that are:
1. Specific and actionable
2. Ordered logically
3. Include technical details where appropriate
4. Consider the current implementation status

Return a JSON object with an array of steps: { "steps": ["step1", "step2", ...] }`;

        const systemMessage = `You are a GRC implementation specialist. Generate clear, actionable implementation steps.`;

        interface StepsResponse {
            steps: string[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<StepsResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.5,
                max_tokens: 1500,
            }
        );

        return aiResponse?.steps || [];
    }

    /**
     * Prioritize recommendations using AI
     */
    async prioritizeRecommendations(
        applicationId: number,
        recommendationIds: number[]
    ): Promise<{ id: number; priority_score: number; priority_reason: string }[]> {
        const recommendations = await this.appControlRecommendationRepo.find({
            where: {
                id: In(recommendationIds),
                application_id: applicationId,
            },
        });

        if (recommendations.length === 0) {
            return [];
        }

        // Get control mappings for context
        const controlIds = [...new Set(recommendations.map(r => r.control_id))];
        const controlMappings = await this.appControlRepo.find({
            where: {
                app_id: applicationId,
                control_id: In(controlIds),
            },
        });

        const riskMap = new Map(controlMappings.map(cm => [cm.control_id, cm.risk_level]));

        const prompt = `Prioritize the following compliance recommendations based on risk, impact, and implementation complexity:

${recommendations.map((r, i) => {
    const risk = riskMap.get(r.control_id) || 'Unknown';
    return `${i + 1}. Recommendation ID ${r.id}: ${r.recommendation}\n   Risk Level: ${risk}`;
}).join('\n\n')}

For each recommendation, provide:
1. Priority score (1-100, where 100 is highest priority)
2. Brief reason for the priority

Return JSON: { "priorities": [{"id": 1, "priority_score": 85, "priority_reason": "High risk control..."}, ...] }`;

        const systemMessage = `You are a GRC risk analyst. Prioritize recommendations based on risk, compliance impact, and business criticality.`;

        interface PriorityResponse {
            priorities: { id: number; priority_score: number; priority_reason: string }[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<PriorityResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.4,
                max_tokens: 2000,
            }
        );

        return aiResponse?.priorities || recommendations.map(r => ({
            id: r.id,
            priority_score: 50,
            priority_reason: 'Unable to determine priority',
        }));
    }

    /**
     * Build prompt for recommendation generation
     */
    private buildRecommendationPrompt(
        control: Control,
        standard: Standard | null,
        controlMapping: ApplicationControlMapping
    ): string {
        return `Generate 3-5 specific, actionable recommendations to help achieve compliance with the following control:

Control Information:
- Control Name: ${control.control_name}
- Control ID: ${control.id}
- Control Description: ${control.control_text.substring(0, 800)}...
- Control Family: ${control.family_name}
- Standard: ${standard?.name || 'Unknown'}
- Current Status: ${controlMapping.implementation_status}
- Risk Level: ${controlMapping.risk_level || 'Not specified'}

Implementation Gap:
${controlMapping.user_implementation_explanation 
  ? JSON.stringify(controlMapping.user_implementation_explanation).substring(0, 500)
  : 'No explanation provided'}

Generate recommendations that are:
1. Specific and actionable (not generic)
2. Aligned with the control requirements
3. Consider the current implementation status
4. Include technical guidance where appropriate
5. Prioritized by impact and feasibility

Return JSON: { "recommendations": ["rec1", "rec2", ...], "priority_order": [1, 2, ...] }`;
    }

    /**
     * Create fallback recommendation when AI fails
     */
    private async createFallbackRecommendation(
        applicationId: number,
        controlId: number,
        standardId: number,
        control: Control
    ): Promise<ApplicationControlRecommendation[]> {
        const recommendation = this.appControlRecommendationRepo.create({
            application_id: applicationId,
            control_id: controlId,
            standard_id: standardId,
            recommendation: `Implement ${control.control_name} to meet compliance requirements. Review control description and ensure all requirements are addressed.`,
            status: RecommendationStatus.NEW,
            cluster: `Fallback-${Date.now()}`,
        });

        return [await this.appControlRecommendationRepo.save(recommendation)];
    }
}
