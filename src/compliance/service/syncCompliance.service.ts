// import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
// import { REQUEST } from "@nestjs/core";
// import { InjectRepository } from "@nestjs/typeorm";
// import { SqsService } from "@ssut/nestjs-sqs";
// import { AppStandard } from "src/entities/appStandard.entity";
// import { AsyncTask, } from "src/entities/asyncTasks.entity";
// import { ComplianceControlEnhancement, ComplianceControlEnhancementStatus } from "src/entities/compliance/complianceControlEnhancement.entity";
// \import { StandardControlEnhancement } from "src/entities/compliance/standardControlEnhancement.entity";
// import { Source } from "src/entities/source/source.entity";
// import { SourceVersion } from "src/entities/source/sourceVersion.entity";
// import { DataSource, EntityManager, In, Repository } from "typeorm";
// import { CompliancePolicy } from "./compliance.policy";
// import { GenerateDummyComplianceService } from "./generateDummyCompliance";


// export enum TaskOps {
//     CREATE_ASSETS = 'CREATE_ASSETS',
//     CREATE_ASSESSMENTS = 'CREATE_ASSESSMENTS',
//     UPDATE_ASSETS = 'UPDATE_ASSETS',
//     UPDATE_ASSESSMENTS = 'UPDATE_ASSESSMENTS',
//     UPDATE_COMPLIANCE = 'UPDATE_COMPLIANCE'
// }

// export enum TaskStatus {
//     PENDING = "PENDING",
//     PROCESSED = "PROCESSED",
//     FAILED = "FAILED",
// }
// @Injectable({ scope: Scope.REQUEST })
// export class SyncComplianceService {
//     constructor(
//         @InjectRepository(AsyncTask)
//         private readonly asyncTaskRepository: Repository<AsyncTask>,
//         private readonly dataSource: DataSource,
//         @Inject(REQUEST) private readonly request: Request,
//         private readonly sqsProducerService: SqsService,
//         private readonly compliancePolicyService: CompliancePolicy,
//         @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
//         @InjectRepository(SourceVersion) private readonly sourceVersionRepo: Repository<SourceVersion>,
//         private readonly generateDummyService: GenerateDummyComplianceService,
//     ) { }

//     async syncApplication(applicationId: number): Promise<void> {
//         await this.compliancePolicyService.canSyncCompliance(this.request['user_data'], applicationId);

//         const { tenant_id, userId } = this.request['user_data'];
//         const orgId = tenant_id;

//         const message = await this.generateMessage(applicationId, orgId);

//         await this.dataSource.transaction(async (manager) => {
//             const complianceId: number = await this.updateAppStandardsAndControls(applicationId, manager);
//             const task = await this.createAsyncTask(applicationId, orgId, userId, message, complianceId, manager);
//             await this.sendToSQSQueue(task.id, message);
//         });

//         await this.updateCountComplianceAndEnhancement(applicationId)

//         if (process.env.POPULATE_COMPLIANCE_DUMMY_DATA === 'true') {
//             await this.generateDummyService.generateForApplication(applicationId);
//         }
//     }

//     private async createAsyncTask(
//         applicationId: number,
//         orgId: string,
//         userId: string,
//         message: Record<string, any>,
//         complianceId: number,
//         manager: EntityManager
//     ): Promise<AsyncTask> {
//         const task = this.asyncTaskRepository.create({
//             ops: TaskOps.UPDATE_COMPLIANCE,
//             status: TaskStatus.PENDING,
//             request_payload: message,
//             customer_id: orgId,
//             created_by: userId,
//             app_id: applicationId,
//             entity_id: complianceId.toString(),
//             entity_type: manager.getRepository(Compliance).metadata.tableName,
//             created_at: new Date(),
//             updated_at: new Date()
//         });
//         return manager.save(task);
//     }

//     private async createCompliance(
//         manager: EntityManager,
//         { tenantId, applicationId, standardId }: { tenantId: string; applicationId: number; standardId: number }
//     ): Promise<Compliance> {
//         return manager.save(Compliance, {
//             customer_id: tenantId,
//             app_id: applicationId,
//             standard_id: standardId,
//             enhancement_count: 0,
//             asset_count: 0,
//             exception_count: 0,
//             percentage_completion: 0,
//             created_at: new Date(),
//             updated_at: new Date()
//         });
//     }

