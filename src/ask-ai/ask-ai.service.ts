import { BadRequestException, ForbiddenException, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAIApi from "openai";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { ConfigService } from '@nestjs/config';
import { ChatCompletion } from 'openai/resources';
import { LoggerService } from 'src/logger/logger.service';
import { SendMessageDto, SendMessageDSDto } from './dto/send-message.dto';
import { VoteDto } from './dto/vote.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Standard } from 'src/entities/standard_v1.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { OllamaService } from 'src/llms/ollama.service';


@Injectable()
export class AskAiService {
    private readonly openai: OpenAIApi;
    private readonly chatServerUrl: string;

    constructor(
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(AssessmentDetail) private readonly assessmentDetailsRepo: Repository<AssessmentDetail>,
        @InjectRepository(AssessmentOutline) private readonly assessmentOutlineRepo: Repository<AssessmentOutline>,
        @InjectRepository(AssessmentHistory) private readonly assessmentHistoryRepo: Repository<AssessmentOutline>,
        @InjectRepository(AssessmentSections) private readonly assessmentSectionRepo: Repository<AssessmentSections>,
        @InjectRepository(AssessmentSectionsHistory) private readonly assessmentSectionHistoryRepo: Repository<AssessmentSectionsHistory>,
        @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Standard>,

        private config: ConfigService,
        private readonly logger: LoggerService,
        private readonly httpService: HttpService,
        private readonly ollamaService: OllamaService
    ) {
        const apiKey = this.config.get<string>("OPENAI_API_KEY");
        if (!apiKey) {
            console.log("OPENAI_API_KEY is not set");
        } else {
            this.openai = new OpenAIApi({
                apiKey: apiKey,
            });
        }
        this.chatServerUrl = this.config.get<string>('CHAT_SERVER_URL');
    }

    async submitQuery(userInfo: any, data: any) {
        const orgId = userInfo.tenant_id;
        const userId = userInfo.userId;
        let content = '';
        const orgExists = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgExists) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        if (!data.assessment_id) {
            throw new ForbiddenException({
                error: `Invalid assessment_id!`,
                message: `Invalid assessment_id!`,
            });
        }

        if (!data.query_text) {
            throw new ForbiddenException({
                error: `Invalid query_text!`,
                message: `Invalid query_text!`,
            });
        }

        content = data.section_text;

        // Format the response to match the expected structure
        const response = {
            id: Math.floor(Math.random() * 1000), // Generate a random ID for the response
            assessment_id: data.assessment_id,
            section_id: data.section_id,
            query_text: data.query_text,
            message: content,
            recommended_questions: [
                "What are the specific requirements for this policy?",
                "How often should this policy be reviewed?",
                "Who is responsible for enforcing this policy?"
            ],
            sources: [
                {
                    framework: "Internal",
                    standard: "Policy",
                    control: "POL-" + data.assessment_id,
                    description: "Internal Policy Document",
                    relevance_score: 0.95
                }
            ],
            description: 'Please find the result below:',
        };

        return response;
    }

    async generateText(prompt: string, selectedText: string) {
        const fullPrompt = selectedText
            ? `Base Instructions: Selected Content will be provided as a html string. The selected content should be transformed based on the prompt provided below\n
          Selected Content: ${selectedText}\n
          Prompt:${prompt}`
            : prompt;

        try {
            // Try Ollama first if enabled
            const ollamaAvailable = await this.ollamaService.isAvailable();
            if (ollamaAvailable) {
                try {
                    const ollamaResult = await this.ollamaService.generateText(prompt, selectedText);
                    if (ollamaResult) {
                        this.logger.log('Text generated using Ollama');
                        return ollamaResult;
                    }
                } catch (ollamaError) {
                    this.logger.warn('Ollama generation failed, falling back to OpenAI:', ollamaError.message);
                }
            }

            // Fallback to OpenAI
            if (!this.openai) {
                console.log("OpenAI is not initialized");
                return null;
            }

            // Make a request to the ChatGPT model
            const completion: ChatCompletion =
                await this.openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: fullPrompt,
                        },
                    ],
                    temperature: 0.5,
                    max_tokens: 1000,
                });

            // Extract the content from the response
            const [content] = completion.choices.map(
                (choice) => choice.message.content
            );
            return content;
        } catch (error) {
            this.logger.error(error);
            throw new BadRequestException(error.message);
        }
    }

    async sendMessage(sendMessageDto: SendMessageDto) {
        try {
            // Fetch standard and framework information if standard_id is provided
            let frameworkName = null;
            let standardName = null;
            let controlName = null;

            if (sendMessageDto.standard_id) {
                const standard = await this.standardRepo.findOne({
                    where: { id: sendMessageDto.standard_id },
                    relations: ['framework']
                });

                if (standard) {
                    standardName = standard.name;
                    if (standard.framework) {
                        frameworkName = standard.framework.name;
                    }
                }
            }

            // Fetch control information if control_id is provided
            if (sendMessageDto.control_id) {
                const control = await this.controlRepo.findOne({
                    where: { id: sendMessageDto.control_id }
                });

                if (control) {
                    controlName = control.name;
                }
            }

            // Create SendMessageDSDto with the fetched information
            const sendMessageDSDto: SendMessageDSDto = {
                ...sendMessageDto,
                framework_name: frameworkName,
                standard_name: standardName,
                control_name: controlName
            };

            // Send the populated DTO to the chat server
            const response = await firstValueFrom(
                this.httpService.post(`${this.chatServerUrl}/sendmessage`, sendMessageDSDto)
            );

            // Ensure the response has the expected format
            const formattedResponse = {
                message: response.data.message || response.data.content || "No response available",
                recommended_questions: response.data.recommended_questions || [],
                sources: response.data.sources || []
            };

            return formattedResponse;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Failed to send message',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async submitVote(voteDto: VoteDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.chatServerUrl}/vote`, voteDto)
            );

            // Format the response to match the expected structure
            const formattedResponse = {
                status: "success",
                message: "Vote recorded successfully"
            };

            return formattedResponse;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Failed to submit vote',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async processPromptVariable(aiRequest: { prompt: string; context: any; output_format: string; variable_inputs?: Record<string, any> }): Promise<string> {
        try {
            // Log the request for debugging
            this.logger.log('Processing prompt variable request:', {
                prompt: aiRequest.prompt?.substring(0, 100) + '...',
                context_keys: Object.keys(aiRequest.context || {}),
                output_format: aiRequest.output_format,
                variable_inputs: aiRequest.variable_inputs
            });

            // Check if chat server should be used (default behavior)
            const useChatServer = (this.config.get<string>('USE_CHAT_SERVER_FOR_PROMPT_VARIABLES') || 'true') !== 'false';

            if (useChatServer && this.chatServerUrl) {
                try {
                    return await this.processPromptVariableWithChatServer(aiRequest);
                } catch (chatServerError) {
                    this.logger.warn('Chat server failed, falling back to OpenAI:', chatServerError.message);
                    // Fall through to OpenAI implementation
                }
            }

            // Fallback to OpenAI implementation
            return await this.processPromptVariableWithOpenAI(aiRequest);

        } catch (error) {
            this.logger.error('Error processing prompt variable:', error);
            throw new BadRequestException(`Failed to process prompt variable: ${error.message}`);
        }
    }

    private async processPromptVariableWithChatServer(aiRequest: { prompt: string; context: any; output_format: string; variable_inputs?: Record<string, any> }): Promise<string> {
        // Prepare the message with context and formatting instructions
        const contextMessage = `
Context Information:
${JSON.stringify(aiRequest.context, null, 2)}

${aiRequest.variable_inputs && Object.keys(aiRequest.variable_inputs).length > 0 ?
                `Input Parameters:
${JSON.stringify(aiRequest.variable_inputs, null, 2)}` : ''}

Output Format Requirements:
${aiRequest.output_format}

Task: ${aiRequest.prompt}
        `;

        // Create SendMessageDto for chat server
        const sendMessageDto: SendMessageDto = {
            scope: 'database_search',
            session_id: `session_${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conversation_id: `conv_${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            app_id: aiRequest.context?.application_id || 0,
            framework_id: aiRequest.context?.framework_id,
            standard_id: aiRequest.context?.standard_id,
            control_id: aiRequest.context?.control_id,
            customer_id: aiRequest.context?.customer_id || aiRequest.context?.org_id || 'unknown',
            message: contextMessage.trim(),
            is_valid: true
        };

        // Send message to chat server
        const response = await this.sendMessage(sendMessageDto);

        if (!response.message) {
            throw new Error('No message content received from chat server');
        }

        this.logger.log('Prompt variable processed successfully via chat server');
        return response.message;
    }

    private async processPromptVariableWithOpenAI(aiRequest: { prompt: string; context: any; output_format: string; variable_inputs?: Record<string, any> }): Promise<string> {
        // Try Ollama first if enabled
        const ollamaAvailable = await this.ollamaService.isAvailable();
        if (ollamaAvailable) {
            try {
                const result = await this.ollamaService.processPromptVariable(
                    aiRequest.prompt,
                    aiRequest.context,
                    aiRequest.output_format,
                    aiRequest.variable_inputs
                );
                this.logger.log('Prompt variable processed successfully via Ollama');
                return result;
            } catch (ollamaError) {
                this.logger.warn('Ollama processing failed, falling back to OpenAI:', ollamaError.message);
            }
        }

        // Fallback to OpenAI
        // Prepare the system message with context and instructions
        const systemMessage = `
You are an AI assistant helping to process custom template variables. 

Context Information:
${JSON.stringify(aiRequest.context, null, 2)}

${aiRequest.variable_inputs && Object.keys(aiRequest.variable_inputs).length > 0 ?
                `Input Parameters:
${JSON.stringify(aiRequest.variable_inputs, null, 2)}` : ''}

Output Format Requirements:
${aiRequest.output_format}

Please process the following prompt using the provided context and input parameters:
        `;

        if (!this.openai) {
            console.log("OpenAI is not initialized");
            return null;
        }

        // Use OpenAI to process the variable
        const completion: ChatCompletion = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemMessage,
                },
                {
                    role: "user",
                    content: aiRequest.prompt,
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent outputs
            max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content generated from AI');
        }

        this.logger.log('Prompt variable processed successfully via OpenAI');
        return content;
    }
}
