import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository, } from '@nestjs/typeorm';
import { TaskOps, TaskStatus } from 'src/assessment/createAssessment.service';
import { App } from 'src/entities/app.entity';
import { AppStandard } from 'src/entities/appStandard.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { Customer } from 'src/entities/customer.entity';
import { SourceAsset } from 'src/entities/source/applicationSourceType.entity';
import { Asset } from 'src/entities/source/assets.entity';
import { TrustCenter, TrustCenterStatus } from 'src/entities/trustCenter.entity';
import { User } from 'src/entities/user.entity';
import { UserRole, UserRoles } from 'src/masterData/userRoles.entity';
import { SourcePolicyService } from 'src/sources/sourcePolicy.service';
import { SourcesService } from 'src/sources/sources.service';
import { DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';
import { TypeTask } from './async_tasks.dto';
import { SourceV1 } from 'src/entities/source/sourceV1.entity';
import { ControlChunkMapping } from 'src/entities/compliance/controlChunkMapping.entity';
import { SourceChunkMapping } from 'src/entities/compliance/sourceChunkMapping.entity';
import { SourceVersion } from 'src/entities/source/sourceVersion.entity';
import { UploadService } from 'src/app/fileUpload.service';
import { LoggerService } from 'src/logger/logger.service';
// Default to 24 hours (86400 seconds) if not set or invalid
const timeLimitSeconds: number = (() => {
  const envValue = +process.env.NOTIFICATION_VISIBILITY_TIME_IN_SECONDS;
  return isNaN(envValue) || envValue <= 0 ? 86400 : envValue;
})();

@Injectable()
export class AsyncTasksService {

    constructor(
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(App) private appsRepo: Repository<App>,
        @InjectRepository(AsyncTask) private asyncTaskRepo: Repository<AsyncTask>,
        @InjectRepository(AppUser) private appUserRepo: Repository<AppUser>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(AssessmentDetail) private assessmentRepo: Repository<AssessmentDetail>,
        @InjectRepository(TrustCenter) private trustCenterRepo: Repository<TrustCenter>,

        private readonly sourcePolicyService: SourcePolicyService,
        @InjectRepository(Asset)
        private readonly assetRepo: Repository<Asset>,

        private readonly dataSource: DataSource,
        @InjectRepository(SourceAsset)
        private readonly sourceAsseteRepository: Repository<SourceAsset>,
         @InjectRepository(SourceV1)
         private readonly sourceRepov1: Repository<SourceV1>,
        @InjectRepository(ControlChunkMapping)
        private readonly controlChunkMappingRepo: Repository<ControlChunkMapping>,
        @InjectRepository(SourceChunkMapping)
        private readonly sourceChunkMappingRepo: Repository<SourceChunkMapping>,
        @InjectRepository(SourceVersion)
        private readonly sourceVersionRepo: Repository<SourceVersion>,
                private readonly uploadSvc: UploadService,
                private readonly logger: LoggerService
        


    ) { }

    async createTask(data: any, userInfo: any) {

        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];
        let count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        let { entity_type, request_payload, app_id } = data;
        if (!entity_type) {
            throw new ForbiddenException({
                error: 'Please provide valid entity type.',
                message: 'Please provide valid entity type.',
            });
        }

        if (!request_payload) {
            throw new ForbiddenException({
                error: 'Please provide valid request_payload.',
                message: 'Please provide valid request_payload',
            });
        }

        // Check the structure of 'sources' (ensure it's an array with at least one entry)
        if (!Array.isArray(request_payload.sources) || request_payload.sources.length === 0) {
            throw new BadRequestException({
                error: 'Invalid sources structure.',
                message: 'Please provide valid sources in request_payload.',
            });
        }

        // Check required fields inside the 'sources' array
        const sourceFields = ['name', 'type', 's3FileUrl', 'version'];
        for (const source of request_payload.sources) {
            for (const field of sourceFields) {
                if (!source[field]) {
                    throw new BadRequestException({
                        error: `Missing field in sources: ${field}`,
                        message: `Please provide valid ${field} in sources.`,
                    });
                }
            }
        }

        // Validate fields inside 'template'
        const templateFields = ['id', 'standard', 'templateS3Url', 'metadataS3Url'];
        const { template } = request_payload;

        if (!template) {
            throw new BadRequestException({
                error: 'Invalid template structure.',
                message: 'Please provide valid template in request_payload.',
            });
        }

        for (const field of templateFields) {
            if (!template[field]) {
                throw new BadRequestException({
                    error: `Missing field in template: ${field}`,
                    message: `Please provide valid ${field} in template.`,
                });
            }
        }

        count = await this.appsRepo.count({
            where: {
                id: app_id,
                customer_id: orgId,
            }
        });

        if (!count) {
            throw new BadRequestException({
                error: `Invalid app_id provided!`,
                message: `Invalid app_id provided!`,
            });
        }

        // Prepare async task data
        const task = this.asyncTaskRepo.create({
            ops: TaskOps.CREATE_ASSESSMENTS,
            status: TaskStatus.PENDING, // Set status to 'PENDING'
            request_payload,
            app_id: app_id,
            customer_id: orgId,
            created_by: userId,
        });

        // Save async task entry in the database
        await this.asyncTaskRepo.save(task);

        return {
            message: 'Async task created successfully.',
            task_id: task.id,
        };

    }


    // @Cron(CronExpression.EVERY_MINUTE)
    // async callAsync() {
    //     const pendingTasks = await this.asyncTaskRepo.find({
    //         where: { status: TaskStatus.PENDING },
    //     });

    //     const initiatedTask = await this.asyncTaskRepo.count({
    //         where: { status: TaskStatus.REQUEST_INITIATED },
    //     });

    //     if (pendingTasks.length === 0) {
    //         this.logger.info('No pending tasks found');
    //         return;
    //     }

    //     if (initiatedTask) {
    //         this.logger.info('There is task already running in pipeline');
    //         return;
    //     }
    //     // Step 2: Iterate through each pending task
    //     for (const task of pendingTasks) {
    //         try {

    //             //run DS pipeline 
    //             this.logger.info(`Task ${task.id} updated to PROCESSING status`);
    //             const response = DSApi(task.request_payload);
    //             // Step 3: Update the task status to request initiated and add request payload
    //             task.status = TaskStatus.REQUEST_INITIATED;
    //             // Save the updated task to the database
    //             await this.asyncTaskRepo.save(task);

    //             //wait response
    //             if (!response) {
    //                 throw new ForbiddenException({
    //                     error: 'getting error from ds-api.',
    //                     message: 'Getting error from ds api',
    //                 });
    //             }

    //             task.status = TaskStatus.RESPONSE_RECEIVED;
    //             await this.asyncTaskRepo.save(task);

    //         } catch (error) {
    //             this.logger.error(`Failed to process task ${task.id}:`, error);
    //         }
    //     }
    // }

    async getAsyncTask(data: any, userInfo: any, limit: number = 5, offset: number = 0, limitedTime = true): Promise<[AsyncTask[], number]> {
        const tenantId = userInfo['tenant_id'];
        const userId = userInfo['userId'];
        let count = await this.customerRepo.count({
            where: { id: tenantId }
        });
        if (!count) {
            throw new BadRequestException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch all appUser entries associated with the user
        //const applicationIds: number[] = await this.findApplicationIds(userId, tenantId);

        // if (!applicationIds || applicationIds.length === 0) {
        //     throw new BadRequestException({
        //         error: 'Please provide the applicationIds in a valid Array.',
        //         message: 'Please provide the applicationIds in a valid Array.',
        //     });
        // }

        // Create query with both conditions
        const query = this.asyncTaskRepo
            .createQueryBuilder('asyncTask')
            .where('asyncTask.customer_id = :tenantId', { tenantId })
            .andWhere('asyncTask.status IS NOT NULL');

        // Add the time filter only if limitedTime is true
        if (limitedTime) {
            const cutoffDate = new Date();
            cutoffDate.setSeconds(cutoffDate.getSeconds() - timeLimitSeconds);
            
            // Validate cutoffDate is a valid date before using it
            if (!isNaN(cutoffDate.getTime())) {
                query.andWhere('asyncTask.updated_at > :cutoffDate', { cutoffDate });
            } else {
                this.logger.warn(`Invalid cutoffDate calculated, skipping time filter. timeLimitSeconds: ${timeLimitSeconds}`);
            }
        }

        query.orderBy('asyncTask.updated_at', 'DESC')
            .limit(limit)
            .offset(offset);

        return query.getManyAndCount();
    }


    async getPendingTasks(tenantId: string, appId: number, ops: TypeTask): Promise<[boolean, number[]]> {
        await this.validateApp(tenantId, appId);

        const taskOps: TaskOps | TaskOps[] = this.getOperationSearch(ops);

        const cutoffDate = new Date();
        cutoffDate.setSeconds(cutoffDate.getSeconds() - timeLimitSeconds);
        const asyncTask: AsyncTask = await this.asyncTaskRepo.findOne({
            where: {
                customer_id: tenantId,
                app_id: appId,
                ops: Array.isArray(taskOps) ? In(taskOps) : taskOps,
                updated_at: MoreThan(cutoffDate)
            },
            order: {
                created_at: 'DESC',
            }
        });

        if (!asyncTask) {
            return [false, []];
        }

        const havePendingitems: boolean = AsyncTask.pendingTaskStatus().includes(asyncTask.status);

        let pendingIds: number[] = [];
        if (havePendingitems) {
            // Include the task ID in the pending IDs array
            pendingIds = [asyncTask.id];
            
            // For UPDATE_COMPLIANCE, we might want to get additional compliance IDs
            // but for now, we'll include the task ID
            if (asyncTask.ops === TaskOps.UPDATE_COMPLIANCE) {
                // Could add additional logic here if needed
                // await this.getPendingComplianceId(appId);
            }
        }

        return [havePendingitems, pendingIds];
    }

    private async validateApp(tenantId: string, appId: number): Promise<void> {
        const appExists = await this.appsRepo.exists({
            where: {
                id: appId,
                customer_id: tenantId,
            }
        });

        if (!appExists) {
            throw new BadRequestException({
                error: 'Invalid app_id provided!',
                message: 'Invalid app_id provided!'
            });
        }
    }

    private getOperationSearch(ops: TypeTask): TaskOps | TaskOps[] {
        switch (ops) {
            case TypeTask.CREATE_ASSETS:
                return TaskOps.CREATE_ASSETS;
            case TypeTask.CREATE_UPDATE_ASSESSMENT:
                return [TaskOps.CREATE_ASSESSMENTS, TaskOps.UPDATE_ASSESSMENTS];
            case TypeTask.UPDATE_COMPLIANCE:
                return TaskOps.UPDATE_COMPLIANCE;
            default:
                return TaskOps.CREATE_ASSETS;
        }
    }

    // private async getPendingComplianceId(appId: number): Promise<number[]> {
    //     const appStandards: AppStandard[] = await this.appStandardRepo.find({
    //         select: {
    //             compliance: {
    //                 id: true
    //             }
    //         },
    //         where: {
    //             app_id: appId,
    //         },
    //     })

    //     return appStandards.map(appStandard => appStandard.standard_id);
    // }

    async findApplicationIds(userId: string, customerId: string): Promise<number[]> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['role_id']
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        let applicationIds: number[] = UserRoles.getInternalRoles().concat(UserRole.OrgAdmin).includes(user.role_id)
            ? await this.findAllAppIdsForTenant(customerId)
            : await this.findAppIdsForUser(userId);

        if (!applicationIds?.length) {
            throw new BadRequestException({
                error: 'No valid application IDs found',
                message: 'Please provide the applicationIds in a valid Array.'
            });
        }

        return applicationIds;
    }

    private async findAllAppIdsForTenant(customerId: string): Promise<number[]> {
        const apps = await this.appsRepo.find({
            where: { customer_id: customerId }
        });
        return apps.map(app => app.id);
    }

    private async findAppIdsForUser(userId: string): Promise<number[]> {
        const appUsers = await this.appUserRepo.find({
            where: { user_id: userId }
        });
        return appUsers.map(appUser => appUser.app_id);
    }

    async cancelTask(id: number, user_data: any) {
        const tenantId = user_data['tenant_id'];
        const userId = user_data['userId'];

        // Fetch the task
        const task = await this.asyncTaskRepo.findOne({
            where: {
                id,
                customer_id: tenantId,
                created_by: userId,
            },
        });

        // Validate task existence
        if (!task) {
            throw new BadRequestException({
                error: 'Task not found.',
                message: 'The task with the given ID does not exist or access is denied.',
            });
        }

        // Check task status
        if (task.status === TaskStatus.PROCESSED || task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED) {
            throw new BadRequestException({
                error: 'Task already processed.',
                message: 'Task already processed.',
            });
        }

        // Cancel the task
        task.status = TaskStatus.CANCELLED;
        await this.asyncTaskRepo.save(task);

        // Handle CREATE_ASSESSMENTS
        if (task.ops === TaskOps.CREATE_ASSESSMENTS) {
            const assessment_id = task.request_payload?.assessment_id;
            this.logger.info('assessment_id', assessment_id, 'appId', task.app_id, 'for taskId', id);
            if (assessment_id) {
                await this.assessmentRepo.update(
                    { id: assessment_id, app_id: task.app_id, customer_id: tenantId },
                    { is_deleted: true, is_locked: false },
                );
            }
        }

        // Handle CREATE_ASSETS
        // NOTE: Source is NOT deleted when task is canceled - user wants to keep the source
        // even if the processing job is canceled. The source remains available for retry or manual processing.
        if (task.ops === TaskOps.CREATE_ASSETS) {
            const source_id = task.request_payload?.sourceId;
            if (source_id) {
                this.logger.info('Task canceled but source preserved', {
                    source_id,
                    appId: task.app_id,
                    taskId: id
                });
                // Source deletion removed - source will remain in database even if job is canceled
                // await this.deleteSourceV1(user_data, task.app_id, source_id);
            }
        }

        // Handle UPDATE_COMPLIANCE
        if (task.ops === TaskOps.UPDATE_COMPLIANCE) {
            const appStandard = await this.appStandardRepo.findOne({
                where: { app_id: task.app_id },
            });
            if (appStandard) {
                appStandard.have_pending_compliance = true;
                appStandard.updated_at = new Date();
                await this.appStandardRepo.save(appStandard);
            }
        }

        // Handle EXPORT_TRUST_CENTER
        if (task.ops === TaskOps.EXPORT_TRUST_CENTER) {
            const trustCenterId = task.request_payload?.trustCenterId;
            if (trustCenterId) {
                await this.trustCenterRepo.update(
                    { id: trustCenterId, app_id: task.app_id, customer_id: tenantId },
                    { deleted: true, status: TrustCenterStatus.CANCELLED },
                );
            }
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async deletePendingTasks() {
        const timeLimit = +process.env.PENDING_TASKS_TIME_LIMIT;
        const twoHoursAgo = new Date(Date.now() - timeLimit * 60 * 60 * 1000);


        this.logger.info('Deleting pending tasks older than 2 hours');
        await this.asyncTaskRepo.update(
            {
                status: In([TaskStatus.PENDING, TaskStatus.IN_PROCESS]),
                created_at: LessThan(twoHoursAgo),
            },
            { status: TaskStatus.FAILED },
        );
    }

     async deleteSourceV1(userInfo: any, appId: number, sourceId: number): Promise<any> {
            const orgId = userInfo['customerId'];
            const count = await this.customerRepo.count({ where: { id: orgId } });
        
            if (!count) {
                throw new ForbiddenException({
                    error: 'You are not linked to any organization.',
                    message: 'You are not linked to any organization.',
                });
            }
        
            // await this.sourcePolicyService.canDeleteSource(userInfo, appId);
        
            let sourceDetails;
            try {
                sourceDetails = await this.sourceRepov1.findOneOrFail({
                    where: { id: sourceId, is_deleted: false },
                });
            } catch (error) {
                throw new ForbiddenException({
                    error: `Active source with id ${sourceId} not found`,
                    message: `Active source with id ${sourceId} not found`,
                });
            }
        
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
        
            try {
                const deletedChunks = await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(SourceChunkMapping)
                    .where("source_id = :sourceId", { sourceId })
                    .execute();
        
                const deletedChunksCount = deletedChunks.affected || 0;
        
                const deletedAssets = await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(Asset)
                    .where("source_id = :sourceId", { sourceId })
                    .execute();
        
                const deletedAssetsCount = deletedAssets.affected || 0;
    
                const srcVersion = await this.sourceVersionRepo.findOne({
                    where: { source_id: sourceId },
                    order: { created_at: 'DESC' },
                });
    
               const fileKey = srcVersion.file_bucket_key;
               this.deleteFileFromS3(fileKey);
                this.logger.info('deLeted service version', srcVersion.file_bucket_key);        
                const deletedSrcVersion = await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(SourceVersion)
                    .where("source_id = :sourceId", { sourceId })
                    .execute();
        
                const deletedSrcCount = deletedAssets.affected || 0;
        
                const deletedSource = await queryRunner.manager
                    .createQueryBuilder()
                    .delete()
                    .from(SourceV1)
                    .where("id = :sourceId", { sourceId })
                    .execute();
        
                const whereClause: any = {
                    customer_id: orgId,
                    source_type: sourceDetails.source_type,
                };
        
                if (appId) {
                    whereClause.app_id = appId;
                }
        
                const updateResult = await queryRunner.manager.getRepository(SourceAsset)
                    .createQueryBuilder()
                    .update(SourceAsset)
                    .set({
                        source_count: () => `CASE WHEN source_count > 0 THEN source_count - 1 ELSE 0 END`,
                        assets_count: () => `GREATEST(assets_count - ${deletedAssetsCount}, 0)`,
                        updated_at: new Date(),
                    })
                    .where(whereClause)
                    .returning('*')
                    .execute();


          const appStandard = await this.appStandardRepo.findOne({ where: { app_id: appId } });

          if (appStandard) {
              await queryRunner.manager.getRepository(AppStandard)
                  .createQueryBuilder()
                  .update(AppStandard)
                  .set({ have_pending_compliance: true, updated_at: new Date(), source_updated_at: new Date() })
                  .where({ app_id: appId })
                  .execute();
          }
        
                await queryRunner.commitTransaction();
        
                return { deletedSource, updateResult };
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
        }


    deleteFileFromS3(fileKey: string): Promise<any> {
        return this.uploadSvc.deleteFileSingedUrl(fileKey);
    }
    
    /**
     * Fix stuck pending tasks - marks old PENDING/IN_PROCESS tasks as FAILED
     * This is useful for cleaning up tasks that got stuck and are blocking new operations
     */
    async fixStuckPendingTasks(appId?: number, maxAgeHours: number = 1): Promise<{ fixed: number, tasks: any[] }> {
        const maxAge = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        
        const whereClause: any = {
            status: In([TaskStatus.PENDING, TaskStatus.IN_PROCESS]),
            created_at: LessThan(maxAge)
        };
        
        if (appId) {
            whereClause.app_id = appId;
        }
        
        const stuckTasks = await this.asyncTaskRepo.find({
            where: whereClause,
            order: { created_at: 'DESC' }
        });
        
        if (stuckTasks.length === 0) {
            return { fixed: 0, tasks: [] };
        }
        
        // Update stuck tasks to FAILED
        await this.asyncTaskRepo.update(
            whereClause,
            {
                status: TaskStatus.FAILED,
                updated_at: new Date()
            }
        );
        
        this.logger.log(`Fixed ${stuckTasks.length} stuck pending tasks`, {
            appId,
            maxAgeHours,
            taskIds: stuckTasks.map(t => t.id)
        });
        
        return {
            fixed: stuckTasks.length,
            tasks: stuckTasks.map(t => ({
                id: t.id,
                app_id: t.app_id,
                ops: t.ops,
                status: t.status,
                created_at: t.created_at
            }))
        };
    }
        
}
