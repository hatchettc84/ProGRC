import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationControlRecommendation } from 'src/entities/recommendation/applicationControlRecommendation.entity';
import { LoggerService } from 'src/logger/logger.service';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { RecommendationService } from 'src/recommendation/recommendation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApplicationControlRecommendation, ApplicationControlMapping]),
    ],
    controllers: [RecommendationController],
    providers: [RecommendationService, LoggerService,],
    exports: [RecommendationService]
})
export class RecommendationModule { }
