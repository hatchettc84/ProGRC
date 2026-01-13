import { Module } from "@nestjs/common";
import { AssessmentsWebhookService } from "src/assessment/service/assessmentsWebhook.service";
import { AssessmentWebhookController } from "src/assessment/assessmentWebhook.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { User } from "src/entities/user.entity";
import { App } from "src/entities/app.entity";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { Templates } from "src/entities/template.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { AssessmentSectionsHistory } from "src/entities/assessments/assessmentSectionsHistory.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { AppUser } from "src/entities/appUser.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { Framework } from "src/entities/framework.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { LoggerService } from "src/logger/logger.service";
import { ConfigModule } from "@nestjs/config";
import { typeOrmConfig } from "src/config/typeorm.config";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "src/health/health.controller";
import { RecommendationController } from "./recommendation/recommendation.controller";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { RecommendationService } from "src/recommendation/recommendation.service";
import { RecommendationModule } from "./recommendation/recommendation.module";
import { AuthModule } from "src/auth/auth.module";
import { AuthController } from "./auth.controller";
import { JwtAuthService } from "src/auth/services/jwt-auth.service";
import { ResetPasswordToken } from "src/entities/resetPasswordToken.entity";
import { PasswordHistory } from "src/entities/auth/passwordHistory.entity";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "src/notifications/email.service";
import { ResetInternalUserPassword } from "src/user/services/resetPassword.service";
import { SESClient } from "@aws-sdk/client-ses";
import { ResetPasswordTokenService } from "src/user/services/resetPasswordToken.service";
import { RefreshToken } from "src/entities/auth/refreshToken.entity";
import { AdminController } from "./admin.controller";
import { UserManagementController } from "./user-management.controller";
import { FeatureFlagManagementController } from "./feature-flag-management.controller";
import { AuthService } from "src/auth/auth.service";
import { CreateProGrcUserService } from "src/user/services/createUser.service";
import { DeleteUserService } from "src/user/services/deleteUser.service";
import { FeatureFlagService } from "src/feature-flag/feature-flag.service";
import { FeatureFlag } from "src/entities/featureFlag.entity";
import { UserRoles } from "src/masterData/userRoles.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { EmailValidationService } from "src/auth/emailValidation.service";
import { UploadService } from "src/app/fileUpload.service";
import { DomainCacheService } from "src/cache/domain-cache.service";
import { DeleteApplicationService } from "src/application/deleteApplication.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { CloudFrontService } from "src/app/cloudfront.service";
import { Asset } from "src/entities/source/assets.entity";
import { Poam } from "src/entities/poam.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { Permission } from "src/entities/permission.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";

@Module({
  providers: [
    AssessmentsWebhookService, 
    LoggerService, 
    RecommendationService, 
    JwtAuthService, 
    JwtService, 
    EmailService, 
    ResetInternalUserPassword, 
    SESClient, 
    ResetPasswordTokenService,
    AuthService,
    CreateProGrcUserService,
    DeleteUserService,
    FeatureFlagService,
    CognitoService,
    EmailValidationService,
    UploadService,
    DomainCacheService,
    DeleteApplicationService,
    RequestContextService,
    AwsS3ConfigService,
    CloudFrontService,
    ApplicationPolicyService,
  ],
  controllers: [
    AssessmentWebhookController,
    HealthController,
    RecommendationController,
    AuthController,
    AdminController,
    UserManagementController,
    FeatureFlagManagementController
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TerminusModule,
    RecommendationModule,
    AuthModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      Customer,
      User,
      App,
      OrganizationTemplate,
      OrganizationStandards,
      Templates,
      AppStandard,
      AssessmentDetail,
      AssessmentOutline,
      AssessmentHistory,
      AssessmentSections,
      AssessmentSectionsHistory,
      AsyncTask,
      TemplateSection,
      TrustCenter,
      AppUser,
      Standard,
      Framework,
      StandardControlMapping,
      ApplicationControlMapping,
      Control,
      SourceChunkMapping,
      ControlChunkMapping,
      ApplicationControlRecommendation,
      ResetPasswordToken,
      PasswordHistory,
      RefreshToken,
      FeatureFlag,
      UserRoles,
      CustomerCsm,
      LicenseType,
      LicenseRule,
      SourceType,
      ApplicationControlEvidence,
      SourceV1,
      SourceVersion, 
      Permission,
      Asset,
      Poam,
    ]),
  ],
})
export class PrivateModule {}
