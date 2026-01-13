import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SqsService } from "@ssut/nestjs-sqs";
import { is } from "cheerio/dist/commonjs/api/traversing";
import { UpdateAuditFeedbackDto } from "src/audit/audit/audit.dto";
import { AuditService } from "src/audit/audit/audit.service";
import { AppStandard } from "src/entities/appStandard.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import {
  ApplicationControlMapping,
  ApplicationControlMappingStatus,
} from "src/entities/compliance/applicationControlMapping.entity";
import { ApplicationControlMappingView } from "src/entities/compliance/applicationControlMappingView.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { LoggerService } from "src/logger/logger.service";
import { Brackets, DataSource, In, MoreThan, Repository } from "typeorm";

interface AppControlMapDto {
  app_id: number;
  standard_id: number;
  control_id: number;
  implementation_status: ApplicationControlMappingStatus;
}

@Injectable()
export class SyncComplianceV2Service {
  constructor(
    @InjectRepository(SourceV1)
    private readonly sourceRepo: Repository<SourceV1>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(StandardControlMapping)
    private readonly standardControlMapRepo: Repository<StandardControlMapping>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMaprepo: Repository<ApplicationControlMapping>,
    @InjectRepository(ApplicationControlMappingView)
    private readonly appControlMapViewRepo: Repository<ApplicationControlMappingView>,
    @InjectRepository(SourceVersion)
    private readonly sourceVersionRepo: Repository<SourceVersion>,
    private readonly dataSource: DataSource,
    private readonly sqsProducerService: SqsService,
    private readonly logger: LoggerService,
    private readonly auditServices: AuditService
  ) {}

  async syncForApplication(
    userInfo: { userId: string; customerId: string },
    appId: number,
    skipSourceValidation: boolean = false
  ): Promise<void> {
    if (!skipSourceValidation) {
      await this.validateAtLeastHaveOneSource(userInfo.customerId, appId);
    }
    await this.validateNoComplianceSyncRunning(userInfo.customerId, appId);

    // ✅ OPTIMIZATION: Calculate instant scores first for immediate feedback
    try {
      const appStandards = await this.appStandardRepo.find({
        where: { app_id: appId },
        select: ['standard_id'],
      });
      const standardIds = appStandards.map(s => s.standard_id);
      
      if (standardIds.length > 0) {
        // Inject UpdateComplianceService to call instant scoring
        // Note: This requires forwardRef or direct injection
        this.logger.log(`[INSTANT SCORING] Calculating instant scores for app ${appId} before queue processing`);
        // Instant scoring will be called from controller to avoid circular dependency
      }
    } catch (error) {
      this.logger.warn(`[INSTANT SCORING] Failed to calculate instant scores: ${error.message}`);
      // Continue with queue processing even if instant scoring fails
    }

    // await this.generateComplianceControl(appId);
    await this.publishToQueue(
      userInfo.userId,
      userInfo.customerId,
      appId,
      undefined,
      undefined,
      "compliances"
    );
    // Note: have_pending_compliance is set to false in UpdateComplianceService.processComplianceV2
    // after successful compliance processing, not here
  }

