import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserComment } from 'src/entities/userComment.entity';
import { Repository } from 'typeorm';
import { CreateUserComment, UpdateUserComment } from './user-comment.dto';
import { UserRole } from 'src/masterData/userRoles.entity';
import { App } from 'src/entities/app.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { LoggerService } from 'src/logger/logger.service';
import { is } from 'cheerio/dist/commonjs/api/traversing';
import { Control } from 'src/entities/compliance/control.entity';
import { AiHelperService } from 'src/common/services/ai-helper.service';

@Injectable()
export class UserCommentService {
    constructor(
        @InjectRepository(UserComment) private readonly userCommentRepository: Repository<UserComment>,
        @InjectRepository(App) private readonly appRepository: Repository<App>,
        @InjectRepository(AppStandard) private readonly appStandardRepository: Repository<AppStandard>,
        @InjectRepository(Standard) private readonly standardRepository: Repository<Standard>,
        @InjectRepository(ApplicationControlMapping) private readonly applicationControlMappingRepository: Repository<ApplicationControlMapping>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        private readonly logger: LoggerService,
        private readonly aiHelper: AiHelperService
    ) {}
    private readonly overridingRoles = [UserRole.SuperAdmin, UserRole.CSM, UserRole.OrgAdmin]


    async getUserCommentsByAppIdAndStandardId(userData: any, app_id: number, standard_id: number): Promise<UserComment[]> {
        return await this.userCommentRepository.find({ where: { app_id, standard_id, is_deleted: false, is_standard_level_comment:true }, relations: ['createdByUser', 'modifiedByUser'] });
    }

    async getUserCommentsForControl(userData: any, app_id: number, standard_id: number, control_id: number): Promise<UserComment[]> {
        return await this.userCommentRepository.find({ where: { app_id, standard_id, control_id, is_deleted: false  }, relations: ['createdByUser', 'modifiedByUser'] });
    }

    async createUserComment(userData: any, body: CreateUserComment): Promise<UserComment> {
        const userId = userData.userId;
        const roleId = userData.roleId;
        const customerId = userData.customerId;
        const { app_id, standard_id, control_id, comment, tags, is_standard_level_comment} = body;
        this.validateCustomer(customerId, app_id);
        const app = await this.appRepository.findOne({ where: { id: app_id } });
        if (!app) {
            throw new BadRequestException("Invalid application");
        }
        const standard = await this.standardRepository.findOne({ where: { id: standard_id } });
        if (!standard) {
            throw new BadRequestException("Invalid standard");
        }
        const appStandard = await this.appStandardRepository.findOne({ where: { app_id, standard_id } });
        if (!appStandard) {
            throw new BadRequestException("Standard not found in the application");
        }
        if (control_id) {
            const control = await this.applicationControlMappingRepository.findOne({ where: { app_id, standard_id, control_id } });
            if (!control) {
                throw new BadRequestException("Control not found in the application");
            }
        }

        let isStandardLevelComment = is_standard_level_comment;
        if(!isStandardLevelComment) {
            isStandardLevelComment = false;
        }

        const newComment = this.userCommentRepository.create({ app_id, standard_id, control_id, comment, tags, created_by: userId, updated_by: userId, is_standard_level_comment: isStandardLevelComment });
        return await this.userCommentRepository.save(newComment);
    }

    async updateUserComment(userData: any, body: UpdateUserComment, id: number): Promise<UserComment> {

        const userId = userData.userId;
        const roleId = userData.roleId;
        const customerId = userData.customerId;
        const userComment = await this.userCommentRepository.findOne({ where: { id } });
        if(!userComment) {
            throw new NotFoundException("Comment not found");
        }
        await this.validateCustomer(customerId, userComment.app_id);
        await this.validateCommentor(userId, userComment, roleId);
        userComment.comment = body.comment;
        userComment.updated_by = userId;
        userComment.tags = body.tags;
        return await this.userCommentRepository.save(userComment);
    }

    async deleteUserComment(userData: any, id: number): Promise<void> {
        const userId = userData.userId;
        const roleId = userData.roleId;
        const customerId = userData.customerId;
        const userComment = await this.userCommentRepository.findOne({ where: { id } });
        if(!userComment) {
            throw new NotFoundException("Comment not found");
        }
        await this.validateCustomer(customerId, userComment.app_id);
        await this.validateCommentor(userId, userComment, roleId);
        await this.userCommentRepository.update({ id }, { is_deleted: true, updated_by: userId });
    }

    async validateCommentor(userId: string, comment: UserComment, roleId: number): Promise<void> {
        if (comment.created_by !== userId) {
            if (!this.overridingRoles.includes(roleId)) {
                throw new ForbiddenException("You are not authorized to update this comment");
            }
        }
    }

