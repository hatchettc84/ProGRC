import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAIApi from "openai";
import { ChatCompletion } from "openai/resources";
import { LoggerService } from "src/logger/logger.service";
import { OllamaService } from "src/llms/ollama.service";

@Injectable()
export class OpenAiService {
  private readonly openai: OpenAIApi;
  constructor(
    private config: ConfigService, 
    private readonly logger: LoggerService,
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
    if (!this.openai) {
      throw new BadRequestException("OpenAI is not initialized");
    }

    try {
      const completion: ChatCompletion = await this.openai.chat.completions.create({
        model: options?.model || "gpt-4",
        messages: messages.map(msg => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        temperature: options?.temperature || 0.5,
        max_tokens: options?.max_tokens || 1000,
      });

      const [content] = completion.choices.map(
        (choice) => choice.message.content
      );
      
      if (!content) {
        throw new Error("No content in OpenAI response");
      }
      
      return content;
    } catch (error) {
      this.logger.error("OpenAI chat completion error:", error);
      throw new BadRequestException(
        `OpenAI error: ${error.response?.data?.error || error.message}`
      );
    }
  }

  /**
   * Generate embeddings using OpenAI's text-embedding-3-small model
   * Returns 1536-dimensional embeddings by default
   */
  async generateEmbedding(text: string, dimensions: number = 1536): Promise<number[] | null> {
    if (!this.openai) {
      return null;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: dimensions,
      });

      if (!response.data || response.data.length === 0) {
        this.logger.warn("OpenAI embedding generation returned empty result");
        return null;
      }

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error("OpenAI embedding generation error:", error);
      return null;
    }
  }
}
