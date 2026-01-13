import { Module, Global } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [SecretsService],
  exports: [SecretsService],
})
export class SecretsModule {} 