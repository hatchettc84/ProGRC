import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { App } from 'src/entities/app.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { Customer } from 'src/entities/customer.entity';
import { User } from 'src/entities/user.entity';
import { AsyncTasksController } from './async_tasks.controller';
import { AsyncTasksService } from './async_tasks.service';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { TrustCenter } from 'src/entities/trustCenter.entity';
import { SourcePolicyService } from 'src/sources/sourcePolicy.service';
//import { Source } from 'src/entities/source/source.entity';
import { Asset } from 'src/entities/source/assets.entity';
import { SourceAsset } from 'src/entities/source/applicationSourceType.entity';
import { ControlChunkMapping } from 'src/entities/compliance/controlChunkMapping.entity';
import { SourceChunkMapping } from 'src/entities/compliance/sourceChunkMapping.entity';
import { SourceV1 } from 'src/entities/source/sourceV1.entity';
import { SourceVersion } from 'src/entities/source/sourceVersion.entity';
import { UploadService } from 'src/app/fileUpload.service';
import { AwsS3ConfigService } from 'src/app/aws-s3-config.service';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { RequestContextService } from 'src/request-context/request-context.service';
import { LoggerService } from 'src/logger/logger.service';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { ApplicationControlEvidence } from 'src/entities/compliance/applicationControlEvidence.entity';
import { Templates } from 'src/entities/template.entity';


@Module({
  providers: [AsyncTasksService, SourcePolicyService, UploadService, AwsS3ConfigService, LoggerService ],
  controllers: [AsyncTasksController],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      App,
      AsyncTask,
      AppUser,
      AppStandard,
      User,
      AssessmentDetail,
      TrustCenter,
      Asset,
      SourceAsset,
      ControlChunkMapping,
      SourceChunkMapping,
      SourceV1,
      SourceVersion,
      SourceType,
      ApplicationControlEvidence,
      Templates

    ]),
    forwardRef(() => AuthModule),

  ],
  exports: [AsyncTasksService],
})
export class AsyncTasksModule { }
