import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationControlRecommendation } from 'src/entities/recommendation/applicationControlRecommendation.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerService } from 'src/logger/logger.service';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { GeminiService } from 'src/llms/gemini.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { GradientService } from 'src/llms/gradient.service';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationControlRecommendation,
            ApplicationControlMapping,
            Control,
            Standard
        ]),
        AuthModule,
        HttpModule,
    ],
    controllers: [RecommendationController],
    providers: [
        RecommendationService,
        LoggerService,
        GeminiService,
        GradientService,
        OpenAiService,
        OllamaService,
        AiHelperService
    ],
    exports: [RecommendationService]
})
export class RecommendationModule { }