//     private async createComplianceCategory(
//         manager: EntityManager,
//         { tenantId, applicationId, standardId, standardCategoryId, complianceId }: {
//             tenantId: string;
//             applicationId: number;
//             standardId: number,
//             standardCategoryId: string,
//             complianceId: number;
//         }
//     ): Promise<ComplianceCategory> {
//         return manager.save(ComplianceCategory, {
//             customer_id: tenantId,
//             app_id: applicationId,
//             standard_id: standardId,
//             standard_category_id: standardCategoryId,
//             compliance_id: complianceId,
//             implementation: null,
//             asset_count: 0,
//             enhancement_count: 0,
//             exception_count: 0,
//             percentage_completion: 0,
//             created_at: new Date()
//         });
//     }

//     private async createComplianceControl(
//         manager: EntityManager,
//         { tenantId, applicationId, standardControl, complianceId, complianceCategoryId }: {
//             tenantId: string;
//             applicationId: number;
//             standardControl: StandardControlWithEnhancements;
//             complianceId: number;
//             complianceCategoryId: number;
//         }
//     ): Promise<ComplianceControl> {
//         return manager.save(ComplianceControl, {
//             customer_id: tenantId,
//             app_id: applicationId,
//             standard_id: standardControl.standard_id,
//             standard_control_id: standardControl.id,
//             standard_category_id: standardControl.standard_category_id,
//             compliance_id: complianceId,
//             compliance_category_id: complianceCategoryId,
//             implementation: null,
//             risk_levels: null,
//             asset_count: 0,
//             enhancement_count: 0,
//             percentage_completion: 0,
//             created_at: new Date()
//         });
//     }

//     private createComplianceEnhancementData(
//         tenantId: string,
//         applicationId: number,
//         standardControl: StandardControlWithEnhancements,
//         complianceId: number,
//         complianceCategoryId: number,
//         complianceControlId: number,
//         enhancement: StandardControlEnhancement
//     ): Partial<ComplianceControlEnhancement> {
//         return {
//             customer_id: tenantId,
//             app_id: applicationId,
//             standard_id: standardControl.standard_id,
//             standard_control_id: standardControl.id,
//             standard_control_enhancement_id: enhancement.id,
//             standard_category_id: standardControl.standard_category_id,
//             compliance_id: complianceId,
//             compliance_category_id: complianceCategoryId,
//             compliance_control_id: complianceControlId,
//             implementation: null,
//             status: ComplianceControlEnhancementStatus.NOT_IMPLEMENTED,
//             exception: false,
//             exception_reason: null,
//             risk_levels: null,
//             percentage_completion: 0,
//             asset_count: 0,
//             created_at: new Date()
//         };
//     }

//     public async updateAppStandardsAndControls(
//         applicationId: number,
//         manager: EntityManager
//     ): Promise<number> {
//         const tenantId: string = this.request['user_data'].tenant_id;

//         const standardIds = await this.getStandardIds(applicationId, manager);
//         if (standardIds.length === 0) return;

//         await this.batchUpdateAppStandards(standardIds, manager);

//         const compliance: Compliance[] = await manager.find(Compliance, { where: { app_id: applicationId, standard_id: In(standardIds) } })

//         if (compliance.length > 0) {
//             await manager.update(Compliance, { app_id: applicationId }, { updated_at: new Date() });
//             return compliance[0].id;
//         }

//         const compliances = await this.createCompliances(standardIds, manager, tenantId, applicationId);

//         const [standardControls, standardCategories] = await Promise.all([
//             manager.find(StandardControl, {
//                 where: { standard_id: In(standardIds) },
//                 relations: ['standard_control_enhancement']
//             }),
//             manager.find(StandardCategory, {
//                 where: { standard_id: In(standardIds) }
//             })
//         ]);

//         const complianceCategories = await this.processComplianceCategories(
//             standardCategories,
//             compliances,
//             manager,
//             tenantId,
//             applicationId
//         );

