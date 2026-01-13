import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { ApplicationPolicyService } from "./applicationPolicy.service";
import { SourcesService } from "src/sources/sources.service";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { Customer } from "src/entities/customer.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { identity } from "rxjs";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { AsyncTask, TaskOps } from "src/entities/asyncTasks.entity";
import { CrmData } from "src/entities/compliance/crmData.entity";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";

interface UpdateApplicationField {
    name: string;
    desc: string;
    url: string;
    tags: string[];
    standardIds: number[];
    is_locked: boolean;
}

export class UpdateApplicationService {
 
    constructor(
        @InjectRepository(App) private readonly appRepo: Repository<App>,
        @InjectRepository(OrganizationStandards) private readonly standardsRepo: Repository<OrganizationStandards>,
        private readonly ApplicationPolicyService: ApplicationPolicyService,
        private readonly dataSource: DataSource,
        private readonly sourceService: SourcesService,
        @InjectRepository(SourceV1) private readonly sourceRepo: Repository<SourceV1>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(LicenseType) private readonly licenseTypeRepo: Repository<LicenseType>,
        @InjectRepository(LicenseRule) private readonly licenseRuleRepo: Repository<LicenseRule>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        private readonly syncComplianceV2Service: SyncComplianceV2Service,
        @InjectRepository(ApplicationControlMapping) private readonly appControlMappingRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(ApplicationControlRecommendation) private readonly appControlRecommendationRepo: Repository<ApplicationControlRecommendation>,
        @InjectRepository(ControlEvaluationResult) private readonly appControlRepo: Repository<ControlEvaluationResult>,
        @InjectRepository(ApplicationControlEvidence) private readonly appControlEvidenceRepo: Repository<ApplicationControlEvidence>,
        @InjectRepository(AsyncTask) private readonly asyncTaskRepo: Repository<AsyncTask>,
        @InjectRepository(CrmData) private readonly crmDataRepo: Repository<CrmData>,
        private readonly s3Service: AwsS3ConfigService
    ) { }

    async updateApplication(
        userInfo: { userId: string, tenantId: string },
        appId: number,
        appData: UpdateApplicationField
    ): Promise<void> {
        await this.ApplicationPolicyService.canUpdateApplication(userInfo, appId);
        await this.validateStandards(appData.standardIds, userInfo.tenantId, appId);
        await this.validateAppName(appData.name, userInfo.tenantId, appId);

        const updateData: Omit<UpdateApplicationField, 'standardIds'> & {
            updated_at: Date;
            updated_by: string;
        } = {
            name: appData.name,
            desc: appData.desc,
            url: appData.url,
            tags: appData.tags,
            updated_at: new Date(),
            updated_by: userInfo.userId,
            is_locked: appData.is_locked
        };

        this.dataSource.transaction(async (manager) => {
            const currentStandards: AppStandard[] = await manager.find(AppStandard, { where: { app_id: appId } });
            const currentStandardIds = currentStandards.map(standard => standard.standard_id)

            const standardsToAdd = appData.standardIds.filter(id => !currentStandardIds.includes(id));
            const standardsToRemove = currentStandardIds.filter(id => !appData.standardIds.includes(id));

            if (standardsToAdd.length) {
                await manager.insert(AppStandard, standardsToAdd.map(standardId => ({ app_id: appId, standard_id: standardId })));
            }

            if (standardsToRemove.length) {
                await manager.delete(AppStandard, { app_id: appId, standard_id: In(standardsToRemove) });
            }

            const result = await manager.update(App, { id: appId }, updateData);
            if (result.affected === 0) new ForbiddenException('Application not found.');
        })
    }

