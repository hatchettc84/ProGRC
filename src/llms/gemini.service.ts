import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "src/logger/logger.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly defaultModel: string;
  private readonly enabled: boolean;
  private readonly apiKey: string | null;

  constructor(
    private config: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.apiKey = this.config.get<string>("GEMINI_API_KEY");
    this.enabled = this.config.get<string>("USE_GEMINI") === "true" && !!this.apiKey;
    this.defaultModel = 
      this.config.get<string>("GEMINI_MODEL") || 
      "gemini-2.0-flash-exp"; // Use gemini-3.0 when available
    
    if (this.enabled && this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.logger.log(`Gemini service initialized with model: ${this.defaultModel}`);
    } else {
      this.genAI = null;
      if (this.config.get<string>("USE_GEMINI") === "true") {
        this.logger.warn("Gemini is enabled but GEMINI_API_KEY is not set");
      }
    }
  }

  /**
   * Check if Gemini is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.enabled || !this.genAI) {
      return false;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.defaultModel });
      // Simple test to verify API is working (with timeout)
      const result = await Promise.race([
        model.generateContent("test"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini availability check timeout')), 5000)
        )
      ]) as any;
      return !!result?.response;
    } catch (error) {
      this.logger.warn(`Gemini not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate text using Gemini
   */
  async generateText(prompt: string, selectedText?: string): Promise<string | null> {
    if (!this.enabled || !this.genAI) {
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
      this.logger.error("Gemini generateText error:", error);
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
    if (!this.enabled || !this.genAI) {
      throw new BadRequestException("Gemini is not enabled");
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: options?.model || this.defaultModel,
        generationConfig: {
          temperature: options?.temperature || 0.5,
          maxOutputTokens: options?.max_tokens || 1000,
        },
      });

      // Convert messages to Gemini format
      // Gemini doesn't support system messages directly, so we combine them
      let systemInstruction = "";
      const conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      const userMessages: string[] = [];

      for (const msg of messages) {
        if (msg.role === "system") {
          systemInstruction += `${msg.content}\n\n`;
        } else if (msg.role === "user") {
          userMessages.push(msg.content);
        } else if (msg.role === "assistant") {
          // Assistant messages indicate multi-turn conversation
          conversationHistory.push({
            role: "model",
            parts: [{ text: msg.content }],
          });
        }
      }

      // Check if this is a multi-turn conversation
      const isMultiTurn = conversationHistory.length > 0 || messages.some(m => m.role === "assistant");
      
      if (isMultiTurn && userMessages.length > 1) {
        // Multi-turn conversation - build history
        // Build history from all messages except the last user message
        const historyMessages: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        
        for (let i = 0; i < messages.length - 1; i++) {
          const msg = messages[i];
          if (msg.role === "user") {
            historyMessages.push({
              role: "user",
              parts: [{ text: msg.content }],
            });
          } else if (msg.role === "assistant") {
            historyMessages.push({
              role: "model",
              parts: [{ text: msg.content }],
            });
          }
        }
        
        const chat = model.startChat({
          history: historyMessages,
          systemInstruction: systemInstruction.trim() || undefined,
        });
        
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage) {
          const result = await chat.sendMessage(lastUserMessage);
          return result.response.text();
        }
      } else {
        // Single-turn conversation - combine system instruction with user message
        const userContent = userMessages.join("\n");
        const fullPrompt = systemInstruction ? `${systemInstruction}${userContent}` : userContent;
        
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
      }

      throw new Error("No response generated");
    } catch (error) {
      this.logger.error("Gemini chat completion error:", error);
      throw new BadRequestException(
        `Gemini error: ${error.response?.data?.error || error.message}`
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
    if (!this.enabled || !this.genAI) {
      throw new BadRequestException("Gemini is not enabled");
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
   * Generate embeddings using Gemini's text-embedding-004 model
   * Returns 768-dimensional embeddings
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.enabled || !this.genAI) {
      return null;
    }

    try {
      // Use Gemini's embedding model
      const model = this.genAI.getGenerativeModel({ 
        model: "text-embedding-004" 
      });

      // Gemini embedContent returns an EmbedContentResponse
      const result = await model.embedContent(text);
      
      // The embedding is in result.embedding.values (Float32Array or number[])
      const embedding = result.embedding?.values;

      if (!embedding || (Array.isArray(embedding) && embedding.length === 0)) {
        this.logger.warn("Gemini embedding generation returned empty result");
        return null;
      }

      // Convert to number array (handles Float32Array)
      const embeddingArray: number[] = Array.isArray(embedding) 
        ? embedding as number[]
        : Array.from(embedding as any) as number[];

      // text-embedding-004 returns 768 dimensions
      if (embeddingArray.length !== 768) {
        this.logger.warn(`Gemini embedding has unexpected dimension: ${embeddingArray.length}, expected 768`);
      }

      return embeddingArray;
    } catch (error) {
      this.logger.error("Gemini embedding generation error:", error);
      return null;
    }
  }
}

