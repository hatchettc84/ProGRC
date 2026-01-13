import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "src/logger/logger.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

@Injectable()
export class OllamaService {
  private readonly ollamaBaseUrl: string;
  private readonly defaultModel: string;
  private readonly enabled: boolean;

  constructor(
    private config: ConfigService,
    private readonly logger: LoggerService,
    private readonly httpService: HttpService
  ) {
    this.enabled = this.config.get<string>("USE_OLLAMA") === "true";
    this.ollamaBaseUrl = 
      this.config.get<string>("OLLAMA_BASE_URL") || 
      "http://localhost:11434";
    this.defaultModel = 
      this.config.get<string>("OLLAMA_MODEL") || 
      "llama3.2";
    
    if (this.enabled) {
      this.logger.log(`Ollama service initialized: ${this.ollamaBaseUrl}, model: ${this.defaultModel}`);
    }
  }

  /**
   * Check if Ollama is available and healthy
   */
  async isAvailable(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ollamaBaseUrl}/api/tags`, {
          timeout: 3000, // Reduced timeout for faster fallback
        })
      );
      return response.status === 200;
    } catch (error) {
      // Only log warning if it's not a connection error (expected when Ollama is not running)
      if (!error.message?.includes('ECONNREFUSED') && !error.message?.includes('timeout')) {
        this.logger.warn(`Ollama not available at ${this.ollamaBaseUrl}: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Generate text using Ollama (similar to OpenAI's generateText)
   */
  async generateText(prompt: string, selectedText?: string): Promise<string | null> {
    if (!this.enabled) {
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
      this.logger.error("Ollama generateText error:", error);
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
    if (!this.enabled) {
      throw new BadRequestException("Ollama is not enabled");
    }

    try {
      // Convert messages to Ollama format
      const ollamaMessages: OllamaMessage[] = messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

      const request: OllamaChatRequest = {
        model: options?.model || this.defaultModel,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.5,
          num_predict: options?.max_tokens || 1000,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post<OllamaChatResponse>(
          `${this.ollamaBaseUrl}/api/chat`,
          request,
          {
            timeout: 120000, // 2 minute timeout for longer responses
          }
        )
      );

      if (!response.data.message?.content) {
        throw new Error("No content in Ollama response");
      }

      return response.data.message.content;
    } catch (error) {
      this.logger.error("Ollama chat completion error:", error);
      throw new BadRequestException(
        `Ollama error: ${error.response?.data?.error || error.message}`
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
    if (!this.enabled) {
      throw new BadRequestException("Ollama is not enabled");
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
        temperature: 0.3, // Lower temperature for more consistent outputs
        max_tokens: 2000,
      }
    );
  }

  /**
   * List available models on the Ollama server
   */
  async listModels(): Promise<string[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<{ models: Array<{ name: string }> }>(
          `${this.ollamaBaseUrl}/api/tags`
        )
      );
      return response.data.models.map((m) => m.name);
    } catch (error) {
      this.logger.error("Error listing Ollama models:", error);
      return [];
    }
  }

  /**
   * Generate embeddings using Ollama's nomic-embed-text model
   * Returns 768-dimensional embeddings
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ embedding: number[] }>(
          `${this.ollamaBaseUrl}/api/embeddings`,
          {
            model: "nomic-embed-text",
            prompt: text,
          },
          {
            timeout: 30000, // 30 second timeout
          }
        )
      );

      if (!response.data?.embedding || response.data.embedding.length === 0) {
        this.logger.warn("Ollama embedding generation returned empty result");
        return null;
      }

      return response.data.embedding;
    } catch (error) {
      this.logger.error("Ollama embedding generation error:", error);
      return null;
    }
  }
}

