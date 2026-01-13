import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { CloudFrontService } from "src/app/cloudfront.service";
import { UploadService } from "src/app/fileUpload.service";
import { AuthModule } from "src/auth/auth.module";
import { Customer } from "src/entities/customer.entity";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { CsmHelpCenterArticleController } from "./controller/csmHelpCenterArticle.controller";
import { CsmHelpCenterCategoryController } from "./controller/csmHelpCenterCategory.controller";
import { HelpCenterController } from "./controller/helpCenter.controller";
import { CreateArticleService } from "./service/article/createArticle.service";
import { DeleteArticleService } from "./service/article/deleteArticle.service";
import { GetArticleService } from "./service/article/getArticle.service";
import { PublishArticleService } from "./service/article/publishArticle.service";
import { SearchArticleService } from "./service/article/searchArticle.service";
import { UndoChangeArticleService } from "./service/article/undoChangeArticle.service";
import { UpdateArticleService } from "./service/article/updateArticle.service";
import { UploadThumbnailService } from "./service/article/uploadThumbnail.service";
import { AskAiService } from "./service/askAi.service";
import { GetCategoryService } from "./service/category/getCategory.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { OllamaService } from "src/llms/ollama.service";
import { HttpModule } from "@nestjs/axios";
import { User } from "src/entities/user.entity";
import { AppUser } from "src/entities/appUser.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { App } from "src/entities/app.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { Templates } from "src/entities/template.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HelpCenterArticle,
      Customer,
      User,
      AppUser,
      SourceType,
      SourceV1,
      ApplicationControlEvidence,
      App,
      SourceVersion,
      AppStandard,
      AssessmentDetail,
      Templates
    ]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
  controllers: [
    CsmHelpCenterCategoryController,
    CsmHelpCenterArticleController,
    HelpCenterController,
  ],
  providers: [
    GetCategoryService,
    CreateArticleService,
    GetArticleService,
    DeleteArticleService,
    UpdateArticleService,
    PublishArticleService,
    UploadThumbnailService,
    UploadService,
    AwsS3ConfigService,
    CloudFrontService,
    SearchArticleService,
    UndoChangeArticleService,
    AskAiService,
    OllamaService,
    LoggerService,
    RequestContextService,
  ],
  exports: [],
})
export class HelpCenterModule {}