    async validateCustomer(customerId: string, appId: number): Promise<void> {
        const app = await this.appRepository.findOne({ where: { id: appId } });
        if (!app) {
            throw new NotFoundException("Application not found");
        }
        if(app.customer_id !== customerId) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    /**
     * Summarize comments by control/standard using AI
     */
    async summarizeComments(
        appId: number,
        standardId: number,
        controlId?: number
    ): Promise<{
        summary: string;
        key_themes: string[];
        action_items: string[];
    }> {
        const whereClause: any = {
            app_id: appId,
            standard_id: standardId,
            is_deleted: false,
        };

        if (controlId) {
            whereClause.control_id = controlId;
        }

        const comments = await this.userCommentRepository.find({
            where: whereClause,
            relations: ['createdByUser'],
            order: { created_at: 'DESC' },
            take: 50, // Limit to recent comments
        });

        if (comments.length === 0) {
            return {
                summary: 'No comments found.',
                key_themes: [],
                action_items: [],
            };
        }

        const commentsText = comments.map((c, i) => 
            `${i + 1}. [${c.createdByUser?.name || 'Unknown'}] ${c.comment}`
        ).join('\n\n');

        const context = controlId 
            ? `Control ID: ${controlId}`
            : `Standard ID: ${standardId}`;

        const prompt = `Analyze and summarize the following user comments for compliance work:

${context}
Total Comments: ${comments.length}

Comments:
${commentsText}

Provide:
1. A concise summary (2-3 paragraphs) of the main points and discussions
2. Key themes (3-5 themes that appear across multiple comments)
3. Action items (3-7 specific actionable items extracted from the comments)

Return JSON: { "summary": "...", "key_themes": ["...", ...], "action_items": ["...", ...] }`;

        const systemMessage = `You are a GRC project manager analyzing team comments. Extract insights, themes, and actionable items.`;

        interface CommentAnalysisResponse {
            summary: string;
            key_themes: string[];
            action_items: string[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<CommentAnalysisResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.5,
                max_tokens: 2000,
            }
        );

        return aiResponse || {
            summary: 'Unable to generate summary.',
            key_themes: [],
            action_items: [],
        };
    }

    /**
     * Extract action items from comments using AI
     */
    async extractActionItems(
        appId: number,
        standardId: number,
        controlId?: number
    ): Promise<{ action_item: string; priority: 'high' | 'medium' | 'low'; source_comment_id: number }[]> {
        const whereClause: any = {
            app_id: appId,
            standard_id: standardId,
            is_deleted: false,
        };

        if (controlId) {
            whereClause.control_id = controlId;
        }

        const comments = await this.userCommentRepository.find({
            where: whereClause,
            order: { created_at: 'DESC' },
            take: 30,
        });

        if (comments.length === 0) {
            return [];
        }

        const commentsText = comments.map((c, i) => 
            `Comment ${c.id}: ${c.comment}`
        ).join('\n\n');

        const prompt = `Extract actionable items from the following compliance comments:

${commentsText}

For each actionable item found:
1. Action item description (specific and actionable)
2. Priority (high, medium, or low)
3. Source comment ID

Return JSON: { "action_items": [{"action_item": "...", "priority": "high", "source_comment_id": 1}, ...] }`;

        const systemMessage = `You are a GRC project manager extracting actionable items from team discussions.`;

        interface ActionItemsResponse {
            action_items: { action_item: string; priority: 'high' | 'medium' | 'low'; source_comment_id: number }[];
        }

        const aiResponse = await this.aiHelper.generateStructuredResponse<ActionItemsResponse>(
            prompt,
            systemMessage,
            {
                temperature: 0.4,
                max_tokens: 2000,
            }
        );

        return aiResponse?.action_items || [];
    }

    /**
     * Suggest responses to comments using AI
     */
    async suggestResponse(commentId: number): Promise<string> {
        const comment = await this.userCommentRepository.findOne({
            where: { id: commentId },
            relations: ['createdByUser'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const control = comment.control_id 
            ? await this.controlRepo.findOne({ where: { id: comment.control_id } })
            : null;

        const prompt = `Suggest a professional response to the following compliance comment:

Comment: ${comment.comment}
Author: ${comment.createdByUser?.name || 'Unknown'}
${control ? `Control: ${control.control_name}` : ''}

Generate a helpful, professional response that:
1. Acknowledges the comment
2. Provides relevant information or guidance
3. Offers next steps if applicable

Keep the response concise (2-3 sentences).`;

        const systemMessage = `You are a GRC compliance expert providing helpful responses to team comments.`;

        const response = await this.aiHelper.generateText(prompt, systemMessage, {
            temperature: 0.6,
            max_tokens: 300,
        });

        return response || 'Thank you for your comment. We will review and address your concerns.';
    }
}
