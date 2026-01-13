import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { UploadService } from "src/app/fileUpload.service";
import { AuthModule } from "src/auth/auth.module";
import { Customer } from "src/entities/customer.entity";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { CustomerTemplateController } from "./customerTemplate.controller";
import { TemplateService } from "./service/template.service";
import { UploadCustomerTemplateLogoService } from "./service/uploadLogo.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { User } from "src/entities/user.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { AppUser } from "src/entities/appUser.entity";
import { App } from "src/entities/app.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { Templates } from "src/entities/template.entity";
import { TemplateVariable } from "src/entities/templateVariable.entity";
import { TemplateVariableGroup } from "src/entities/templateVariableGroup.entity";
import { TemplateController } from "./template.controller";
import { Standard } from "src/entities/standard_v1.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { FileDownloadService } from "src/app/fileDownload.service";
import { TemplatePolicyService } from "./service/templatePolicy.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationTemplate,
      Customer,
      User,
      AppUser,
      SourceType,
      SourceV1,
      ApplicationControlEvidence,
      App,
      TemplateSection,
      Templates,
      TemplateVariable,
      TemplateVariableGroup,
      Standard,
      LicenseType,
      SourceVersion,
      AppStandard,
      AssessmentDetail
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [
    UploadCustomerTemplateLogoService,
    UploadService,
    AwsS3ConfigService,
    TemplateService,
    LoggerService,
    RequestContextService,
    FileDownloadService,
    TemplatePolicyService
  ],
  controllers: [CustomerTemplateController, TemplateController],
})
export class TemplateModule {}
