# Hume AI Voice Integration for ProGPT

## Overview

This document describes the integration of Hume AI's Empathetic Voice Interface (EVI) for voice chat capabilities in the ProGPT (formerly Ask AI) feature.

## What Was Implemented

### Backend Changes

1. **Hume Voice Service** (`src/ask-ai/services/hume-voice.service.ts`)
   - Service for interacting with Hume AI's EVI API
   - Handles session management, audio processing, and text-to-speech
   - Includes GRC-specific system prompts

2. **Voice Chat WebSocket Gateway** (`src/ask-ai/gateways/voice-chat.gateway.ts`)
   - Real-time bidirectional audio streaming via Socket.IO
   - JWT authentication for secure connections
   - Integration with existing AskAiService for compliance-aware responses

3. **Module Updates** (`src/ask-ai/ask-ai.module.ts`)
   - Added HumeVoiceService and VoiceChatGateway providers
   - Integrated with AuthModule for JWT support

### Frontend Changes

1. **Display Name Updates**
   - Changed all "Ask AI" display names to "ProGPT" across the platform
   - Updated in:
     - `AskAIChat.tsx` component
     - `EditorConceptView.tsx`
     - `ControlDetailsScreen.tsx`
     - `ComplianceDetailsScreen.tsx`
     - `features.enum.ts`
     - `text.constants.ts`

2. **Voice Chat Components**
   - `useVoiceChat` hook (`src/hooks/useVoiceChat/useVoiceChat.hook.ts`)
     - Manages WebSocket connection
     - Handles audio recording and playback
     - Provides voice chat state management
   
   - `VoiceChat` component (`src/components/VoiceChat/VoiceChat.tsx`)
     - UI for voice chat interface
     - Recording controls
     - Audio playback
     - Transcript display
     - Recommended questions

3. **ProGPT Chat Integration**
   - Added voice chat toggle button in `AskAIChat.tsx`
   - Users can switch between text and voice chat modes
   - Voice chat integrated seamlessly with existing chat functionality

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Hume AI Configuration
HUME_API_KEY=your_hume_api_key_here
HUME_API_URL=https://api.hume.ai
```

### Frontend Environment

Ensure your frontend has access to the API URL:

```bash
# In frontend .env or vite config
VITE_API_URL=http://localhost:3000  # or your backend URL
```

## Installation

### Backend Dependencies

```bash
cd bff-service-backend-dev
npm install form-data @types/form-data
```

### Frontend Dependencies

```bash
cd frontend-app-main
yarn add socket.io-client
```

## How It Works

### Architecture Flow

```
User (Frontend)
  ↓ (WebSocket + Audio Stream)
VoiceChatGateway (NestJS)
  ↓ (Audio Processing)
Hume EVI API
  ↓ (Speech-to-Text)
AskAiService (Compliance Context)
  ↓ (Text Response)
Hume TTS
  ↓ (Audio Response)
VoiceChatGateway
  ↓ (Audio Stream)
User (Frontend Playback)
```

### Voice Chat Features

1. **Real-time Audio Streaming**
   - Audio chunks sent every second during recording
   - Bidirectional WebSocket communication
   - Low-latency response playback

2. **Compliance-Aware Responses**
   - Voice input processed through existing chat server
   - Maintains compliance context (application, standard, control)
   - Same intelligent responses as text chat

3. **Emotion Detection**
   - Hume provides emotion analysis (if configured)
   - Can be used for adaptive responses

4. **Session Management**
   - Each voice session linked to user and application
   - Automatic cleanup on disconnect
   - Secure JWT-based authentication

## Usage

### For Users

1. Open ProGPT chat (formerly Ask AI)
2. Click "Voice Chat" button
3. Click "Start Voice Chat" to begin recording
4. Speak your question
5. Listen to the audio response
6. View transcript and recommended questions

### For Developers

#### Starting a Voice Session

```typescript
import { useVoiceChat } from '@/hooks/useVoiceChat/useVoiceChat.hook';

const { startRecording, stopRecording, isConnected } = useVoiceChat(applicationId);
```

#### Using Voice Chat Component

```typescript
import { VoiceChat } from '@/components/VoiceChat';

<VoiceChat applicationId={123} />
```

## API Endpoints

### WebSocket Connection

```
ws://localhost:3000/ask-ai/voice
```

**Authentication**: JWT token in `auth.token` or `Authorization` header

**Query Parameters**:
- `applicationId` (optional): Application context

**Events**:
- `audio:chunk` - Send audio chunk (base64 encoded)
- `text:message` - Send text message (fallback)
- `voice:start` - Start recording
- `voice:stop` - Stop recording

**Server Events**:
- `connected` - Connection established
- `audio:response` - Audio response received
- `error` - Error occurred

## Security Considerations

1. **JWT Authentication**: All voice sessions require valid JWT tokens
2. **Session Isolation**: Each user gets isolated voice sessions
3. **Context Validation**: Application and customer context validated
4. **Error Handling**: Graceful fallback if Hume API unavailable

## Troubleshooting

### Voice Chat Not Connecting

1. Check `HUME_API_KEY` is set in backend `.env`
2. Verify WebSocket connection in browser console
3. Check JWT token is valid
4. Ensure microphone permissions granted

### Audio Not Playing

1. Check browser audio permissions
2. Verify audio format compatibility
3. Check browser console for errors

### Hume API Errors

- If Hume API is not configured, voice chat will be disabled
- Check Hume API key validity
- Verify network connectivity to `api.hume.ai`

## Next Steps

1. **Get Hume API Key**: Sign up at https://www.hume.ai/ and obtain API credentials
2. **Configure Environment**: Add `HUME_API_KEY` to your `.env` file
3. **Test Integration**: Start the application and test voice chat functionality
4. **Customize Voice**: Adjust voice settings in `hume-voice.service.ts` if needed

## Notes

- Voice chat requires Hume API key to function
- Falls back gracefully if Hume is not configured
- All existing text chat functionality remains unchanged
- Display name changed to "ProGPT" but internal code still uses "ask-ai" for consistency

