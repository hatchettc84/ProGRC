import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from "openai";
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { OllamaService } from 'src/llms/ollama.service';

@Injectable()
export class AskAiService {
    private readonly openaiClient: OpenAI;
    private readonly logger = new Logger(AskAiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly ollamaService: OllamaService
    ) {
        const apiKey = this.config.get<string>("OPENAI_API_KEY");
        if (!apiKey) {
            console.log("OPENAI_API_KEY is not set");
        } else {
            this.openaiClient = new OpenAI({
                apiKey: apiKey,
            });
        }
    }

    async question(prompt: string): Promise<string> {
        const enableAskAI = this.config.get<string>('OPENAI_HELP_CENTER_ENABLED') === 'true';
        
        // Try Ollama first if enabled
        const ollamaAvailable = await this.ollamaService.isAvailable();
        if (ollamaAvailable) {
            try {
                const result = await this.ollamaService.chatCompletion(
                    [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    {
                        temperature: 0.7,
                        max_tokens: 1000,
                    }
                );
                this.logger.log('AI response generated successfully using Ollama');
                return result || 'Sorry, I am not able to answer that question right now.';
            } catch (ollamaError) {
                this.logger.warn('Ollama failed, falling back to OpenAI:', ollamaError.message);
            }
        }

        // Fallback to OpenAI
        if (!enableAskAI || !this.openaiClient) {
            return 'Sorry, I am not available right now. Please try again later.';
        }
        try {
            const model = this.config.get<string>('OPENAI_HELP_CENTER_MODEL');
            const messages: ChatCompletionMessageParam[] = [
                {
                    role: 'user',
                    content: prompt,
                },
            ];

            const completion: ChatCompletion = await this.openaiClient.chat.completions.create({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            });

            this.logger.log('AI response generated successfully using OpenAI');
            const [content] = completion.choices.map(
                (choice) => choice.message.content
            );
            return content || 'Sorry, I am not able to answer that question right now.';
        } catch (error) {
            this.logger.error('Error generating AI response', error);
            throw new BadRequestException('Failed to generate AI response');
        }
    }
}
