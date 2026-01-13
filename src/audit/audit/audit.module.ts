import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditFeedback } from 'src/entities/auditFeedback.entity';
import { AuditController } from './audit.controller';
import { AuthService } from 'src/auth/auth.service';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { User } from 'src/entities/user.entity';
import { Customer } from 'src/entities/customer.entity';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { EmailService } from 'src/notifications/email.service';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { LoggerService } from 'src/logger/logger.service';
import { SESClient } from '@aws-sdk/client-ses';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { PermissionValidatorService } from 'src/auth/permissionValidator.service';
import { DomainCacheModule } from 'src/cache/domain-cache.module';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { Permission } from 'src/entities/permission.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { PasswordHistory } from 'src/entities/auth/passwordHistory.entity';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { GeminiService } from 'src/llms/gemini.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { GradientService } from 'src/llms/gradient.service';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AuditFeedback,
            User,
            Customer,
            LicenseType,
            ResetPasswordToken,
            CustomerCsm,
            LicenseRule,
            Permission,
            UserRoles,
            PasswordHistory,
            RefreshToken,
            Control,
            ApplicationControlMapping
        ]),
        DomainCacheModule,
        HttpModule
    ],
    controllers: [AuditController],
    providers: [
        AuditService,
        AuthService,
        CognitoService,
        EmailService,
        ResetPasswordTokenService,
        LoggerService,
        SESClient,
        RoleHierarchyService,
        PermissionValidatorService,
        GeminiService,
        GradientService,
        OpenAiService,
        OllamaService,
        AiHelperService
    ],
    exports: []
})
export class AuditModule {}

