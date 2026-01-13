import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { SectorService } from './sector.service';
import { Sector } from 'src/entities/sector.entity';
import { Customer } from 'src/entities/customer.entity';
import { PolicyDetails } from 'src/entities/policyDetails.entity';
import { SqsModule } from '@ssut/nestjs-sqs';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { App } from 'src/entities/app.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { TrustCenter } from 'src/entities/trustCenter.entity';
import { User } from 'src/entities/user.entity';
import { SourceV1 } from 'src/entities/source/sourceV1.entity';
import { SourceAsset } from 'src/entities/source/applicationSourceType.entity';
import { Asset } from 'src/entities/source/assets.entity';
import { SourceVersion } from 'src/entities/source/sourceVersion.entity';
import { SourceChunkMapping } from 'src/entities/compliance/sourceChunkMapping.entity';
import { ControlChunkMapping } from 'src/entities/compliance/controlChunkMapping.entity';
import { SourcePolicyService } from 'src/sources/sourcePolicy.service';
import { LoggerService } from 'src/logger/logger.service';
import { UploadService } from 'src/app/fileUpload.service';
import { AwsS3ConfigService } from 'src/app/aws-s3-config.service';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { ApplicationControlEvidence } from 'src/entities/compliance/applicationControlEvidence.entity';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { PermissionValidatorService } from 'src/auth/permissionValidator.service';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { EmailService } from 'src/notifications/email.service';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { Permission } from 'src/entities/permission.entity';
import { DomainCacheModule } from 'src/cache/domain-cache.module';
import { SESClient } from '@aws-sdk/client-ses';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { Templates } from 'src/entities/template.entity';
import { PasswordHistory } from 'src/entities/auth/passwordHistory.entity';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { GeminiService } from 'src/llms/gemini.service';
import { GradientService } from 'src/llms/gradient.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { HttpModule } from '@nestjs/axios';
@Module({
    imports: [
        TypeOrmModule.forFeature([Sector, PolicyDetails, Customer, AsyncTask, App, AppUser, AppStandard, User, AssessmentDetail, TrustCenter, Asset, SourceAsset, SourceV1, ControlChunkMapping, SourceChunkMapping, SourceAsset, SourceVersion,
            ApplicationControlMapping, ApplicationControlEvidence, SourceType, LicenseType, CustomerCsm, ResetPasswordToken, LicenseRule, Permission, UserRoles, Standard, Templates, PasswordHistory, RefreshToken, Control
        ]),
        DomainCacheModule,
        HttpModule,
        SqsModule.registerAsync({
            useFactory: () => {
                const sqsEnabled = process.env.AWS_SQS_ENABLED !== 'false';
                const endpoint = process.env.AWS_SQS_ENDPOINT || ((process.env.USE_LOCALSTACK || 'false') === 'true'
                    ? process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566'
                    : undefined);
                const region = process.env.AWS_SQS_REGION || process.env.AWS_REGION || 'us-east-1';
                const credentials = endpoint ? {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
                } : undefined;

                const buildProducer = (nameEnv: string, urlEnv: string) => {
                    const name = process.env[nameEnv];
                    const queueUrl = process.env[urlEnv];
                    if (!sqsEnabled || !name || !queueUrl) {
                        return null;
                    }
                    return {
                        name,
                        queueUrl,
                        region,
                        endpoint,
                        credentials,
                    };
                };

                const producers = ([
                    buildProducer('BACKEND_QUEUE_NAME', 'BACKEND_QUEUE'),
                    buildProducer('DS_QUEUE_NAME', 'DS_QUEUE'),
                ].filter(Boolean)) as any[];
                return {
                    producers,
                }
            }
        }),
    ],
    controllers: [PolicyController],
    providers: [
        PolicyService,
        SectorService,
        AsyncTasksService,
        SourcePolicyService,
        UploadService,
        LoggerService,
        AwsS3ConfigService,
        AuthService,
        RoleHierarchyService,
        PermissionValidatorService,
        CognitoService,
        EmailService,
        ResetPasswordTokenService,
        SESClient,
        GeminiService,
        GradientService,
        OpenAiService,
        OllamaService,
        AiHelperService
    ],
    exports: [PolicyService, SectorService],
})
export class PolicyModule { } 
