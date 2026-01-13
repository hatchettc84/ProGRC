import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { App } from 'src/entities/app.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { Customer } from 'src/entities/customer.entity';
import { Asset } from 'src/entities/source/assets.entity';
//import { Source } from 'src/entities/source/source.entity';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { User } from 'src/entities/user.entity';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetsWebhookController } from './assetsWebhook.controller';
import { AssetsWebhookService } from './assetsWebhook.service';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { LoggerService } from 'src/logger/logger.service';
import { RequestContextService } from 'src/request-context/request-context.service';

@Module({
  controllers: [AssetsController, AssetsWebhookController],
  providers: [AssetsService, AssetsWebhookService, LoggerService, ],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      App,
      AsyncTask,
      Asset,
      AppUser,
      SourceType,
      User
    ]),
    forwardRef(() => AuthModule)
  ]
})
export class AssetsModule { }