//         await this.processComplianceControlsAndEnhancements(
//             standardControls,
//             complianceCategories,
//             compliances,
//             manager,
//             tenantId,
//             applicationId
//         );

//         return compliances[0].id;
//     }

//     private async getStandardIds(applicationId: number, manager: EntityManager): Promise<number[]> {
//         const appStandards = await manager.find(AppStandard, { where: { app_id: applicationId } });
//         return appStandards.map(appStandard => appStandard.standard_id);
//     }

//     private async batchUpdateAppStandards(standardIds: number[], manager: EntityManager): Promise<void> {
//         await manager.update(
//             AppStandard,
//             { standard_id: In(standardIds) },
//             { have_pending_compliance: false }
//         );
//     }

//     private async createCompliances(
//         standardIds: number[],
//         manager: EntityManager,
//         tenantId: string,
//         applicationId: number
//     ): Promise<Compliance[]> {
//         return Promise.all(
//             standardIds.map(standardId =>
//                 this.createCompliance(manager, { tenantId, applicationId, standardId })
//             )
//         );
//     }

//     private async processComplianceCategories(
//         standardCategories: StandardCategory[],
//         compliances: Compliance[],
//         manager: EntityManager,
//         tenantId: string,
//         applicationId: number
//     ): Promise<Map<number, ComplianceCategory[]>> {
//         const complianceCategories = new Map<number, ComplianceCategory[]>();

//         for (const standardCategory of standardCategories) {
//             const compliance = compliances.find(c => c.standard_id === standardCategory.standard_id);
//             if (!compliance) continue;

//             const complianceCategory = await this.createComplianceCategory(manager, {
//                 tenantId,
//                 applicationId,
//                 standardCategoryId: standardCategory.id,
//                 standardId: standardCategory.standard_id,
//                 complianceId: compliance.id
//             });

//             if (!complianceCategories.has(standardCategory.standard_id)) {
//                 complianceCategories.set(standardCategory.standard_id, []);
//             }
//             complianceCategories.get(standardCategory.standard_id).push(complianceCategory);
//         }

//         return complianceCategories;
//     }

//     private async processComplianceControlsAndEnhancements(
//         standardControls: StandardControl[],
//         complianceCategoriesMap: Map<number, ComplianceCategory[]>,
//         compliances: Compliance[],
//         manager: EntityManager,
//         tenantId: string,
//         applicationId: number
//     ): Promise<void> {
//         const enhancementPromises: Promise<any>[] = [];

//         for (const standardControl of standardControls) {
//             // Find the compliance associated with the current standard control
//             const compliance = compliances.find(c => c.standard_id === standardControl.standard_id);
//             if (!compliance) continue;

//             // Retrieve compliance categories for the given standard control ID
//             const complianceCategories = complianceCategoriesMap.get(standardControl.standard_id) || [];
//             if (complianceCategories.length === 0) continue;

//             // Find the specific compliance category matching the control's category ID
//             const complianceCategory = complianceCategories.find(
//                 category => category.standard_category_id === standardControl.standard_category_id
//             );
//             if (!complianceCategory) continue;

//             // Create a compliance control
//             const complianceControl = await this.createComplianceControl(manager, {
//                 tenantId,
//                 applicationId,
//                 standardControl,
//                 complianceId: compliance.id,
//                 complianceCategoryId: complianceCategory.id,
//             });

//             // Batch insert enhancements if present
//             if (standardControl.standard_control_enhancement.length > 0) {
//                 const enhancementData = standardControl.standard_control_enhancement.map(enhancement =>
//                     this.createComplianceEnhancementData(
//                         tenantId,
//                         applicationId,
//                         standardControl,
//                         compliance.id,
//                         complianceCategory.id,
//                         complianceControl.id,
//                         enhancement
//                     )
//                 );

//                 enhancementPromises.push(manager.insert(ComplianceControlEnhancement, enhancementData));
//             }
//         }

//         await Promise.all(enhancementPromises);
//     }