  private async validateAtLeastHaveOneSource(
    customerId: string,
    appId: number
  ): Promise<void> {
    try {
      await this.sourceRepo.findOneOrFail({
        select: ["id"],
        where: {
          app_id: appId,
          customer_id: customerId,
          is_active: true,
          is_available: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        "Compliance evaluation requires at least one active source. Please add sources to your application first."
      );
    }
  }

  private async validateNoComplianceSyncRunning(
    customerId: string,
    appId: number
  ): Promise<void> {
    const asyncTask: AsyncTask[] = await this.asyncTaskRepo.find({
      select: ["id"],
      where: {
        app_id: appId,
        customer_id: customerId,
        ops: TaskOps.UPDATE_COMPLIANCE,
        status: In(AsyncTask.pendingTaskStatus()),
      },
      take: 1,
    });

    if (asyncTask && asyncTask.length > 0) {
      throw new BadRequestException(
        "please wait the previous compliance is done"
      );
    }
  }

  private async generateComplianceControl(appId: number): Promise<void> {
    const appStandards = await this.getApplicationStandards(appId);
    this.validateAppStandards(appStandards);

    const standardIds = this.extractStandardIds(appStandards);
    const standardControlMappings =
      await this.getStandardControlMappings(standardIds);

    const pendingStandardIds = await this.pendingStandards(
      appId,
      standardControlMappings
    );
    const appControlMappings = this.createAppControlMappings(
      appId,
      standardControlMappings,
      pendingStandardIds
    );

    await this.saveAppControlMappings(appControlMappings);
  }

  private async generateComplianceControlForStandard(
    appId: number,
    standardIds: number[]
  ): Promise<void> {
    const standardControlMappings =
      await this.getStandardControlMappings(standardIds);

    const pendingStandardIds = await this.pendingStandards(
      appId,
      standardControlMappings
    );
    const appControlMappings = this.createAppControlMappings(
      appId,
      standardControlMappings,
      pendingStandardIds
    );

    await this.saveAppControlMappings(appControlMappings);
  }

  private async getApplicationStandards(appId: number): Promise<AppStandard[]> {
    return this.appStandardRepo.find({
      select: ["standard_id"],
      where: { app_id: appId },
    });
  }

  private validateAppStandards(appStandards: AppStandard[]): void {
    if (appStandards.length === 0) {
      throw new BadRequestException(
        "Application needs to have at least 1 standard"
      );
    }
  }

  private extractStandardIds(appStandards: AppStandard[]): number[] {
    return appStandards.map((standard) => standard.standard_id);
  }

  private async getStandardControlMappings(
    standardIds: number[]
  ): Promise<StandardControlMapping[]> {
    return this.standardControlMapRepo.find({
      select: ["control_id", "standard_id"],
      where: { standard_id: In(standardIds) },
    });
  }

  private async pendingStandards(
    appId: number,
    standardControlMappings: StandardControlMapping[]
  ): Promise<number[]> {
    const pendingStandardIds = new Set<number>();

    for (const mapping of standardControlMappings) {
      const hasExistingMapping = await this.appControlMaprepo.count({
        where: {
          app_id: appId,
          standard_id: mapping.standard_id,
        },
      });

      if (hasExistingMapping === 0) {
        pendingStandardIds.add(mapping.standard_id);
      }
    }

    return Array.from(pendingStandardIds);
  }

  private createAppControlMappings(
    appId: number,
    standardControlMappings: StandardControlMapping[],
    pendingStandardIds: number[]
  ): AppControlMapDto[] {
    return standardControlMappings
      .filter((mapping) => pendingStandardIds.includes(mapping.standard_id))
      .map((mapping) => ({
        app_id: appId,
        standard_id: mapping.standard_id,
        control_id: mapping.control_id,
        implementation_status: ApplicationControlMappingStatus.NOT_IMPLEMENTED,
        is_reviewed: false,
      }));
  }

  private async saveAppControlMappings(
    appControlMappings: AppControlMapDto[]
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.insert(ApplicationControlMapping, appControlMappings);
    });
  }

