import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class HumeVoiceService {
  private readonly logger = new Logger(HumeVoiceService.name);
  private readonly humeApiKey: string;
  private readonly humeApiUrl: string;
  
  constructor(
    private config: ConfigService,
    private httpService: HttpService
  ) {
    this.humeApiKey = this.config.get<string>('HUME_API_KEY') || '';
    this.humeApiUrl = this.config.get<string>('HUME_API_URL') || 'https://api.hume.ai';
    
    if (!this.humeApiKey) {
      this.logger.warn('HUME_API_KEY not configured. Voice features will be disabled.');
    }
  }

  /**
   * Check if Hume is configured
   */
  isConfigured(): boolean {
    return !!this.humeApiKey;
  }

  /**
   * Start a new EVI conversation session
   */
  async startEVISession(config: {
    sessionId: string;
    userId: string;
    context?: any;
  }): Promise<{ sessionId: string; config: any }> {
    if (!this.isConfigured()) {
      throw new Error('Hume API is not configured');
    }

    try {
      // Initialize EVI session with Hume
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.humeApiUrl}/evi/v1/sessions`,
          {
            session_id: config.sessionId,
            user_id: config.userId,
            // Custom configuration for GRC context
            config: {
              version: 'v1',
              language: 'en',
              // Add compliance-specific context
              system_prompt: this.buildSystemPrompt(config.context),
              // Voice settings
              voice: {
                provider: 'HUME',
                voice_id: 'default', // Can customize per user
              },
            },
          },
          {
            headers: {
              'X-Hume-Api-Key': this.humeApiKey,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      this.logger.log(`Hume EVI session started: ${config.sessionId}`);
      return {
        sessionId: response.data.session_id || config.sessionId,
        config: response.data.config || {},
      };
    } catch (error) {
      this.logger.error('Failed to start EVI session:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk and get response
   */
  async processAudioChunk(
    sessionId: string,
    audioChunk: Buffer,
    metadata?: {
      conversationId?: string;
      applicationId?: number;
      controlId?: number;
    }
  ): Promise<{
    text: string;
    audioResponse?: Buffer;
    emotions?: any;
    suggestedActions?: string[];
  }> {
    if (!this.isConfigured()) {
      throw new Error('Hume API is not configured');
    }

    try {
      // Convert audio to form data
      const formData = new (FormData as any)();
      formData.append('audio', audioChunk, {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.humeApiUrl}/evi/v1/sessions/${sessionId}/audio`,
          formData,
          {
            headers: {
              'X-Hume-Api-Key': this.humeApiKey,
              ...formData.getHeaders(),
            },
          }
        )
      );

      return {
        text: response.data.transcript || '',
        audioResponse: response.data.audio_response 
          ? Buffer.from(response.data.audio_response, 'base64')
          : undefined,
        emotions: response.data.emotions,
        suggestedActions: response.data.suggested_actions || [],
      };
    } catch (error) {
      this.logger.error('Failed to process audio chunk:', error);
      throw error;
    }
  }

  /**
   * Send text message and get audio response
   */
  async sendTextMessage(
    sessionId: string,
    text: string,
    context?: any
  ): Promise<{
    audioResponse: Buffer;
    text: string;
    emotions?: any;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Hume API is not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.humeApiUrl}/evi/v1/sessions/${sessionId}/text`,
          {
            text,
            context: context || {},
          },
          {
            headers: {
              'X-Hume-Api-Key': this.humeApiKey,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        audioResponse: Buffer.from(response.data.audio || '', 'base64'),
        text: response.data.text_response || text,
        emotions: response.data.emotions,
      };
    } catch (error) {
      this.logger.error('Failed to send text message:', error);
      throw error;
    }
  }

  /**
   * Build system prompt with GRC context
   */
  private buildSystemPrompt(context?: any): string {
    const basePrompt = `You are a knowledgeable GRC (Governance, Risk, and Compliance) assistant helping ISSOs, CSAMs, and compliance professionals. 
You provide clear, accurate, and empathetic guidance on compliance frameworks, controls, evidence collection, and risk management.

Your responses should be:
- Professional yet approachable
- Technically accurate
- Actionable and specific
- Empathetic to the user's compliance challenges`;

    if (context?.application) {
      return `${basePrompt}

Current Context:
- Application: ${context.application.name}
- Standards: ${context.standards?.map((s: any) => s.name).join(', ') || 'None'}
- Current Control: ${context.control?.name || 'None'}`;
    }

    return basePrompt;
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.humeApiUrl}/evi/v1/sessions/${sessionId}`,
          {
            headers: {
              'X-Hume-Api-Key': this.humeApiKey,
            },
          }
        )
      );
      this.logger.log(`Hume EVI session ended: ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to end session:', error);
    }
  }
}

