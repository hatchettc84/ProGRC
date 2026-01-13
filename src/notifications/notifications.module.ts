import { SESClient } from '@aws-sdk/client-ses';
import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { AuthModule } from 'src/auth/auth.module';
import { App } from 'src/entities/app.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { Customer } from 'src/entities/customer.entity';
//import { Source } from 'src/entities/source/source.entity';
import { User } from 'src/entities/user.entity';
import { EmailService } from './email.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AsyncTasksModule } from 'src/async_tasks/async_tasks.module';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { LoggerService } from 'src/logger/logger.service';
import { RequestContextService } from 'src/request-context/request-context.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, LoggerService, 
    {
      provide: SESClient,
      useFactory: (configService: ConfigService) => {
        return new SESClient({
          region: configService.get('AWS_SES_REGION', 'us-east-1'),
          endpoint: configService.get('SES_ENDPOINT', 'http://localhost:4566'),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID', 'test'),  // Dummy values for LocalStack
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY', 'test'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  imports: [
    AsyncTasksModule,
    TypeOrmModule.forFeature([
      Customer,
      App,
      AsyncTask,
      User,
      AppUser,
      AppStandard
    ]),
    forwardRef(() => AuthModule),
  ],
  exports: [EmailService],
})
export class NotificationsModule { }
