import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { Repository } from "typeorm";
import { Control } from "src/entities/compliance/control.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { LoggerService } from "src/logger/logger.service";


@Injectable()
export class GetControlEvaluationService {
    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(ControlEvaluationResult) private readonly controlEvaluationRepo: Repository<ControlEvaluationResult>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        @InjectRepository(ApplicationControlEvidence) private readonly evidenceRepo: Repository<ApplicationControlEvidence>,
        private readonly aiHelper: AiHelperService,
        private readonly logger: LoggerService
    ) { }

    async getForControlEvaluation(
        userInfo: { userId: string; customerId: string },
        appId: number,
        stdId: number,
        controlId: number,
        childControlId: number,
    ): Promise<ControlEvaluationResult[]> {
        const appControl = await this.appControlRepo.findOneOrFail({
            select: ['id', 'control_id'],
            where: { app_id: appId, id: childControlId },
        });

        const controlEvaluation = await this.controlEvaluationRepo.find({
            where: { app_id: appId, control_id: appControl.control_id, standard_id: stdId },
        });

        if (!controlEvaluation.length) return [];

        return controlEvaluation;
    }

    /**
     * Suggest evidence types for a control using AI
     */
    async suggestEvidenceTypes(
        appId: number,
        standardId: number,
        controlId: number
    ): Promise<{ evidence_type: string; description: string; priority: 'high' | 'medium' | 'low' }[]> {
        const control = await this.controlRepo.findOne({
            where: { id: controlId },
        });

        if (!control) {
            throw new Error('Control not found');
        }

        const controlMapping = await this.appControlRepo.findOne({
            where: {
                app_id: appId,
                control_id: controlId,
                standard_id: standardId,
            },
        });

        const prompt = `Suggest appropriate evidence types for the following compliance control:

Control: ${control.control_name}
Control Description: ${control.control_text.substring(0, 800)}...
Control Family: ${control.family_name}
Current Status: ${controlMapping?.implementation_status || 'Unknown'}

Generate 3-5 evidence type suggestions that would demonstrate compliance with this control. For each evidence type, provide:
1. Evidence type name (e.g., "Policy Document", "Screenshot", "Configuration File", "Audit Log")
2. Description of what the evidence should contain
3. Priority (high, medium, or low) based on how critical this evidence is for demonstrating compliance

Return JSON: { "evidence_types": [{"evidence_type": "...", "description": "...", "priority": "high"}, ...] }`;

        const systemMessage = `You are a GRC compliance expert. Suggest appropriate evidence types that would demonstrate control implementation.`;

        interface EvidenceTypesResponse {
            evidence_types: { evidence_type: string; description: string; priority: 'high' | 'medium' | 'low' }[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<EvidenceTypesResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.5,
                max_tokens: 1500,
            }
        );

        return aiResponse?.evidence_types || [];
    }

    /**
     * Evaluate evidence quality using AI
     */
    async evaluateEvidenceQuality(
        appId: number,
        controlId: number,
        evidenceDescription: string,
        evidenceType?: string
    ): Promise<{
        quality_score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        is_sufficient: boolean;
    }> {
        const control = await this.controlRepo.findOne({
            where: { id: controlId },
        });

        if (!control) {
            throw new Error('Control not found');
        }

        const prompt = `Evaluate the quality and sufficiency of the following evidence for compliance control:

Control: ${control.control_name}
Control Description: ${control.control_text.substring(0, 600)}...
Evidence Type: ${evidenceType || 'Not specified'}
Evidence Description: ${evidenceDescription}

Evaluate:
1. Quality score (0-100) - how well the evidence demonstrates compliance
2. Strengths - what makes this evidence good
3. Weaknesses - what's missing or could be improved
4. Suggestions - specific recommendations to improve evidence
5. Is sufficient - whether this evidence alone is sufficient to demonstrate compliance

Return JSON: { "quality_score": 75, "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."], "is_sufficient": true }`;

        const systemMessage = `You are a GRC auditor evaluating evidence quality. Be thorough and specific in your assessment.`;

        interface EvidenceQualityResponse {
            quality_score: number;
            strengths: string[];
            weaknesses: string[];
            suggestions: string[];
            is_sufficient: boolean;
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<EvidenceQualityResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.4,
                max_tokens: 1500,
            }
        );

        return aiResponse || {
            quality_score: 50,
            strengths: [],
            weaknesses: ['Unable to evaluate'],
            suggestions: ['Provide more detailed evidence description'],
            is_sufficient: false,
        };
    }

    /**
     * Generate evaluation narrative using AI
     */
    async generateEvaluationNarrative(
        appId: number,
        standardId: number,
        controlId: number
    ): Promise<string> {
        const control = await this.controlRepo.findOne({
            where: { id: controlId },
        });

        if (!control) {
            throw new Error('Control not found');
        }

        const controlMapping = await this.appControlRepo.findOne({
            where: {
                app_id: appId,
                control_id: controlId,
                standard_id: standardId,
            },
        });

        const evaluationResults = await this.controlEvaluationRepo.find({
            where: {
                app_id: appId,
                control_id: controlId,
                standard_id: standardId,
            },
        });

        const evidences = await this.evidenceRepo.find({
            where: {
                application_control_mapping_id: controlMapping?.id,
            },
            take: 10,
        });

        const prompt = `Generate a professional evaluation narrative for the following compliance control:

Control: ${control.control_name}
Control Description: ${control.control_text.substring(0, 800)}...
Current Status: ${controlMapping?.implementation_status || 'Unknown'}
Risk Level: ${controlMapping?.risk_level || 'Not specified'}

Evaluation Results:
${evaluationResults.map((r, i) => `${i + 1}. Requirement: ${r.requirement}\n   Status: ${r.status}\n   Explanation: ${r.explanation || 'None'}`).join('\n\n') || 'No evaluation results'}

Evidence Available:
${evidences.map((e, i) => `${i + 1}. ${e.document ? `Document: ${e.document}` : 'Evidence'}: ${e.description?.substring(0, 200) || 'No description'}`).join('\n') || 'No evidence provided'}

Generate a 2-3 paragraph professional evaluation narrative that:
1. Summarizes the control requirements
2. Describes the current implementation status
3. Evaluates the evidence provided
4. Provides a conclusion on compliance status

Write in a professional, audit-ready tone.`;

        const systemMessage = `You are a GRC auditor writing evaluation narratives. Be objective, professional, and thorough.`;

        const narrative = await this.aiHelper.generateText(prompt, systemMessage, {
            temperature: 0.6,
            max_tokens: 1000,
        });

        return narrative || 'Unable to generate evaluation narrative.';
    }

    /**
     * Identify missing evidence using AI
     */
    async identifyMissingEvidence(
        appId: number,
        standardId: number,
        controlId: number
    ): Promise<{ missing_evidence: string; reason: string; priority: 'high' | 'medium' | 'low' }[]> {
        const control = await this.controlRepo.findOne({
            where: { id: controlId },
        });

        if (!control) {
            throw new Error('Control not found');
        }

        const controlMapping = await this.appControlRepo.findOne({
            where: {
                app_id: appId,
                control_id: controlId,
                standard_id: standardId,
            },
        });

        const evidences = await this.evidenceRepo.find({
            where: {
                application_control_mapping_id: controlMapping?.id,
            },
        });

        const prompt = `Analyze the following compliance control and identify what evidence is missing:

Control: ${control.control_name}
Control Description: ${control.control_text.substring(0, 800)}...
Control Family: ${control.family_name}
Current Status: ${controlMapping?.implementation_status || 'Unknown'}

Current Evidence:
${evidences.map((e, i) => `${i + 1}. ${e.document ? `Document: ${e.document}` : 'Evidence'}: ${e.description?.substring(0, 200) || 'No description'}`).join('\n') || 'No evidence provided'}

Identify 3-5 types of evidence that are missing or insufficient to fully demonstrate compliance. For each missing evidence type, provide:
1. Missing evidence type name
2. Reason why it's needed
3. Priority (high, medium, or low)

Return JSON: { "missing_evidence": [{"missing_evidence": "...", "reason": "...", "priority": "high"}, ...] }`;

        const systemMessage = `You are a GRC compliance expert identifying evidence gaps. Be specific and actionable.`;

        interface MissingEvidenceResponse {
            missing_evidence: { missing_evidence: string; reason: string; priority: 'high' | 'medium' | 'low' }[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<MissingEvidenceResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.5,
                max_tokens: 1500,
            }
        );

        return aiResponse?.missing_evidence || [];
    }
}