import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditFeedback, FeedbackStatus } from 'src/entities/auditFeedback.entity';
import { Repository, In } from 'typeorm';
import { CreateAuditFeedbackDto, UpdateAuditFeedbackDto } from './audit.dto';
import { User } from 'src/entities/user.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditFeedback)
        private readonly auditFeedbackRepository: Repository<AuditFeedback>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Control)
        private readonly controlRepo: Repository<Control>,
        @InjectRepository(ApplicationControlMapping)
        private readonly appControlMappingRepo: Repository<ApplicationControlMapping>,
        private readonly aiHelper: AiHelperService,
        private readonly logger: LoggerService
    ) {}

    async addFeedback(userData: any, createAuditFeedbackDto: CreateAuditFeedbackDto): Promise<AuditFeedback> {
        const customer_id = createAuditFeedbackDto.customer_id;
        const app_id = createAuditFeedbackDto.app_id;
        const standard_id = createAuditFeedbackDto.standard_id;
        const auditor_id = userData["userId"];

        if( !app_id || !standard_id) {
            throw new NotFoundException(`Customer ID, standard_id and App ID are required`);
        }
        const checkAuditFeedBack = await this.auditFeedbackRepository.findOne({where: {app_id, control_id: createAuditFeedbackDto.control_id, standard_id}});
        
        if(checkAuditFeedBack && checkAuditFeedBack?.created_by !== auditor_id) {
            throw new NotFoundException(`You are not allowed to update this feedback`);
        }
        if(!createAuditFeedbackDto?.created_by){
            createAuditFeedbackDto.created_by = auditor_id;
        }
        if(checkAuditFeedBack) {
            await this.updateFeedback(userData, checkAuditFeedBack.id, createAuditFeedbackDto);
        }  
        const auditFeedback = this.auditFeedbackRepository.create(createAuditFeedbackDto);
        return await this.auditFeedbackRepository.save(auditFeedback);
    }

    async findAll(): Promise<AuditFeedback[]> {
        return await this.auditFeedbackRepository.find();
    }

    async findOneByAppAndControl(user_data: any, app_id: number, control_id: number): Promise<any> {
        const auditorFeedbacks = await this.auditFeedbackRepository.findOne({ where: { app_id, control_id } });
        if (!auditorFeedbacks || !auditorFeedbacks.created_by) {
            return {};
        }
        const user = await this.userRepository.findOne({ where: { id: auditorFeedbacks.created_by } });

        return {auditorFeedbacks, userName: user.name, emailId: user.email};
    }


    async findByAppAndStandard(user_data: any, app_id: number, standard_id: number): Promise<AuditFeedback[]> {
    
        const auditorFeedbacks = await this.auditFeedbackRepository.find({ where: { app_id, standard_id} });

        if(auditorFeedbacks.length === 0) {
            return [];  
        }
        const feedbacksWithUserDetails = [];

        for (const feedback of auditorFeedbacks) {
            const user = await this.userRepository.findOne({ where: { id: feedback.created_by } });
            if (user) {
                feedbacksWithUserDetails.push({
                    ...feedback,
                    userName: user.name,
                    emailId: user.email,
                });
            }
        }

        return feedbacksWithUserDetails;
    }


    async updateFeedback(userData: any, id: number, updateAuditFeedbackDto: UpdateAuditFeedbackDto) {
        const auditor_id = userData['userId'];
        if(!auditor_id) {
            throw new NotFoundException(`Auditor ID is required`);
        }
        const auditFeedback = await this.auditFeedbackRepository.findOne({where:{id}});
        if(auditFeedback.auditor_id !== auditor_id) {
            throw new NotFoundException(`You are not allowed to update this feedback`);
        }
        Object.assign(auditFeedback, updateAuditFeedbackDto);
        auditFeedback.updated_at = new Date();
        auditFeedback.updated_by = auditor_id
        return await this.auditFeedbackRepository.save(auditFeedback);
    }

    async remove(userInfo: any, id: number): Promise<void> {
        const auditor_id = userInfo['userId'];
        const auditFeedback = await this.auditFeedbackRepository.findOne({where:{id}});
        if(auditFeedback.auditor_id !== auditor_id) {
            throw new NotFoundException(`You are not allowed to delete this feedback`);
        }
        await this.auditFeedbackRepository.remove(auditFeedback);
    }

    async bulkUpdateFeedback(userData: any, updateData: UpdateAuditFeedbackDto) {
        const app_id = updateData.app_id;
        const standard_id = updateData.standard_id;
        const control_id = updateData.control_id;

        let auditFeedback;
        if (control_id) {
            auditFeedback = await this.auditFeedbackRepository.find({ where: { app_id, standard_id, control_id } });
        } else {
            auditFeedback = await this.auditFeedbackRepository.find({ where: { app_id, standard_id } });
        }

        for (const feedback of auditFeedback) {
            if (feedback.feedback_status) {
                feedback.feedback_status = FeedbackStatus.OUT_OF_SYNC;
                feedback.updated_at = new Date();
                feedback.is_updated_by_llm = true;
                await this.auditFeedbackRepository.save(feedback);
            }
        }
    }

    /**
     * Generate AI-powered response to audit feedback
     */
    async generateResponseToFeedback(feedbackId: number): Promise<{
        response: string;
        suggested_actions: string[];
        priority: 'high' | 'medium' | 'low';
    }> {
        const feedback = await this.auditFeedbackRepository.findOne({
            where: { id: feedbackId },
        });

        if (!feedback) {
            throw new NotFoundException('Audit feedback not found');
        }

        const control = await this.controlRepo.findOne({
            where: { id: feedback.control_id },
        });

        const controlMapping = await this.appControlMappingRepo.findOne({
            where: {
                app_id: feedback.app_id,
                control_id: feedback.control_id,
                standard_id: feedback.standard_id,
            },
        });

        const prompt = `Generate a professional response to the following audit feedback:

Control: ${control?.control_name || 'Unknown'}
Control Description: ${control?.control_text?.substring(0, 600) || 'N/A'}
Feedback Status: ${feedback.feedback_status}
Feedback Notes: ${feedback.feedback_notes || 'No notes provided'}
Current Implementation Status: ${controlMapping?.implementation_status || 'Unknown'}

Generate:
1. A professional response acknowledging the feedback (2-3 paragraphs)
2. 3-5 specific, actionable remediation steps
3. Priority level (high, medium, or low) based on the feedback severity

Return JSON: { "response": "...", "suggested_actions": ["...", ...], "priority": "high" }`;

        const systemMessage = `You are a GRC compliance professional responding to audit feedback. Be professional, specific, and action-oriented.`;

        interface FeedbackResponse {
            response: string;
            suggested_actions: string[];
            priority: 'high' | 'medium' | 'low';
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<FeedbackResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.6,
                max_tokens: 1500,
            }
        );

        return aiResponse || {
            response: 'Thank you for the audit feedback. We will review and address the concerns raised.',
            suggested_actions: ['Review the feedback', 'Assess current implementation', 'Develop remediation plan'],
            priority: 'medium',
        };
    }

    /**
     * Suggest remediation actions from audit feedback
     */
    async suggestRemediationActions(feedbackId: number): Promise<string[]> {
        const feedback = await this.auditFeedbackRepository.findOne({
            where: { id: feedbackId },
        });

        if (!feedback) {
            throw new NotFoundException('Audit feedback not found');
        }

        const control = await this.controlRepo.findOne({
            where: { id: feedback.control_id },
        });

        const prompt = `Based on the following audit feedback, suggest 5-7 specific remediation actions:

Control: ${control?.control_name || 'Unknown'}
Feedback Status: ${feedback.feedback_status}
Feedback Notes: ${feedback.feedback_notes || 'No notes'}

Generate actionable remediation steps that address the audit findings. Each step should be specific and measurable.

Return JSON: { "actions": ["action1", "action2", ...] }`;

        const systemMessage = `You are a GRC remediation specialist. Generate specific, actionable remediation steps.`;

        interface ActionsResponse {
            actions: string[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<ActionsResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.5,
                max_tokens: 1500,
            }
        );

        return aiResponse?.actions || [];
    }

    /**
     * Prioritize flagged controls from audit feedback
     */
    async prioritizeFlaggedControls(
        appId: number,
        standardId: number
    ): Promise<{ control_id: number; priority_score: number; reason: string }[]> {
        const flaggedFeedbacks = await this.auditFeedbackRepository.find({
            where: {
                app_id: appId,
                standard_id: standardId,
                feedback_status: In([FeedbackStatus.FAILED, FeedbackStatus.FLAGGED]),
            },
        });

        if (flaggedFeedbacks.length === 0) {
            return [];
        }

        const controlIds = [...new Set(flaggedFeedbacks.map(f => f.control_id))];
        const controls = await this.controlRepo.find({
            where: { id: In(controlIds) },
        });

        const controlMap = new Map(controls.map(c => [c.id, c]));

        const prompt = `Prioritize the following flagged controls from audit feedback:

${flaggedFeedbacks.map((f, i) => {
    const control = controlMap.get(f.control_id);
    return `${i + 1}. Control: ${control?.control_name || 'Unknown'}\n   Status: ${f.feedback_status}\n   Notes: ${f.feedback_notes?.substring(0, 200) || 'None'}`;
}).join('\n\n')}

For each control, provide:
1. Priority score (1-100, where 100 is highest priority)
2. Brief reason for the priority

Return JSON: { "priorities": [{"control_id": 1, "priority_score": 85, "reason": "..."}, ...] }`;

        const systemMessage = `You are a GRC risk analyst. Prioritize controls based on audit findings, risk level, and business impact.`;

        interface PriorityResponse {
            priorities: { control_id: number; priority_score: number; reason: string }[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<PriorityResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.4,
                max_tokens: 2000,
            }
        );

        return aiResponse?.priorities || flaggedFeedbacks.map(f => ({
            control_id: f.control_id,
            priority_score: 50,
            reason: 'Unable to determine priority',
        }));
    }
}
