import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import axios from 'axios';
import { writeFileSync } from 'fs';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AWSJWKSSyncCron {
  private readonly userPoolId: string;
  private readonly region: string;

  constructor(configService: ConfigService, private logger: LoggerService) {
   
    this.userPoolId = configService.get<string>('COGNITO_USER_POOL_ID') ?? '';
    this.region = configService.get<string>('COGNITO_REGION') ?? '';
  }

  async fetchJWKS() {
    this.logger.info('Syncing AWS JWKS');
    axios
      .get(`https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`)
      .then((response) => {
        writeFileSync('static/aws-jwks.json', JSON.stringify(response.data));
      })
      .catch((err) => {
        this.logger.info(err);
      });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async repeatJob() {
    await this.fetchJWKS();
  }

  @Timeout(0)
  async initialJon() {
    this.logger.info(`Initial Cron Run .....`);
    await this.fetchJWKS();
  }
}
 