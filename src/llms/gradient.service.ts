import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "src/logger/logger.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface GradientMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GradientChatRequest {
  model?: string;
  messages: GradientMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GradientChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

@Injectable()
export class GradientService {
  private readonly gradientApiUrl: string;
  private readonly apiKey: string | null;
  private readonly defaultModel: string;
  private readonly enabled: boolean;

  constructor(
    private config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService
  ) {
    this.apiKey = this.config.get<string>("GRADIENT_API_KEY");
    this.enabled = this.config.get<string>("USE_GRADIENT") === "true" && !!this.apiKey;
    this.gradientApiUrl = 
      this.config.get<string>("GRADIENT_API_URL") || 
      "https://api.gradient.ai/v1";
    this.defaultModel = 
      this.config.get<string>("GRADIENT_MODEL") || 
      "llama-3.1-70b-instruct";
    
    if (this.enabled && this.apiKey) {
      this.logger.log(`Gradient AI service initialized: ${this.gradientApiUrl}, model: ${this.defaultModel}`);
    } else {
      if (this.config.get<string>("USE_GRADIENT") === "true") {
        this.logger.warn("Gradient AI is enabled but GRADIENT_API_KEY is not set");
      }
    }
  }

  /**
   * Check if Gradient AI is available and healthy
   */
  async isAvailable(): Promise<boolean> {
    if (!this.enabled || !this.apiKey) {
      return false;
    }

    try {
      // Check if this is an agent endpoint
      const isAgentEndpoint = this.gradientApiUrl.includes('agents.do-ai.run');
      
      if (isAgentEndpoint) {
        // For agent endpoints, test with a simple chat request
        const testResponse = await firstValueFrom(
          this.httpService.post(
            `${this.gradientApiUrl}/chat/completions`,
            {
              messages: [{ role: "user", content: "test" }],
            },
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          )
        );
        return testResponse.status === 200;
      } else {
        // For standard API, try to list models
        const response = await firstValueFrom(
          this.httpService.get(`${this.gradientApiUrl}/models`, {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
            timeout: 5000,
          })
        );
        return response.status === 200;
      }
    } catch (error) {
      // Only log warning if it's not a connection error (expected when service is not available)
      if (!error.message?.includes('ECONNREFUSED') && !error.message?.includes('timeout') && !error.message?.includes('401') && !error.message?.includes('403')) {
        this.logger.warn(`Gradient AI not available at ${this.gradientApiUrl}: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Generate text using Gradient AI
   */
  async generateText(prompt: string, selectedText?: string): Promise<string | null> {
    if (!this.enabled || !this.apiKey) {
      return null;
    }

    const fullPrompt = selectedText
      ? `Base Instructions: Selected Content will be provided as a html string. The selected content should be transformed based on the prompt provided below\n
      Selected Content: ${selectedText}\n
      Prompt:${prompt}`
      : prompt;

    try {
      const response = await this.chatCompletion(
        [
          {
            role: "system",
            content: fullPrompt,
          },
        ],
        {
          temperature: 0.5,
          max_tokens: 1000,
        }
      );

      return response;
    } catch (error) {
      this.logger.error("Gradient AI generateText error:", error);
      return null;
    }
  }

  /**
   * Chat completion compatible with OpenAI's interface
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options?: {
      temperature?: number;
      max_tokens?: number;
      model?: string;
    }
  ): Promise<string> {
    if (!this.enabled || !this.apiKey) {
      throw new BadRequestException("Gradient AI is not enabled");
    }

    try {
      // Convert messages to Gradient format
      const gradientMessages: GradientMessage[] = messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

      // Check if this is an agent endpoint (contains 'agents.do-ai.run')
      const isAgentEndpoint = this.gradientApiUrl.includes('agents.do-ai.run');
      
      // Build request - agent endpoints might not need model parameter
      const request: GradientChatRequest = {
        messages: gradientMessages,
        temperature: options?.temperature || 0.5,
        max_tokens: options?.max_tokens || 1000,
        stream: false,
      };

      // Only include model if not an agent endpoint (agent has model pre-configured)
      if (!isAgentEndpoint && (options?.model || this.defaultModel)) {
        request.model = options?.model || this.defaultModel;
      }

      // Determine endpoint path
      // Agent endpoints might use /chat or /v1/chat/completions
      // Standard API uses /chat/completions
      const endpointPath = isAgentEndpoint 
        ? '/chat/completions' // Try standard OpenAI-compatible format first
        : '/chat/completions';

      const response = await firstValueFrom(
        this.httpService.post<GradientChatResponse>(
          `${this.gradientApiUrl}${endpointPath}`,
          request,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 120000, // 2 minute timeout for longer responses
          }
        )
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error("No choices in Gradient AI response");
      }

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in Gradient AI response");
      }

      return content;
    } catch (error) {
      this.logger.error("Gradient AI chat completion error:", error);
      throw new BadRequestException(
        `Gradient AI error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Process prompt variable (for template variables)
   */
  async processPromptVariable(
    prompt: string,
    context: any,
    outputFormat: string,
    variableInputs?: Record<string, any>
  ): Promise<string> {
    if (!this.enabled || !this.apiKey) {
      throw new BadRequestException("Gradient AI is not enabled");
    }

    const systemMessage = `
You are an AI assistant helping to process custom template variables. 

Context Information:
${JSON.stringify(context, null, 2)}

${variableInputs && Object.keys(variableInputs).length > 0
  ? `Input Parameters:
${JSON.stringify(variableInputs, null, 2)}`
  : ""}

Output Format Requirements:
${outputFormat}

Please process the following prompt using the provided context and input parameters:
    `;

    return await this.chatCompletion(
      [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.3,
        max_tokens: 2000,
      }
    );
  }

  /**
   * Generate embeddings using Gradient AI
   * Note: Gradient AI Platform may have different embedding endpoints
   * This is a placeholder that can be implemented once the API is confirmed
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.enabled || !this.apiKey) {
      return null;
    }

    try {
      // Gradient AI Platform embedding endpoint (to be confirmed)
      const response = await firstValueFrom(
        this.httpService.post<{ data: Array<{ embedding: number[] }> }>(
          `${this.gradientApiUrl}/embeddings`,
          {
            model: "text-embedding-ada-002", // Default embedding model, adjust as needed
            input: text,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        )
      );

      const embedding = response.data?.data?.[0]?.embedding;
      if (!embedding || embedding.length === 0) {
        this.logger.warn("Gradient AI embedding generation returned empty result");
        return null;
      }

      return embedding;
    } catch (error) {
      this.logger.error("Gradient AI embedding generation error:", error);
      return null;
    }
  }
}

