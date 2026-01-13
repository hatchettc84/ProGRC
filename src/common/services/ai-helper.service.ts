import { Injectable } from '@nestjs/common';
import { GeminiService } from 'src/llms/gemini.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { GradientService } from 'src/llms/gradient.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AiHelperService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly gradientService: GradientService,
    private readonly openAiService: OpenAiService,
    private readonly ollamaService: OllamaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get the best available LLM service (priority: Ollama > Gemini > Gradient > OpenAI)
   * Ollama is prioritized to eliminate external API calls
   */
  private async getAvailableLLMService(): Promise<'gemini' | 'gradient' | 'openai' | 'ollama' | null> {
    // ✅ PRIORITY 1: Check Ollama FIRST (local, no API calls)
    try {
      const useOllama = await this.ollamaService.isAvailable();
      if (useOllama) {
        this.logger.log('Using Ollama for AI processing (local, no API calls)');
        return 'ollama';
      }
    } catch (error) {
      this.logger.warn('Ollama availability check failed:', error.message);
    }

    // Fallback to cloud services only if Ollama is unavailable
    try {
      const useGemini = await this.geminiService.isAvailable();
      if (useGemini) {
        this.logger.log('Using Gemini for AI processing (fallback)');
        return 'gemini';
      }
    } catch (error) {
      this.logger.warn('Gemini availability check failed:', error.message);
    }

    try {
      const useGradient = await this.gradientService.isAvailable();
      if (useGradient) {
        this.logger.log('Using Gradient AI for AI processing (fallback)');
        return 'gradient';
      }
    } catch (error) {
      this.logger.warn('Gradient AI availability check failed:', error.message);
    }

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (openaiApiKey && openaiApiKey.trim()) {
        this.logger.log('Using OpenAI for AI processing (fallback)');
        return 'openai';
      }
    } catch (error) {
      this.logger.warn('OpenAI check failed:', error.message);
    }

    this.logger.warn('No LLM service available');
    return null;
  }

  /**
   * Generate text using the best available LLM service
   */
  async generateText(
    prompt: string,
    systemMessage?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<string | null> {
    const serviceType = await this.getAvailableLLMService();
    
    if (!serviceType) {
      this.logger.warn('No AI service available for text generation');
      return null;
    }

    const messages = [
      ...(systemMessage ? [{ role: 'system' as const, content: systemMessage }] : []),
      { role: 'user' as const, content: prompt },
    ];

    const defaultOptions = {
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2000,
    };

    try {
      let response: string;

      switch (serviceType) {
        case 'gemini':
          response = await this.geminiService.chatCompletion(messages, defaultOptions);
          break;
        case 'gradient':
          response = await this.gradientService.chatCompletion(messages, defaultOptions);
          break;
        case 'openai':
          response = await this.openAiService.chatCompletion(messages, defaultOptions);
          break;
        case 'ollama':
          response = await this.ollamaService.chatCompletion(messages, defaultOptions);
          break;
        default:
          return null;
      }

      return response;
    } catch (error) {
      this.logger.error(`Error generating text with ${serviceType}:`, error);
      // Try fallback services if primary fails
      if (serviceType === 'gemini') {
        this.logger.log('Gemini failed, trying fallback services...');
        const fallbackService = await this.getAvailableLLMService();
        if (fallbackService && fallbackService !== 'gemini') {
          try {
            const messages = [
              ...(systemMessage ? [{ role: 'system' as const, content: systemMessage }] : []),
              { role: 'user' as const, content: prompt },
            ];
            let response: string;
            switch (fallbackService) {
              case 'gradient':
                response = await this.gradientService.chatCompletion(messages, defaultOptions);
                break;
              case 'openai':
                response = await this.openAiService.chatCompletion(messages, defaultOptions);
                break;
              case 'ollama':
                response = await this.ollamaService.chatCompletion(messages, defaultOptions);
                break;
              default:
                return null;
            }
            this.logger.log(`Successfully used fallback service: ${fallbackService}`);
            return response;
          } catch (fallbackError) {
            this.logger.error(`Fallback service ${fallbackService} also failed:`, fallbackError);
          }
        }
      }
      return null;
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateStructuredResponse<T>(
    prompt: string,
    systemMessage?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<T | null> {
    const jsonPrompt = `${prompt}

Return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or explanatory text.`;

    const response = await this.generateText(jsonPrompt, systemMessage, {
      ...options,
      temperature: options?.temperature || 0.3, // Lower temperature for structured output
    });

    if (!response) {
      return null;
    }

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return JSON.parse(response) as T;
    } catch (error) {
      this.logger.error('Error parsing JSON response:', error);
      return null;
    }
  }
}


