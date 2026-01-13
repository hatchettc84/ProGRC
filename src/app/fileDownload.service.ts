import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { AwsS3ConfigService } from "./aws-s3-config.service";
import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { User } from "src/entities/user.entity";
import { AppUser } from "src/entities/appUser.entity";
import { LoggerService } from "src/logger/logger.service";
import e from "express";

@Injectable()
export class FileDownloadService {
    constructor(
        private awsS3ConfigService: AwsS3ConfigService,
        private readonly logger: LoggerService
     ) { }

    
    async generateSignedUrl(file_key: string, expirationTimeInMinute: number = 5): Promise<string> {
        try {
            if(!file_key) {
                throw new BadRequestException("File key is required");
            }

            return this.awsS3ConfigService.generateDownloadSignedUrl(file_key, expirationTimeInMinute);

        } catch (error) {
            this.logger.error("Error occured while generating signed Url", error);
            throw error;
        }
        
    }
}