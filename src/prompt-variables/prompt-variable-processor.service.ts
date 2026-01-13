import { Injectable, BadRequestException } from '@nestjs/common';
import { PromptVariableService } from './prompt-variable.service';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { LoggerService } from 'src/logger/logger.service';
import { AssessmentContext, AiPromptRequest } from './interfaces/assessment-context.interface';

@Injectable()
export class PromptVariableProcessor {
    private readonly PROMPT_VARIABLE_PATTERN = /\{\{prompt_[a-zA-Z0-9_\-]+(\|[^}]+)?\}\}/g;
    
    constructor(
        private promptVariableService: PromptVariableService,
        private askAiService: AskAiService,
        private logger: LoggerService
    ) {}

    async processTemplate(templateContent: string, assessmentContext: AssessmentContext): Promise<string> {
        try {
            // 1. Find all prompt variable patterns (including those with input parameters)
            const promptVariables = this.findPromptVariables(templateContent);
            
            if (promptVariables.length === 0) {
                return templateContent;
            }

            this.logger.log(`Found ${promptVariables.length} prompt variables to process`);

            // 2. Resolve each variable
            const resolutions = await Promise.allSettled(
                promptVariables.map(variable => this.resolveVariable(variable, assessmentContext))
            );

            // 3. Replace variables in template
            let processedContent = templateContent;
            for (let i = 0; i < promptVariables.length; i++) {
                const variable = promptVariables[i];
                const resolution = resolutions[i];
                
                if (resolution.status === 'fulfilled') {
                    processedContent = processedContent.replace(variable, resolution.value);
                    this.logger.log(`Successfully resolved variable: ${variable}`);
                } else {
                    // Error handling - highlight failed variable
                    const errorSpan = `<span style="background:#fbeeb8;">${variable}</span>`;
                    processedContent = processedContent.replace(variable, errorSpan);
                    this.logger.error(`Failed to resolve variable ${variable}:`, resolution.reason);
                }
            }

            return processedContent;
        } catch (error) {
            this.logger.error('Error processing template:', error);
            throw new BadRequestException('Failed to process template variables');
        }
    }

    private findPromptVariables(content: string): string[] {
        const matches = content.match(this.PROMPT_VARIABLE_PATTERN);
        return matches ? [...new Set(matches)] : []; // Remove duplicates
    }

    private parseVariableWithInputs(fullVariable: string): { variableName: string; inputs: Record<string, any> } {
        // Remove {{ }} brackets
        const cleanVariable = fullVariable.slice(2, -2);
        
        // Split by pipe to separate variable name from inputs
        const parts = cleanVariable.split('|');
        const variableName = parts[0];
        const inputs: Record<string, any> = {};
        
        // Parse input parameters (key=value format)
        for (let i = 1; i < parts.length; i++) {
            const [key, value] = parts[i].split('=', 2);
            if (key && value) {
                inputs[key.trim()] = value.trim();
            }
        }
        
        return { variableName, inputs };
    }

    private async resolveVariable(fullVariable: string, context: AssessmentContext): Promise<string> {
        try {
            const { variableName, inputs } = this.parseVariableWithInputs(fullVariable);
            
            // Get variable details from database
            const variable = await this.promptVariableService.getVariableByName(variableName);
            
            if (!variable) {
                throw new Error(`Variable ${variableName} not found`);
            }

            // Validate required input parameters
            if (variable.input_parameters && variable.input_parameters.length > 0) {
                for (const param of variable.input_parameters) {
                    if (param.required && !inputs[param.name]) {
                        throw new Error(`Required parameter '${param.name}' missing for variable ${variableName}`);
                    }
                }
            }
            
            // Add input parameters to context
            const enrichedContext = {
                ...context,
                input_parameters: inputs
            };

            const aiRequest: AiPromptRequest = {
                prompt: variable.prompt,
                context: enrichedContext,
                output_format: variable.output_format,
                variable_inputs: inputs
            };

            const resolution = await this.askAiService.processPromptVariable(aiRequest);
            
            return resolution;
        } catch (error) {
            this.logger.error(`Error resolving variable ${fullVariable}:`, error);
            throw error;
        }
    }

    // Helper method to check if content has prompt variables
    hasPromptVariables(content: string): boolean {
        return this.PROMPT_VARIABLE_PATTERN.test(content);
    }

    // Helper method to extract just variable names (without inputs)
    extractVariableNames(content: string): string[] {
        const fullVariables = this.findPromptVariables(content);
        return fullVariables.map(fullVar => {
            const { variableName } = this.parseVariableWithInputs(fullVar);
            return variableName;
        });
    }

    // Helper method to validate variable syntax
    validateVariableSyntax(variableString: string): boolean {
        return this.PROMPT_VARIABLE_PATTERN.test(variableString);
    }
} 