//     private async sendToSQSQueue(taskId: number, message: Record<string, any>): Promise<void> {
//         if (message === null || Object.keys(message).length === 0) return;
//         message.taskId = taskId;
//         await this.sqsProducerService.send(
//             process.env.SQS_COMPLIANCE_QUEUE_NAME,
//             {
//                 id: taskId.toString(),
//                 body: message
//             }
//         );
//     }

//     private async updateCountComplianceAndEnhancement(applicationId: number): Promise<void> {
//         await this.dataSource.transaction(async (manager) => {
//             const compliances: Compliance[] = await manager.find(Compliance, { where: { app_id: applicationId } });

//             const compliancePromise = [];
//             for (const compliance of compliances) {
//                 compliancePromise.push(
//                     this.dataSource.query(`
//                         UPDATE compliances
//                         SET control_count = (
//                             SELECT COUNT(*)
//                             FROM compliance_controls
//                             WHERE compliance_controls.compliance_id = $1
//                         )
//                         WHERE id = $1
//                     `, [compliance.id]),

//                     this.dataSource.query(`
//                         UPDATE compliance_categories
//                         SET enhancement_count = COALESCE(ec.count, 0)
//                         FROM (
//                             SELECT compliance_category_id, COUNT(*) AS count
//                             FROM compliance_control_enhancements
//                             GROUP BY compliance_category_id
//                         ) AS ec
//                         WHERE compliance_categories.id = ec.compliance_category_id
//                         AND compliance_categories.compliance_id = $1;
//                     `, [compliance.id]),

//                     this.dataSource.query(`
//                         UPDATE compliance_controls
//                         SET enhancement_count = COALESCE(ec.count, 0)
//                         FROM (
//                             SELECT compliance_control_id, COUNT(*) AS count
//                             FROM compliance_control_enhancements
//                             GROUP BY compliance_control_id
//                         ) AS ec
//                         WHERE compliance_controls.id = ec.compliance_control_id
//                         AND compliance_controls.compliance_id = $1;
//                     `, [compliance.id]),
//                 );
//             }

//             await Promise.all(compliancePromise);
//         });
//     }

//     private async generateMessage(applicationId: number, orgId: number): Promise<Record<string, any>> {
//         if (process.env.POPULATE_COMPLIANCE_DUMMY_DATA === 'true') {
//             return {};
//         }
//         const source: Source = await this.sourceRepo.findOneOrFail({
//             where: { app_id: applicationId, is_deleted: false },
//             order: { created_at: 'DESC' }
//         });

//         const sourceVersions = await this.sourceVersionRepo
//             .createQueryBuilder('sourceVersion')
//             .select(['sourceVersion.id', 'sourceVersion.source_id', 'sourceVersion.created_at', 'sourceVersion.file_bucket_key'])
//             .where('sourceVersion.source_id = :sourceId', { sourceId: source.id })
//             .orderBy('sourceVersion.created_at', 'DESC')
//             .take(2)
//             .getRawMany(); // Use getRawMany to bypass the transformer

//         const mappedSourceVersions = sourceVersions.map(version => ({
//             id: version.sourceVersion_id, // raw id
//             source_id: version.sourceVersion_source_id, // raw source_id
//             created_at: version.sourceVersion_created_at, // raw created_at
//             file_bucket_key: version.sourceVersion_file_bucket_key // raw file_bucket_key, no transformer
//         }));

//         if (mappedSourceVersions.length === 0) {
//             throw new BadRequestException('No source version found for the application');
//         }

//         const previousVersion: SourceVersion | null = mappedSourceVersions.length == 1 ? mappedSourceVersions[0] : mappedSourceVersions[1];

//         return {
//             taskId: null,
//             appId: applicationId,
//             customer_id: orgId,
//             msg_entity_type: 'COMPLIANCE',
//             sourceId: source.id,
//             sourceVersionId: source.current_version,
//             sourceTypeId: source.source_type,
//             currentVersionFileLocation: mappedSourceVersions[0].file_bucket_key,
//             previousVersionId: previousVersion.id,
//             previousVersionFileLocation: previousVersion.file_bucket_key,
//         };
//     }
// }