    private async validateStandards(standardIds: number[], tenantId: string, application_id: number): Promise<void> {
        if (!standardIds || !standardIds.length) {
            throw new BadRequestException({
                error: 'No standards provided!',
                message: 'No standards provided!',
            });
        }

        const standards = new Set(standardIds);

        const appStandards = await this.appStandardRepo.find({ where: { app_id: application_id } });

        const customer = await this.customerRepo.findOne({ where: { id: tenantId }, relations: ['licenseType', 'licenseType.licenseRule'] });

        if(!customer) {
            throw new ForbiddenException('Customer not found.');
        }

        const licenseRule = customer.licenseType.licenseRule;

        appStandards.forEach(appStandard => {
            standards.add(appStandard.standard_id);
        });

        if(licenseRule.standards_per_application > 0 && standards.size > licenseRule.standards_per_application) {
            throw new ForbiddenException('Number of standards per application exceeds the limit.');
        }

        if(licenseRule.available_standards.length) {
            const unavailableStandards = standardIds.filter(id => !licenseRule.available_standards.includes(id));
            if (unavailableStandards.length > 0) {
                throw new ForbiddenException(`The following standards are not available in current license: ${unavailableStandards.join(', ')}`);
            }
        }
        
        const validStandards = await this.standardsRepo.find({
            where: {
                customer_id: tenantId,
                standard_id: In(standardIds),
            },
            select: ['standard_id'],
        });

        const validStandardIds = new Set(validStandards.map(s => s.standard_id));
        const invalidStandards = standardIds.filter(id => !validStandardIds.has(id));

        if (invalidStandards.length > 0) {
            throw new ForbiddenException(`The following standards are not part of the organization: ${invalidStandards.join(', ')}`);
        }
    }

    private async validateAppName(name: string, tenantId: string, appId: number): Promise<void> {
        if (!name) {
            throw new BadRequestException({
                error: 'Application name is required!',
                message: 'Application name is required!',
            });
        }

        const app = await this.appRepo.findOne({ where: { id: appId, customer_id: tenantId } });
        if (!app) {
            throw new ForbiddenException('Application not found.');
        }

        const appWithSameName = await this.appRepo.createQueryBuilder("app")
            .where("app.customer_id = :tenantId", { tenantId })
            .andWhere("app.name ILIKE :name", { name })
            .getOne();

        if (appWithSameName && appWithSameName.id !== appId) {
            throw new BadRequestException({
                error: `An application with the name ${name} already exists`,
                message: `An application with the name ${name} already exists`,
            });
        }
    }


    async updateApplicationStandard(
        userInfo: { userId: string, customerId: string },
        appId: number,
        appData: UpdateApplicationField
    ): Promise<void> {
        await this.ApplicationPolicyService.canUpdateApplication(userInfo, appId);
        await this.validateStandards(appData.standardIds, userInfo.customerId, appId);
        await this.validateAppName(appData.name, userInfo.customerId, appId);

        const updateData: Omit<UpdateApplicationField, 'standardIds'> & {
            updated_at: Date;
            updated_by: string;
        } = {
            name: appData.name,
            desc: appData.desc,
            url: appData.url,
            tags: appData.tags,
            updated_at: new Date(),
            updated_by: userInfo.userId,
            is_locked: appData.is_locked
        };

        await this.dataSource.transaction(async (manager: EntityManager) => {
            await this.updateApplicationStandardTransaction(manager, appId, appData, updateData);
        });

        const source = await this.dataSource.manager.find(SourceV1, { where: { app_id: appId, is_active: true } });

        if (source.length > 0) {
            const data = { "appId": appId };
            for (const sourceItem of source) {
                await this.sourceService.updateSourceDetails(data, userInfo, sourceItem.id, true);
            }
        }

        await this.syncComplianceV2Service.createApplicationControlsForStandard(userInfo, appId, appData.standardIds);

    }

    private async updateApplicationStandardTransaction(
        manager: EntityManager,
        appId: number,
        appData: UpdateApplicationField,
        updateData: Omit<UpdateApplicationField, 'standardIds'> & { updated_at: Date; updated_by: string; }
    ): Promise<void> {
        const currentStandards: AppStandard[] = await manager.find(AppStandard, { where: { app_id: appId } });
        const currentStandardIds = currentStandards.map(standard => standard.standard_id);

        if (currentStandardIds.some(id => appData.standardIds.includes(id))) {
            throw new BadRequestException({
                error: 'Standard already added!',
                message: 'Standard already added!',
            });
        }

        const standardsToAdd = appData.standardIds.filter(id => !currentStandardIds.includes(id));
        if (standardsToAdd.length) {
            await manager.insert(AppStandard, standardsToAdd.map(standardId => ({ app_id: appId, standard_id: standardId, source_updated_at: new Date() })));
        }

        const result = await manager.update(App, { id: appId }, updateData);
        if (result.affected === 0) {
            throw new ForbiddenException('Application not found.');
        }
    }

