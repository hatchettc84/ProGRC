import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptTemplateVariable } from 'src/entities/promptTemplateVariable.entity';
import { CreatePromptVariableDto, UpdatePromptVariableDto, TestPromptVariableDto } from './dto/prompt-variable.dto';
import { TemplateSectionType } from 'src/entities/templatesSection.entity';
import { AssessmentContext, AiPromptRequest } from './interfaces/assessment-context.interface';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class PromptVariableService {
    constructor(
        @InjectRepository(PromptTemplateVariable)
        private promptVariableRepo: Repository<PromptTemplateVariable>,
        private askAiService: AskAiService,
        private logger: LoggerService
    ) {}

    async createPromptVariable(userInfo: any, data: CreatePromptVariableDto): Promise<PromptTemplateVariable> {
        try {
            // Generate unique variable name
            const uuid = this.generateShortUuid();
            const sanitizedName = this.sanitizeName(data.display_name);
            const variableName = `prompt_${sanitizedName}_${uuid}`;

            // Check if variable name already exists (unlikely but for safety)
            const existingVariable = await this.promptVariableRepo.findOne({
                where: { variable_name: variableName }
            });

            if (existingVariable) {
                throw new BadRequestException('Variable name already exists. Please try again.');
            }

            const variable = this.promptVariableRepo.create({
                variable_name: variableName,
                display_name: data.display_name,
                description: data.description,
                prompt: data.prompt,
                context_source: data.context_source,
                output_format: data.output_format,
                type: data.type,
                group_id: data.group_id,
                specific_use_case: data.specific_use_case || false,
                input_parameters: data.input_parameters || [],
                customer_id: userInfo.customerId,
                created_by: userInfo.sub
            });

            const savedVariable = await this.promptVariableRepo.save(variable);
            this.logger.log(`Prompt variable created: ${variableName} by user ${userInfo.sub}`);
            
            return savedVariable;
        } catch (error) {
            this.logger.error('Error creating prompt variable:', error);
            throw error;
        }
    }

    async getCustomerVariables(customerId: string): Promise<PromptTemplateVariable[]> {
        return await this.promptVariableRepo.find({
            where: { customer_id: customerId, is_active: true },
            relations: ['group'],
            order: { created_at: 'DESC' }
        });
    }

    async getVariableByName(variableName: string): Promise<PromptTemplateVariable | null> {
        return await this.promptVariableRepo.findOne({
            where: { variable_name: variableName, is_active: true },
            relations: ['group']
        });
    }

    async searchVariables(
        customerId: string, 
        searchTerm?: string, 
        type?: TemplateSectionType, 
        includeSpecificUseCase = false
    ): Promise<PromptTemplateVariable[]> {
        const queryBuilder = this.promptVariableRepo.createQueryBuilder('variable')
            .leftJoinAndSelect('variable.group', 'group')
            queryBuilder.where('variable.is_active = :isActive', { isActive: true });

        if (customerId) {
            queryBuilder.andWhere('variable.customer_id = :customerId', { customerId });
        }

        if (!includeSpecificUseCase) {
            queryBuilder.andWhere('variable.specific_use_case = :specificUseCase', { specificUseCase: false });
        }

        if (searchTerm) {
            queryBuilder.andWhere(
                '(variable.display_name ILIKE :searchTerm OR variable.description ILIKE :searchTerm OR variable.variable_name ILIKE :searchTerm)',
                { searchTerm: `%${searchTerm}%` }
            );
        }

        if (type) {
            queryBuilder.andWhere('variable.type = :type', { type });
        }

        return await queryBuilder
            .orderBy('group.order_index', 'ASC')
            .addOrderBy('variable.type', 'ASC')
            .addOrderBy('variable.created_at', 'DESC')
            .getMany();
    }

    async getVariablesByType(customerId: string, type: TemplateSectionType): Promise<PromptTemplateVariable[]> {
        return await this.promptVariableRepo.find({
            where: { customer_id: customerId, type: type, is_active: true, specific_use_case: false },
            relations: ['group'],
            order: { created_at: 'DESC' }
        });
    }

    async getVariablesByGroup(customerId: string, groupId: number): Promise<PromptTemplateVariable[]> {
        return await this.promptVariableRepo.find({
            where: { customer_id: customerId, group_id: groupId, is_active: true },
            relations: ['group'],
            order: { created_at: 'DESC' }
        });
    }

    async getTemplateEditorVariables(customerId: string, type?: TemplateSectionType): Promise<PromptTemplateVariable[]> {
        // Only returns variables that are not marked as specific_use_case
        const queryBuilder = this.promptVariableRepo.createQueryBuilder('variable')
            .leftJoinAndSelect('variable.group', 'group')
            .where('variable.customer_id = :customerId', { customerId })
            .andWhere('variable.is_active = :isActive', { isActive: true })
            .andWhere('variable.specific_use_case = :specificUseCase', { specificUseCase: false });

        if (type) {
            queryBuilder.andWhere('variable.type = :type', { type });
        }

        return await queryBuilder
            .orderBy('group.order_index', 'ASC')
            .addOrderBy('variable.type', 'ASC')
            .addOrderBy('variable.created_at', 'DESC')
            .getMany();
    }

    async getVariableById(variableId: number): Promise<PromptTemplateVariable | null> {
        const variable = await this.promptVariableRepo.findOne({
            where: { id: variableId, is_active: true },
            relations: ['group']
        });

        if (!variable) {
            throw new NotFoundException('Variable not found');
        }

        return variable;
    }

    async updatePromptVariable(variableId: number, data: UpdatePromptVariableDto): Promise<PromptTemplateVariable> {
        const variable = await this.getVariableById(variableId);
        
        Object.assign(variable, data);
        const updatedVariable = await this.promptVariableRepo.save(variable);
        
        this.logger.log(`Prompt variable updated: ${variable.variable_name}`);
        return updatedVariable;
    }

    async deletePromptVariable(variableId: number): Promise<void> {
        const variable = await this.getVariableById(variableId);
        await this.promptVariableRepo.update(variableId, { is_active: false });
        
        this.logger.log(`Prompt variable deleted: ${variable.variable_name}`);
    }

    async duplicateVariable(variableId: number, userInfo: any, newDisplayName?: string): Promise<PromptTemplateVariable> {
        const originalVariable = await this.getVariableById(variableId);

        const uuid = this.generateShortUuid();
        const displayName = newDisplayName || `${originalVariable.display_name} (Copy)`;
        const sanitizedName = this.sanitizeName(displayName);
        const variableName = `prompt_${sanitizedName}_${uuid}`;

        const duplicatedVariable = this.promptVariableRepo.create({
            variable_name: variableName,
            display_name: displayName,
            description: originalVariable.description,
            prompt: originalVariable.prompt,
            context_source: originalVariable.context_source,
            output_format: originalVariable.output_format,
            type: originalVariable.type,
            group_id: originalVariable.group_id,
            specific_use_case: originalVariable.specific_use_case,
            input_parameters: originalVariable.input_parameters,
            customer_id: userInfo.customerId,
            created_by: userInfo.sub
        });

        const savedVariable = await this.promptVariableRepo.save(duplicatedVariable);
        this.logger.log(`Prompt variable duplicated: ${originalVariable.variable_name} -> ${variableName}`);
        
        return savedVariable;
    }

    async testVariable(variableId: number, testContext: TestPromptVariableDto): Promise<string> {
        const variable = await this.getVariableById(variableId);

        // Build mock assessment context for testing
        const mockContext: AssessmentContext = {
            customer_id: testContext.customer_id || '',
            application_id: testContext.application_id || '',
            standard_id: testContext.standard_id || '',
            policy_id: testContext.policy_id || '',
            assessment_id: testContext.assessment_id || '',
            user_id: testContext.user_id || ''
        } as AssessmentContext;
        
        // Add input parameters to context if provided
        const enrichedContext = {
            ...mockContext,
            input_parameters: testContext.input_parameters || {}
        };

        const aiRequest: AiPromptRequest = {
            prompt: variable.prompt,
            context: enrichedContext,
            output_format: variable.output_format,
            variable_inputs: testContext.input_parameters || {}
        };

        try {
            const result = await this.askAiService.processPromptVariable(aiRequest);
            this.logger.log(`Prompt variable tested successfully: ${variable.variable_name}`);
            return result;
        } catch (error) {
            this.logger.error(`Error testing prompt variable ${variable.variable_name}:`, error);
            throw new BadRequestException('Failed to test variable with AI service');
        }
    }

    private sanitizeName(name: string): string {
        return name.toLowerCase()
                  .replace(/[^a-z0-9]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_|_$/g, '');
    }

    private generateShortUuid(): string {
        return Math.random().toString(36).substring(2, 8);
    }
} 