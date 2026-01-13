import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationControlEvidence } from 'src/entities/compliance/applicationControlEvidence.entity';
import { Customer } from 'src/entities/customer.entity';
import { SourceV1 } from 'src/entities/source/sourceV1.entity';
import { User } from 'src/entities/user.entity';
import { In, LessThan, Not, Repository } from 'typeorm';
import { AwsS3ConfigService } from './aws-s3-config.service';
import { LoggerService } from 'src/logger/logger.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Templates } from 'src/entities/template.entity';

@Injectable()
export class S3GarbageCollectorService {
    constructor(
        @InjectRepository(SourceV1) private readonly sourceRepository: Repository<SourceV1>,
        @InjectRepository(ApplicationControlEvidence) private readonly applicationControlEvidenceRepository: Repository<ApplicationControlEvidence>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
        private readonly s3Service: AwsS3ConfigService,
        private readonly logger: LoggerService
    ) {}

    @Cron('0 * * * *')
    async handleCron() {
        const oneHourAgo = new Date(Date.now() - 3600 * 1000);
        const s3Client: S3Client = this.s3Service.getS3();
        await this.deleteUnavailableSources(oneHourAgo, s3Client);

        await this.deleteUnavailableEvidences(oneHourAgo, s3Client);

        await this.cleanupTempProfileImages(oneHourAgo, s3Client);

        await this.cleanupTempCustomerLogo(oneHourAgo, s3Client);

        await this.deleteUnavailableTemplates(oneHourAgo, s3Client);

    }
    
    private async cleanupTempCustomerLogo(oneHourAgo: Date, s3Client: S3Client) {
        await this.sourceRepository.manager.transaction(async (transactionalEntityManager) => {
            const customers = await transactionalEntityManager.find(Customer, {
                where: {
                    logo_updated_at: LessThan(oneHourAgo),
                    temp_logo_image_key: Not(null),
                },
            });
    
            const customerS3Keys = customers.map(customer => customer.temp_logo_image_key);
            
            try {
                if(customerS3Keys.length > 0) {
                    const deleteCustomerS3Objects = this.s3Service.deleteMultipleObjectsCommand(customerS3Keys);
                    await s3Client.send(deleteCustomerS3Objects);
                }
    
                // update the customers with temp_logo_image_key to null
                for (const customer of customers) {
                    customer.temp_logo_image_key = null;
                    await transactionalEntityManager.save(customer);
                }
            } catch (error) {
                this.logger.error(`Failed to delete customer logos from S3, ${error}`);
            }
        });
    }
    
    private async cleanupTempProfileImages(oneHourAgo: Date, s3Client: S3Client) {
        await this.sourceRepository.manager.transaction(async (transactionalEntityManager) => {
            const users = await transactionalEntityManager.find(User, {
                where: {
                    image_updated_at: LessThan(oneHourAgo),
                    temp_profile_image_key: Not(null),
                },
            });
    
            const userS3Keys = users.map(user => user.temp_profile_image_key);
            
            try {

                if(userS3Keys.length > 0) {
                    const deleteUserS3Objects = this.s3Service.deleteMultipleObjectsCommand(userS3Keys);
                    await s3Client.send(deleteUserS3Objects);
                }
    
                // update the users with temp_profile_image_key to null
                for (const user of users) {
                    user.temp_profile_image_key = null;
                    await transactionalEntityManager.save(user);
                }
            } catch (error) {
                this.logger.error(`Failed to delete user profile images from S3, ${error}`);
            }
        });
    }
    
    private async deleteUnavailableEvidences(oneHourAgo: Date, s3Client: S3Client) {
        await this.sourceRepository.manager.transaction(async (transactionalEntityManager) => {
            const evidencesToDelete = await transactionalEntityManager.find(ApplicationControlEvidence, {
                where: {
                    created_at: LessThan(oneHourAgo),
                },
            });
    
            const evidenceS3Keys = evidencesToDelete.map(evidence => evidence.document);

            const usedKeys = await transactionalEntityManager.find(ApplicationControlEvidence, {
                where: {
                  document: In(evidenceS3Keys),
                  is_available: true
                }
              });
              
            const usedKeysSet = new Set(usedKeys.map((item) => item.document));
              
            const finalKeysToDelete = evidenceS3Keys.filter((key) => !usedKeysSet.has(key));              
            try {
                if(finalKeysToDelete.length === 0) {

                    const deleteEvidenceS3Objects = this.s3Service.deleteMultipleObjectsCommand(finalKeysToDelete);
        
                    await s3Client.send(deleteEvidenceS3Objects);
                }
    
                if (evidencesToDelete.length > 0) {
                    await transactionalEntityManager.remove(ApplicationControlEvidence, evidencesToDelete);
                }
            } catch (error) {
                this.logger.error(`Failed to delete application control evidences from S3, ${error}`);
            }
        });
    }
    
    private async deleteUnavailableSources(oneHourAgo: Date, s3Client: S3Client) {
        await this.sourceRepository.manager.transaction(async (transactionalEntityManager) => {
            const sourcesToDelete = await transactionalEntityManager.find(SourceV1, {
                where: {
                    is_available: false,
                    created_at: LessThan(oneHourAgo),
                },
            });
    
            const sourceS3Keys = sourcesToDelete.map(source => source.file_bucket_key);
            
            try {
                if(sourceS3Keys.length > 0) {
                    const deleteSourceS3Objects = this.s3Service.deleteMultipleObjectsCommand(sourceS3Keys);
                    await s3Client.send(deleteSourceS3Objects);
                }
    
                if (sourcesToDelete.length > 0) {
                    await transactionalEntityManager.remove(SourceV1, sourcesToDelete);
                }
            } catch (error) {
                this.logger.error(`Failed to delete sources from S3, ${error}`);
            }
        });
    }

    private async deleteUnavailableTemplates(oneHourAgo: Date, s3Client: S3Client) {
        await this.sourceRepository.manager.transaction(async (transactionalEntityManager) => {
            const templatesToDelete = await transactionalEntityManager.find(Templates, {
                where: {
                    is_available: false,
                    uploadDate: LessThan(oneHourAgo),
                }
            });

            const templateS3Keys = templatesToDelete.map(template => template.location);
            const templateTempS3Keys = templatesToDelete.map(template => template.temp_location);

            try {
                if(templateS3Keys.length > 0) {
                    const deleteTemplateS3Objects = this.s3Service.deleteMultipleObjectsCommand(templateS3Keys);
                    await s3Client.send(deleteTemplateS3Objects);
                }

                if(templateTempS3Keys.length > 0) {
                    const deleteTemplateTempS3Objects = this.s3Service.deleteMultipleObjectsCommand(templateTempS3Keys);
                    await s3Client.send(deleteTemplateTempS3Objects);
                }

                if(templatesToDelete.length > 0) {
                    await transactionalEntityManager.remove(Templates, templatesToDelete);
                }
            } catch (error) {
                this.logger.error(`Failed to delete templates from S3, ${error}`);
            }
        });
    }
}