    async lockApplication(userData: { userId: any; tenantId: any; }, appId: number, body: any): Promise<void> {
    

        await this.ApplicationPolicyService.canUpdateApplication(userData, appId);
        let is_lock = body.is_locked;
        if (is_lock === undefined) {
            throw new BadRequestException({ })
        }

        const app = await this.appRepo.findOne({ where: { id: appId, customer_id: userData.tenantId } });
        if (!app) {
            throw new ForbiddenException('Application not found.');
        }

        await this.appRepo.update({ id: appId }, { is_locked: is_lock, updated_at: new Date(), updated_by: userData.userId });

    }

    async removeStandardFromApplication(
        userInfo: { userId: string, tenantId: string },
        appId: number,
        standardId: number
    ): Promise<void> {
        await this.ApplicationPolicyService.canDeleteStandard(userInfo, appId);
        const app = await this.appRepo.findOne({
            where: { id: appId, customer_id: userInfo['customerId'] },
        });
        await this.validateNoComplianceSyncRunning(userInfo.tenantId, appId);

        const appControlMapping = await this.appControlMappingRepo.find({
            where: { app_id: appId, standard_id: standardId }
        });

        if (!appControlMapping) {
            throw new BadRequestException(`Standard with ID ${standardId} is not associated with this application`);
        }

        await this.appControlMappingRepo.remove(appControlMapping);


        if (!app) {
            throw new ForbiddenException(`Application with ID ${appId} not found or you don't have permission to update it`);
        }

        const appStandard = await this.appStandardRepo.findOne({
            where: { app_id: appId, standard_id: standardId }
        });

        
        
        if (!appStandard) {
            throw new BadRequestException(`Standard with ID ${standardId} is not associated with this application`);
        }
        const crm_file_path = appStandard.crm_file_path;
        const temp_crm_file_path = appStandard.temp_crm_file_path;

        if (crm_file_path) {
            const s3Client = this.s3Service.getS3();
            const deleteCommand = this.s3Service.deleteObjectCommand(crm_file_path);
            await s3Client.send(deleteCommand);
          }
          if (temp_crm_file_path) {
            const s3Client = this.s3Service.getS3();
            const deleteCommand = this.s3Service.deleteObjectCommand(temp_crm_file_path);
            await s3Client.send(deleteCommand);
          }
      
        await this.appStandardRepo.remove(appStandard);

        await this.crmDataRepo.delete({
            app_id: appId,
            standard_id: standardId
        });

        const appControlRecommendation = await this.appControlRecommendationRepo.find({
            where: { application_id: appId, standard_id: standardId }
        });

        if (appControlRecommendation) {
            await this.appControlRecommendationRepo.remove(appControlRecommendation);
        }

        const controlEvaluationResult = await this.appControlRepo.find({
            where: { app_id: appId, standard_id: standardId }
        });

        if (controlEvaluationResult) {
            await this.appControlRepo.remove(controlEvaluationResult);
        }
         await this.appControlEvidenceRepo.delete({
            application_control_mapping_id: In(appControlMapping.map(item => item.id))
        });

        await this.appRepo.update(appId, {
            updated_at: new Date(),
            updated_by: userInfo.userId
        });

    }

    private async validateNoComplianceSyncRunning(customerId: string, appId: number): Promise<void> {
        const asyncTask: AsyncTask[] = await this.asyncTaskRepo.find({
            select: ['id'],
            where: {
                app_id: appId,
                customer_id: customerId,
                ops: TaskOps.UPDATE_COMPLIANCE,
                status: In(AsyncTask.pendingTaskStatus())
            },
            take: 1
        })

        if (asyncTask && asyncTask.length > 0) {
            throw new BadRequestException('please wait the previous compliance is done');
        }
    }

}
