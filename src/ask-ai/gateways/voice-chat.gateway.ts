import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HumeVoiceService } from '../services/hume-voice.service';
import { AskAiService } from '../ask-ai.service';

interface ActiveSession {
  socket: Socket;
  sessionId: string;
  userId: string;
  humeSessionId: string;
  context?: {
    customerId?: string;
    applicationId?: number;
    controlId?: number;
  };
}

@WebSocketGateway({
  namespace: '/ask-ai/voice',
  cors: {
    origin: process.env.FE_HOST?.split(',') || '*',
    credentials: true,
  },
})
export class VoiceChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VoiceChatGateway.name);
  private activeSessions = new Map<string, ActiveSession>();

  constructor(
    private humeVoiceService: HumeVoiceService,
    @Inject(forwardRef(() => AskAiService))
    private askAiService: AskAiService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate via JWT token
      const token = client.handshake.auth?.token || 
                   client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Voice chat connection rejected: No token provided');
        client.disconnect();
        return;
      }

      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (error) {
        this.logger.warn('Voice chat connection rejected: Invalid token');
        client.disconnect();
        return;
      }

      const userId = payload.sub || payload.userId;
      const sessionId = `voice_${userId}_${Date.now()}`;

      // Check if Hume is configured
      if (!this.humeVoiceService.isConfigured()) {
        client.emit('error', { 
          message: 'Voice chat is not available. Hume API is not configured.' 
        });
        client.disconnect();
        return;
      }

      // Start Hume EVI session
      let humeSession;
      try {
        humeSession = await this.humeVoiceService.startEVISession({
          sessionId,
          userId,
          context: {
            customerId: payload.customerId || payload.tenantId,
            applicationId: client.handshake.query?.applicationId 
              ? parseInt(client.handshake.query.applicationId as string) 
              : undefined,
          },
        });
      } catch (error) {
        this.logger.error('Failed to start Hume session:', error);
        client.emit('error', { 
          message: 'Failed to initialize voice chat session.' 
        });
        client.disconnect();
        return;
      }

      this.activeSessions.set(client.id, {
        socket: client,
        sessionId,
        userId,
        humeSessionId: humeSession.sessionId,
        context: {
          customerId: payload.customerId || payload.tenantId,
          applicationId: client.handshake.query?.applicationId 
            ? parseInt(client.handshake.query.applicationId as string) 
            : undefined,
        },
      });

      this.logger.log(`Voice session started: ${sessionId} for user ${userId}`);
      
      client.emit('connected', {
        sessionId,
        status: 'ready',
        message: 'Voice chat connected. You can start speaking.',
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      try {
        await this.humeVoiceService.endSession(session.humeSessionId);
      } catch (error) {
        this.logger.error('Error ending Hume session:', error);
      }
      this.activeSessions.delete(client.id);
      this.logger.log(`Voice session ended: ${session.sessionId}`);
    }
  }

  @SubscribeMessage('audio:chunk')
  async handleAudioChunk(
    @MessageBody() data: { audio: string; format?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id);
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(data.audio, 'base64');

      // Process with Hume
      const result = await this.humeVoiceService.processAudioChunk(
        session.humeSessionId,
        audioBuffer,
        {
          conversationId: session.sessionId,
          applicationId: session.context?.applicationId,
          controlId: session.context?.controlId,
        }
      );

      // If we got text, also process through our chat server for compliance context
      if (result.text) {
        // Integrate with existing AskAiService for compliance-aware responses
        const chatResponse = await this.askAiService.sendMessage({
          scope: 'current',
          session_id: session.sessionId,
          conversation_id: session.sessionId,
          app_id: session.context?.applicationId || 0,
          customer_id: session.context?.customerId || '',
          message: result.text,
          is_valid: true,
          framework_id: undefined,
          standard_id: undefined,
          control_id: session.context?.controlId,
        });

        // Send text response to Hume for TTS
        const audioResponse = await this.humeVoiceService.sendTextMessage(
          session.humeSessionId,
          chatResponse.message,
          session.context
        );

        // Send audio response to client
        client.emit('audio:response', {
          audio: audioResponse.audioResponse.toString('base64'),
          text: audioResponse.text,
          transcript: result.text,
          emotions: result.emotions,
          sources: chatResponse.sources,
          recommendedQuestions: chatResponse.recommended_questions,
        });
      }
    } catch (error) {
      this.logger.error('Error processing audio chunk:', error);
      client.emit('error', { message: 'Failed to process audio' });
    }
  }

  @SubscribeMessage('text:message')
  async handleTextMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id);
    if (!session) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      // Process text through chat server first
      const chatResponse = await this.askAiService.sendMessage({
        scope: 'current',
        session_id: session.sessionId,
        conversation_id: session.sessionId,
        app_id: session.context?.applicationId || 0,
        customer_id: session.context?.customerId || '',
        message: data.text,
        is_valid: true,
        framework_id: undefined,
        standard_id: undefined,
        control_id: session.context?.controlId,
      });

      // Get audio response from Hume
      const audioResponse = await this.humeVoiceService.sendTextMessage(
        session.humeSessionId,
        chatResponse.message,
        session.context
      );

      client.emit('audio:response', {
        audio: audioResponse.audioResponse.toString('base64'),
        text: audioResponse.text,
        transcript: data.text,
        sources: chatResponse.sources,
        recommendedQuestions: chatResponse.recommended_questions,
      });
    } catch (error) {
      this.logger.error('Error processing text message:', error);
      client.emit('error', { message: 'Failed to process message' });
    }
  }

  @SubscribeMessage('voice:stop')
  async handleVoiceStop(@ConnectedSocket() client: Socket) {
    client.emit('voice:stopped', { message: 'Voice recording stopped' });
  }

  @SubscribeMessage('voice:start')
  async handleVoiceStart(@ConnectedSocket() client: Socket) {
    client.emit('voice:started', { message: 'Voice recording started' });
  }
}

