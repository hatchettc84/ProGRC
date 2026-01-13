import { forwardRef, Module } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { UserCommentController } from './user-comment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AppModule } from 'src/app/app.module';
import { User } from 'src/entities/user.entity';
import { App } from 'src/entities/app.entity';
import { Customer } from 'src/entities/customer.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserComment } from 'src/entities/userComment.entity';
import { Permission } from 'src/entities/permission.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Control } from 'src/entities/compliance/control.entity';
import { GeminiService } from 'src/llms/gemini.service';
import { GradientService } from 'src/llms/gradient.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
            TypeOrmModule.forFeature([
                User,
                App,
                Customer,
                UserRoles,
                LicenseRule,
                Permission,
                UserComment,
                AppStandard,
                Standard,
                ApplicationControlMapping,
                Control
            ]),
            forwardRef(() => AuthModule),
            forwardRef(() => AppModule),
            HttpModule
        ],
        controllers: [UserCommentController],
        providers: [
            UserCommentService,
            LoggerService,
            GeminiService,
            GradientService,
            OpenAiService,
            OllamaService,
            AiHelperService
        ],
        exports: [
            UserCommentService
        ],
})
export class UserCommentModule {}
