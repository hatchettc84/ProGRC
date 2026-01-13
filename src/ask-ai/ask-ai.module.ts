import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AskAiService } from 'src/ask-ai/ask-ai.service';
import { AskAiController } from 'src/ask-ai/ask-ai.controller';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { LoggerService } from 'src/logger/logger.service';
import { RequestContextService } from 'src/request-context/request-context.service';
import { HttpModule } from '@nestjs/axios';
import { Control } from 'src/entities/compliance/control.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { HumeVoiceService } from './services/hume-voice.service';
import { VoiceChatGateway } from './gateways/voice-chat.gateway';
import { OllamaService } from 'src/llms/ollama.service';

@Module({
  controllers: [AskAiController],
  providers: [AskAiService, LoggerService, HumeVoiceService, VoiceChatGateway, OllamaService],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      AssessmentDetail,
      AssessmentOutline,
      AssessmentHistory,
      AssessmentSections,
      AssessmentSectionsHistory,
      Control,
      Standard,
    ]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
  exports: [AskAiService], // Export AskAiService so other modules can use it
})
export class AskAiModule {}