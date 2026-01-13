import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { SspService } from './ssp.service';
import { SspController } from './ssp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from 'src/entities/comments.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  providers: [SspService, LoggerService ],
  controllers: [SspController],
  imports: [
    TypeOrmModule.forFeature([
      Comments,
      User,
    ]),
    forwardRef(()=>AuthModule)
  ]
})
export class SspModule { }