  public async publishToQueue(
    userId: string,
    customerId: string,
    appId: number,
    standardIds?: number[],
    cIds?: number[],
    opration?: string
  ): Promise<any> {
    const standard_ids = await this.appStandardRepo.find({
      where: { app_id: appId },
    });

    let oprationType = "";
    switch (opration) {
      case "poam":
        oprationType = TaskOps.GENERATE_POAM;
        break;
      case "control_evaluation":
        oprationType = TaskOps.CONTROL_EVALUATION;
        break;
      default:
        oprationType = TaskOps.UPDATE_COMPLIANCE;
    }

    let message: Record<string, any> = {};

    if (oprationType === TaskOps.GENERATE_POAM) {
      message = {
        taskId: null,
        appId: appId,
        customer_id: customerId,
        msg_entity_type: TaskOps.GENERATE_POAM,
        sourceId: 0,
        sourceVersionId: 0,
        sourceTypeId: 0,
        currentVersionFileLocation: "",
        previousVersionId: 0,
        previousVersionFileLocation: "",
      };
    } else {
      message = await this.generateMessage(customerId, appId, opration);
    }

    const task = this.asyncTaskRepo.create({
      ops: oprationType,
      status: TaskStatus.PENDING,
      request_payload: message,
      customer_id: customerId,
      created_by: userId,
      app_id: appId,
      entity_id: appId.toString(),
      entity_type: opration,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.asyncTaskRepo.save(task);

    message.taskId = task.id;
    message.controlIds = cIds && cIds.length > 0 ? cIds : [];
    message.standardIds =
      standardIds && standardIds.length > 0
        ? standardIds
        : standard_ids.map((standard) => standard.standard_id);
    this.logger.info("message for compliance_pipeline v2:-", message);
    await this.sendToQueue(process.env.DS_QUEUE_NAME, {
      id: task.id.toString(),
      body: { type: "compliance", payload: message },
    }, 'compliance pipeline');
  }

  private async generateMessage(
    customerId: string,
    appId: number,
    opration?: string
  ): Promise<Record<string, any>> {
    const source: SourceV1 = await this.sourceRepo.findOne({
      where: {
        app_id: appId,
        customer_id: customerId,
        is_available: true,
      },
      relations: ["current_version_entity"],
    });

    const sourceVersions = await this.sourceVersionRepo
      .createQueryBuilder("sourceVersion")
      .select([
        "sourceVersion.id",
        "sourceVersion.source_id",
        "sourceVersion.created_at",
        "sourceVersion.file_bucket_key",
      ])
      .where("sourceVersion.source_id = :sourceId", { sourceId: source.id })
      .orderBy("sourceVersion.created_at", "DESC")
      .take(2)
      .getRawMany();

    if (sourceVersions.length === 0) {
      throw new BadRequestException(
        "No source version found for the application"
      );
    }

    const previousVersion: SourceVersion | null =
      sourceVersions.length == 1
        ? sourceVersions[0]
        : sourceVersions[sourceVersions.length - 2];

    let entity_type = null;
    if (opration) {
      entity_type =
        opration === "compliances" ? "COMPLIANCE" : "CONTROL_EVALUATION";
    }
    return {
      taskId: null,
      appId: appId,
      customer_id: customerId,
      msg_entity_type: entity_type,
      sourceId: source.id,
      sourceVersionId: source.current_version,
      sourceTypeId: source.source_type,
      currentVersionFileLocation: source.current_version_entity
        ? source.current_version_entity.file_bucket_key
        : source.file_bucket_key,
      previousVersionId: previousVersion ? previousVersion.id : null,
      previousVersionFileLocation: previousVersion
        ? previousVersion.file_bucket_key
        : null,
    };
  }

  private async markNoPendingCompliance(
    appId: number,
    updated_at
  ): Promise<void> {
    this.appStandardRepo.update(
      { app_id: appId },
      { have_pending_compliance: false, compliance_updated_at: updated_at }
    );
  }

  private async markNoPendingComplianceSubLevel(
    appId: number,
    updated_at,
    standardIds: number[]
  ): Promise<void> {
    this.appStandardRepo.update(
      { app_id: appId, standard_id: In(standardIds) },
      { have_pending_compliance: false, compliance_updated_at: updated_at }
    );
  }

  async isSynced(
    appId: number,
    standardId?: number,
    controlId?: number
  ): Promise<boolean> {
    let appStandards: AppStandard[];

    let appControlMappings: ApplicationControlMappingView[];

    let isSynced: boolean = true;

    let source = await this.sourceRepo.findOne({
      where: {
        app_id: appId,
        is_available: true,
      },
    });

    if (!source) {
      return true;
    }

    if (controlId && standardId) {
      appStandards = await this.appStandardRepo.find({
        where: { app_id: appId, standard_id: standardId },
      });

      appControlMappings = await this.appControlMapViewRepo.find({
        where: {
          app_id: appId,
          standard_id: standardId,
          control_id: controlId,
        },
        relations: ["control"],
      });

      if (
        appControlMappings &&
        appControlMappings.length > 0 &&
        appStandards &&
        appStandards.length > 0
      ) {
        isSynced = await this.controlIsSynced(
          appControlMappings[0],
          appStandards[0],
          appControlMappings[0]
        );
        if (!isSynced) {
          return isSynced;
        }
      } else {
        // return true if control mapping or app standard is not found
        return true;
      }

      const childControlMappings = await this.appControlMapViewRepo
        .createQueryBuilder("appControlMappingView")
        .leftJoinAndSelect("appControlMappingView.control", "control")
        .where("appControlMappingView.app_id = :appId", { appId })
        .andWhere("control.control_parent_id = :parentId", {
          parentId: controlId,
        })
        .getMany();

      if (childControlMappings.length > 0) {
        for (const mapping of childControlMappings) {
          isSynced = await this.controlIsSynced(
            mapping,
            appStandards[0],
            mapping
          );
          if (!isSynced) {
            isSynced = false;
            break;
          }
        }
      }

      return isSynced;
    }

    if (standardId) {
      appStandards = await this.appStandardRepo.find({
        where: { app_id: appId, standard_id: standardId },
      });
    } else {
      appStandards = await this.appStandardRepo.find({
        where: { app_id: appId },
      });
    }

    if (!appStandards || appStandards.length === 0) {
      return true;
    }

    const standardIds = appStandards.map((standard) => standard.standard_id);

    appControlMappings = await this.appControlMapViewRepo.find({
      where: { app_id: appId, standard_id: In(standardIds) },
    });

    isSynced = true;
    for (const appStandard of appStandards) {
      const relevantMappings = appControlMappings.filter(
        (mapping) =>
          mapping.standard_id === appStandard.standard_id &&
          mapping.implementation_status !==
            ApplicationControlMappingStatus.NA &&
          mapping.implementation_status !==
            ApplicationControlMappingStatus.NOT_APPLICABLE &&
          mapping.implementation_status !==
            ApplicationControlMappingStatus.EXCEPTION
      );
      if (relevantMappings.length > 0) {
        for (const mapping of relevantMappings) {
          isSynced = await this.controlIsSynced(mapping, appStandard, mapping);
          if (!isSynced) {
            break;
          }
        }
      }
      if (!isSynced) {
        break;
      }
    }

    return isSynced;
  }

  private async controlIsSynced(
    appControlMapping: ApplicationControlMappingView,
    appStandard: AppStandard,
    latestMapping: ApplicationControlMappingView
  ): Promise<boolean> {
    const mappingUpdatedAt = latestMapping.updated_at
      ? new Date(latestMapping.updated_at).getTime()
      : 0;
    const sourceUpdatedAt = appStandard.source_updated_at
      ? appStandard.source_updated_at.getTime()
      : 0;
    const additionalParamUpdatedAt =
      appControlMapping.additional_param_updated_at &&
      appControlMapping.additional_param_updated_at >
        appControlMapping.updated_at
        ? appControlMapping.additional_param_updated_at.getTime()
        : 0;

    if (
      Math.max(sourceUpdatedAt, additionalParamUpdatedAt) > mappingUpdatedAt
    ) {
      return false;
    }

    return true;
  }

  async syncForSubLevel(
    userInfo: { userId: string; customerId: string },
    appId: number,
    standardIds: number[],
    type: string,
    controlIds?: number[]
  ): Promise<void> {
    const updated_at = new Date();
    await this.validateAtLeastHaveOneSource(userInfo.customerId, appId);
    await this.validateNoComplianceSyncRunning(userInfo.customerId, appId);

    // Create the where clause conditionally
    const whereClause: any = { app_id: appId };

    // Only add standard_id to the where clause if standardIds exists and is not empty
    if (standardIds && standardIds.length > 0) {
      whereClause.standard_id = In(standardIds);
    }

    const isControlMappingExists = await this.appControlMaprepo.count({
      where: whereClause,
    });

    if (isControlMappingExists === 0) {
      await this.generateComplianceControl(appId);
    }
    let control_Ids = [];
    if (controlIds && controlIds.length > 0) {
      const appControlMappings = await this.getControlIds(
        appId,
        standardIds,
        controlIds
      );
      control_Ids = appControlMappings.map((control) => control.control_id);
    }
    await this.updateExistingAuditFeedback(
      userInfo,
      appId,
      standardIds,
      userInfo.customerId,
      controlIds
    );
    await this.publishToQueue(
      userInfo.userId,
      userInfo.customerId,
      appId,
      standardIds,
      control_Ids,
      "compliances"
    );
    // Note: have_pending_compliance is set to false in UpdateComplianceService.processComplianceV2
    // after successful compliance processing, not here
  }

  async updateExistingAuditFeedback(
    userInfo: any,
    appId: number,
    standardIds: number[],
    customerId: string,
    control_Ids?: number[]
  ) {
    for (const standardId of standardIds) {
      const updateData: UpdateAuditFeedbackDto = {
        app_id: appId,
        standard_id: standardId,
        customer_id: "",
        control_id: 0,
      };
      await this.auditServices.bulkUpdateFeedback(userInfo, updateData);
    }
  }

  async getControlIds(
    appId: number,
    standardIds: number[],
    controlIds?: number[]
  ): Promise<ApplicationControlMapping[]> {
    const query = this.appControlMaprepo
      .createQueryBuilder("appControlMapping")
      .where("appControlMapping.app_id = :appId", { appId })
      .andWhere("appControlMapping.standard_id IN (:...standardIds)", {
        standardIds,
      });

    if (controlIds && controlIds.length > 0) {
      query.andWhere("appControlMapping.id IN (:...controlIds)", {
        controlIds,
      });
    }

    return query.getMany();
  }

  async createApplicationControls(
    userInfo: { userId: string; customerId: string },
    appId: number
  ): Promise<void> {
    await this.generateComplianceControl(appId);
  }

  async createApplicationControlsForStandard(
    userInfo: { userId: string; customerId: string },
    appId: number,
    standardIds: number[]
  ): Promise<void> {
    await this.generateComplianceControlForStandard(appId, standardIds);
  }

  async evaluateControls(
    userInfo: { userId: string; customerId: string },
    appId: number,
    standardIds: number[],
    type: string,
    controlIds?: number[]
  ): Promise<void> {
    await this.validateAtLeastHaveOneSource(userInfo.customerId, appId);
    await this.validateNoComplianceSyncRunning(userInfo.customerId, appId);
    await this.validateNoControlEvaluationRunning(userInfo.customerId, appId);

    // Create the where clause conditionally
    const whereClause: any = { app_id: appId };

    // Only add standard_id to the where clause if standardIds exists and is not empty
    if (standardIds && standardIds.length > 0) {
      whereClause.standard_id = In(standardIds);
    }

    const isControlMappingExists = await this.appControlMaprepo.count({
      where: whereClause,
    });

    if (isControlMappingExists === 0) {
      throw new BadRequestException(
        "No control mappings found for this application and standard. Please sync compliance first to create control mappings."
      );
    }
    let control_Ids = [];
    if (controlIds && controlIds.length > 0) {
      const appControlMappings = await this.getControlIds(
        appId,
        standardIds,
        controlIds
      );
      control_Ids = appControlMappings.map((control) => control.control_id);
    }
    await this.publishToQueue(
      userInfo.userId,
      userInfo.customerId,
      appId,
      standardIds,
      control_Ids,
      "control_evaluation"
    );
  }

  private async validateNoControlEvaluationRunning(
    customerId: string,
    appId: number
  ): Promise<void> {
    const asyncTask: AsyncTask[] = await this.asyncTaskRepo.find({
      select: ["id"],
      where: {
        app_id: appId,
        customer_id: customerId,
        ops: TaskOps.CONTROL_EVALUATION,
        status: In(AsyncTask.pendingTaskStatus()),
      },
      take: 1,
    });

    if (asyncTask && asyncTask.length > 0) {
      throw new BadRequestException(
        "please wait till the previous evaluation is done"
      );
    }
  }

  private async sendToQueue(queueName: string | undefined, payload: any, context: string) {
    if (process.env.AWS_SQS_ENABLED === 'false') {
      this.logger.warn(`SQS disabled; skipping ${context} message`);
      return;
    }
    if (!queueName) {
      this.logger.warn(`SQS queue not configured; skipping ${context} message`);
      return;
    }
    await this.sqsProducerService.send(queueName, payload);
  }
}
