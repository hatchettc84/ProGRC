import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AppUser, AppUserRole } from "src/entities/appUser.entity";
import { Customer } from "src/entities/customer.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { User } from "src/entities/user.entity";
import { LoggerService } from "src/logger/logger.service";
import { UserRoles } from "src/masterData/userRoles.entity";
import { DataSource, In, Repository } from "typeorm";
import { ApplicationPolicyService } from "./applicationPolicy.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { v4 as uuidv4 } from "uuid";
import { CopyObjectCommand } from "@aws-sdk/client-s3";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { SqsMessageHandler, SqsService } from "@ssut/nestjs-sqs";
import { DeleteMessageCommand, Message, SQSClient } from "@aws-sdk/client-sqs";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { FileType } from "src/app/app.dto";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";

interface CreateApplicationParams {
  name: string;
  standardIds: number[];
  desc?: string;
  url?: string;
  tags?: string[];
  members?: ApplicationMember[];
  auditors?: ApplicationMember[];
}

interface ApplicationMember {
  userId: string;
  role: AppUserRole;
}

@Injectable()
export class CreateApplicationService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User) private readonly membersRepo: Repository<User>,
    @InjectRepository(OrganizationStandards)
    private readonly standardsRepo: Repository<OrganizationStandards>,
    @InjectRepository(App) private readonly appRepo: Repository<App>,
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    @InjectRepository(SourceV1)
    private readonly sourceRepo: Repository<SourceV1>,
    @InjectRepository(SourceChunkMapping)
    private readonly sourceChunkMappingRepo: Repository<SourceChunkMapping>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMappingRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(SourceVersion)
    private readonly sourceVersionRepo: Repository<SourceVersion>,
    private readonly applicationPolicyService: ApplicationPolicyService,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    private readonly s3Service: AwsS3ConfigService,
    private readonly sqsProducerService: SqsService,
    private readonly sqsClient: SQSClient,
    @InjectRepository(ControlChunkMapping)
    private readonly controlChunkMappingRepo: Repository<ControlChunkMapping>
  ) {}

  async createApplication(
    userInfo: { userId: string; tenantId: string },
    application: CreateApplicationParams
  ): Promise<App> {
    const { userId, tenantId } = userInfo;

    await this.checkTenantExistenceAndLicense(tenantId);
    await this.validateMembers(application.members, tenantId);
    await this.validateStandards(application.standardIds, tenantId);
    await this.validateAppName(application.name, tenantId);
    await this.validateAuditors(application.auditors, tenantId);

    const appData = {
      customer_id: tenantId,
      created_by_user_id: userId,
      created_at: new Date(),
      name: application.name,
      desc: application.desc,
      url: application.url,
      tags: application.tags,
    };

    return this.dataSource.transaction(async (manager) => {
      const app = await manager.save(App, appData);

      const allUsers = await this.prepareAppUsers(
        app.id,
        userId,
        application.members
      );
      const allAuditors = await this.prepareAppAuditors(
        app.id,
        userId,
        application.auditors
      );

      if (!allUsers.length) {
        throw new BadRequestException("please provide at least one member");
      }

      await manager.insert(AppUser, allUsers);

      const appStandards: Partial<AppStandard>[] = application.standardIds.map(
        (standardId) => ({
          app_id: app.id,
          standard_id: standardId,
        })
      );

      await manager.insert(AppStandard, appStandards);

      return app;
    });
  }

  private async checkTenantExistenceAndLicense(
    tenantId: string
  ): Promise<void> {
    const tenant = await this.customerRepo.findOne({
      where: { id: tenantId },
      relations: ["licenseType", "licenseType.licenseRule"],
    });
    if (!tenant) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }
    if (!tenant.licenseType || !tenant.licenseType.licenseRule) {
      throw new ForbiddenException({
        error: "Organization does not have a valid license.",
        message: "Organization does not have a valid license.",
      });
    }
    const appCount = await this.appRepo.count({
      where: { customer_id: tenantId },
    });
    if (
      tenant.licenseType.licenseRule.number_of_applications > 0 &&
      appCount >= tenant.licenseType.licenseRule.number_of_applications
    ) {
      throw new ForbiddenException({
        error: "Organization has reached the maximum application limit.",
        message: "Organization has reached the maximum application limit.",
      });
    }
  }

  private async validateMembers(
    members: CreateApplicationParams["members"],
    tenantId: string
  ): Promise<void> {
    if (members?.length) {
      const memberCount = await this.membersRepo.countBy({
        customer_id: tenantId,
        id: In(members.map((member) => member.userId)),
      });

      if (memberCount !== members.length) {
        throw new ForbiddenException(
          "One or more members are not part of the organization."
        );
      }
    }
  }

  private async validateStandards(
    standards: number[],
    tenantId: string
  ): Promise<void> {
    if (!standards || !standards.length) {
      throw new BadRequestException({
        error: "No standards provided!",
        message: "No standards provided!",
      });
    }

    const customer = await this.customerRepo.findOne({
      where: { id: tenantId },
      relations: ["licenseType", "licenseType.licenseRule"],
    });

    if (!customer) {
      throw new ForbiddenException("Customer not found.");
    }

    const licenseRule = customer.licenseType.licenseRule;

    if (
      licenseRule.standards_per_application > 0 &&
      standards.length > licenseRule.standards_per_application
    ) {
      throw new ForbiddenException(
        "Number of standards per application exceeds the limit."
      );
    }

    if (licenseRule.available_standards.length) {
      const unavailableStandards = standards.filter(
        (id) => !licenseRule.available_standards.includes(id)
      );
      if (unavailableStandards.length > 0) {
        throw new ForbiddenException(
          `The following standards are not available in current license: ${unavailableStandards.join(", ")}`
        );
      }
    }

    const validStandards = await this.standardsRepo.find({
      where: {
        customer_id: tenantId,
        standard_id: In(standards),
      },
      select: ["standard_id"],
    });

    const validStandardIds = new Set(validStandards.map((s) => s.standard_id));
    const invalidStandards = standards.filter(
      (id) => !validStandardIds.has(id)
    );

    if (invalidStandards.length > 0) {
      throw new ForbiddenException(
        `The following standards are not part of the organization: ${invalidStandards.join(", ")}`
      );
    }
  }

  private async validateAppName(name: string, tenantId: string): Promise<void> {
    if (!name) {
      throw new BadRequestException({
        error: "No name provided!",
        message: "No name provided!",
      });
    }

    const appExists = await this.appRepo
      .createQueryBuilder("app")
      .where("app.customer_id = :tenantId", { tenantId })
      .andWhere("app.name ILIKE :name", { name })
      .getExists();

    if (appExists) {
      throw new BadRequestException({
        error: `An application with the name ${name} already exists`,
        message: `An application with the name ${name} already exists`,
      });
    }
  }

  private async prepareAppUsers(
    appId: number,
    userId: string,
    members?: CreateApplicationParams["members"]
  ): Promise<Array<{ app_id: number; user_id: string; role: AppUserRole }>> {
    const user: User = await this.membersRepo.findOneOrFail({
      where: { id: userId },
      select: ["role_id"],
    });

    let appAdmin: {
      app_id: number;
      user_id: string;
      role: AppUserRole;
    } | null = null;

    // For internal roles (super admin, CSM), add them as admin if no members provided
    // For non-internal roles, always add them as admin
    const isInternalRole = UserRoles.getInternalRoles().includes(user.role_id);
    const hasMembers = members && members.length > 0;

    if (!isInternalRole) {
      // Non-internal roles are always added as admin
      appAdmin = {
        app_id: appId,
        user_id: userId,
        role: AppUserRole.ADMIN,
      };
    } else if (!hasMembers) {
      // Internal roles: if no members provided, add creator as admin
      appAdmin = {
        app_id: appId,
        user_id: userId,
        role: AppUserRole.ADMIN,
      };
    }

    const memberRoles =
      members
        ?.map((member) => ({
          app_id: appId,
          user_id: member.userId,
          role: member.role,
        }))
        .filter((member) => member.user_id !== userId) || [];

    return appAdmin ? [appAdmin, ...memberRoles] : memberRoles;
  }

  private async validateAuditors(
    members: CreateApplicationParams["auditors"],
    tenantId: string
  ): Promise<void> {
    if (members?.length) {
      const memberCount = await this.membersRepo.countBy({
        id: In(members.map((member) => member.userId)),
      });

      if (memberCount !== members.length) {
        throw new ForbiddenException(
          "One or more members are not part of the organization."
        );
      }
    }
  }

  private async prepareAppAuditors(
    appId: number,
    userId: string,
    members?: CreateApplicationParams["auditors"]
  ): Promise<Array<{ app_id: number; user_id: string; role: AppUserRole }>> {
    const user: User = await this.membersRepo.findOneOrFail({
      where: { id: userId },
      select: ["role_id"],
    });

    let appAdmin: {
      app_id: number;
      user_id: string;
      role: AppUserRole;
    } | null = null;

    if (!UserRoles.getInternalRoles().includes(user.role_id)) {
      appAdmin = {
        app_id: appId,
        user_id: userId,
        role: AppUserRole.AUDITOR,
      };
    }

    const memberRoles =
      members
        ?.map((member) => ({
          app_id: appId,
          user_id: member.userId,
          role: member.role,
        }))
        .filter((member) => member.user_id !== userId) || [];

    return appAdmin ? [appAdmin, ...memberRoles] : memberRoles;
  }

    async cloneApplication(
        userInfo: { userId: string, tenantId: string },
        appId: number,
        newName?: string
    ): Promise<App> {

    // Validate if clone operation is already running
    const existingTask = await this.asyncTaskRepo.findOne({
      where: {
        app_id: appId,
        customer_id: userInfo.tenantId,
        ops: TaskOps.CLONE_APPLICATION,
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROCESS]),
      },
    });

    if (existingTask) {
      throw new BadRequestException(
        "A clone operation is already in progress for this application"
      );
    }

    const originalApp = await this.appRepo.findOne({
      where: { id: appId, deleted_at: null },
    });

    if (!originalApp) {
      throw new BadRequestException("Application not found");
    }

    // Create async task
    const asyncTask = await this.asyncTaskRepo.save({
      app_id: originalApp.id,
      customer_id: userInfo.tenantId,
      created_by: userInfo.userId,
      created_at: new Date(),
      status: TaskStatus.PENDING,
      ops: TaskOps.CLONE_APPLICATION,
      entity_id: appId.toString(),
      entity_type: "application",
      request_payload: {
        original_app_id: appId,
        new_name: newName,
      },
    });

    // Lock the original application
    await this.appRepo.update(appId, {
      is_locked: true,
      updated_at: new Date(),
      updated_by: userInfo.userId,
    });

    // Send message to queue
    const message = {
      taskId: asyncTask.id,
      appId: appId,
      customerId: userInfo.tenantId,
      userId: userInfo.userId,
      newName: newName,
    };

    try {
      await this.sendToQueue(process.env.BACKEND_QUEUE_NAME, {
        id: asyncTask.id.toString(),
        body: { type: "app-clone", payload: message },
      }, 'app clone');
    } catch (error) {
      // If message sending fails, unlock the application and mark task as failed
      await this.appRepo.update(appId, {
        is_locked: false,
        updated_at: new Date(),
        updated_by: userInfo.userId,
      });

      await this.asyncTaskRepo.update(asyncTask.id, {
        status: TaskStatus.FAILED,
        updated_at: new Date(),
      });

      throw new BadRequestException(
        "Failed to initiate clone operation. Please try again."
      );
    }

    return originalApp;
  }

  async handleMessage(message: Message) {
    try {
      const body = message ? JSON.parse(message.Body) : {};
      await this.processMessage(body);
      await this.deleteMessage(message);
    } catch (error) {
      this.logger.error("Error processing application clone message:", error);
      throw error;
    }
  }

  async processMessage(body: any, message?: Message) {
    const { taskId, appId, customerId, userId, newName } = body;

    if (!taskId || !appId || !customerId || !userId) {
      throw new Error("Missing required fields in message");
    }
    const asyncTask = await this.asyncTaskRepo.findOne({
      where: { id: taskId },
    });

    if (asyncTask.status === TaskStatus.FAILED) {
      if (message) {
        await this.deleteMessage(message);
      }
      return;
    }
    await this.processApplicationClone({
      taskId,
      appId,
      customerId,
      userId,
      newName,
    });
  }

  private async deleteMessage(message: Message) {
    if (process.env.AWS_SQS_ENABLED === 'false' || !process.env.SQS_APP_CLONE_URL) {
      this.logger.warn("SQS disabled or delete queue not configured; skipping deleteMessage");
      return;
    }
    try {
      const deleteParams = {
        QueueUrl: process.env.SQS_APP_CLONE_URL,
        ReceiptHandle: message.ReceiptHandle,
      };
      await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
      this.logger.info("Deleted message:", message.MessageId);
    } catch (error) {
      // Log the error but don't throw it since message might have been already deleted
      this.logger.warn("Error deleting SQS message:", error);
    }
  }

  private async cloneControlChunkMappings(
    originalAppId: number,
    newAppId: number,
    queryRunner: any
  ): Promise<void> {
    const controlChunkMappings = await this.controlChunkMappingRepo.find({
      where: { app_id: originalAppId },
      relations: ["source_chunk_mapping"],
    });

    if (!controlChunkMappings.length) return;

    const newMappings = controlChunkMappings.map((mapping) => {
      const { id, created_at, updated_at, ...rest } = mapping;
      return this.controlChunkMappingRepo.create({
        ...rest,
        id: undefined,
        app_id: newAppId,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        is_tagged: false,
      });
    });

    await queryRunner.manager.save(ControlChunkMapping, newMappings);
  }

  private async cloneApplicationConnections(
    originalAppId: number,
    newAppId: number,
    sourceIdMapping: Map<number, number>,
    queryRunner: any
  ): Promise<void> {
    const connections = await queryRunner.manager.find(ApplicationConnection, {
      where: { application_id: originalAppId },
    });

    if (!connections.length) return;

    const newConnections = connections.map((connection) => {
      const { id, created_at, updated_at, ...rest } = connection;
      return {
        ...rest,
        application_id: newAppId,
        source_id: sourceIdMapping.get(connection.source_id) || null,
        created_at: new Date(),
        updated_at: new Date(),
        last_synced_at: null,
      };
    });

    await queryRunner.manager.save(ApplicationConnection, newConnections);
  }

  private async cloneApplicationControlMappings(
    originalAppId: number,
    newAppId: number,
    queryRunner: any
  ): Promise<void> {
    const appControlMappings = await this.appControlMappingRepo.find({
      where: { app_id: originalAppId },
    });

    if (!appControlMappings.length) return;

    const newMappings = appControlMappings.map((mapping) => {
      const { id, created_at, updated_at, is_reviewed, ...rest } = mapping;
      return this.appControlMappingRepo.create({
        ...rest,
        id: undefined,
        app_id: newAppId,
        created_at: new Date(),
        updated_at: new Date(),
        is_reviewed: false,
      });
    });

    await queryRunner.manager.save(ApplicationControlMapping, newMappings);
  }

  private async cloneApplicationControlEvidence(
    originalAppId: number,
    newAppId: number,
    queryRunner: any
  ): Promise<void> {
    // First get all control mappings for both original and new app to create a mapping
    const originalMappings = await queryRunner.manager.find(
      ApplicationControlMapping,
      {
        where: { app_id: originalAppId },
        select: ["id", "control_id", "standard_id"],
      }
    );

    const newMappings = await queryRunner.manager.find(
      ApplicationControlMapping,
      {
        where: { app_id: newAppId },
        select: ["id", "control_id", "standard_id"],
      }
    );

    if (!originalMappings.length || !newMappings.length) {
      this.logger.warn("No control mappings found for evidence cloning");
      return;
    }

    // Create a mapping of original control mapping ID to new control mapping ID
    const controlMappingIdMap = new Map<number, number>();
    originalMappings.forEach((original) => {
      const newMapping = newMappings.find(
        (newMap) =>
          newMap.control_id === original.control_id &&
          newMap.standard_id === original.standard_id
      );
      if (newMapping) {
        controlMappingIdMap.set(original.id, newMapping.id);
      }
    });

    if (controlMappingIdMap.size === 0) {
      this.logger.warn(
        "No matching control mappings found for evidence cloning"
      );
      return;
    }

    // Get all evidence for original app
    const evidences = await queryRunner.manager.find(
      ApplicationControlEvidence,
      {
        where: {
          application_control_mapping_id: In(
            Array.from(controlMappingIdMap.keys())
          ),
        },
      }
    );

    if (!evidences.length) {
      this.logger.info("No evidence found to clone");
      return;
    }

    // Create new evidence entries
    const newEvidences = evidences
      .map((evidence) => {
        const newMappingId = controlMappingIdMap.get(
          evidence.application_control_mapping_id
        );
        if (!newMappingId) return null;

        const { id, created_at, updated_at, ...rest } = evidence;
        return {
          ...rest,
          id: undefined,
          application_control_mapping_id: newMappingId,
          created_at: new Date(),
          updated_at: new Date(),
        };
      })
      .filter(Boolean);

    if (newEvidences.length) {
      await queryRunner.manager.save(ApplicationControlEvidence, newEvidences);
      this.logger.info(
        `Successfully cloned ${newEvidences.length} evidence entries`
      );
    }
  }

  async processApplicationClone(params: {
    taskId: number;
    appId: number;
    customerId: string;
    userId: string;
    newName?: string;
  }): Promise<void> {
    const { taskId, appId, customerId, userId, newName } = params;

    // Fetch original app and user
    const [originalApp, user] = await Promise.all([
      this.appRepo.findOne({ where: { id: appId, deleted_at: null } }),
      this.membersRepo.findOne({ where: { id: userId }, select: ["role_id"] }),
    ]);
    if (!originalApp) throw new BadRequestException("Application not found");
    if (!user) throw new BadRequestException("User not found");

    // Create the new application
    const newApp = this.appRepo.create({
      name: newName || `${originalApp.name}_clone_${Date.now()}`,
      desc: originalApp.desc,
      url: originalApp.url,
      tags: originalApp.tags,
      customer_id: customerId,
      created_by: userId,
      updated_by: userId,
      is_locked: true,
      created_at: new Date(),
    });
    const savedApp = await this.appRepo.save(newApp);

    const appUsers = await this.appUserRepo.find({ where: { app_id: appId } });

    // If user is org member, add as ADMIN
    if (appUsers.length) {
      const newAppUsers = appUsers.map((user) => ({
        app_id: savedApp.id,
        user_id: user.user_id,
        role: user.role,
        created_at: new Date(),
      }));
      this.logger.log("newAppUsers is created for app");
      await this.appUserRepo.save(newAppUsers);
    }

    // Clone standards
    const appStandards = await this.appStandardRepo.find({
      where: { app_id: appId },
    });
    if (appStandards.length) {
      const newStandards = appStandards.map((standard) =>
        this.appStandardRepo.create({
          app_id: savedApp.id,
          standard_id: standard.standard_id,
          have_pending_compliance: true,
          created_at: new Date(),
          updated_at: new Date(),
          source_updated_at: new Date(),
          compliance_updated_at: new Date(),
          is_crm_available: standard.is_crm_available,
          crm_file_path: standard.crm_file_path,
          crm_file_uploaded_at: standard.crm_file_uploaded_at,
        })
      );

      await this.appStandardRepo.save(newStandards);

      // Clone CRM data if available
      for (const standard of appStandards) {
        if (standard.is_crm_available && standard.crm_file_path) {
          const crmData = await this.dataSource.query(
            `
                        SELECT * FROM crm_data 
                        WHERE app_id = $1 AND standard_id = $2
                    `,
            [appId, standard.standard_id]
          );

          if (crmData.length > 0) {
            const newCrmData = crmData.map((data) => ({
              ...data,
              id: undefined,
              app_id: savedApp.id,
              created_at: new Date(),
              updated_at: new Date(),
            }));

            await this.dataSource.query(
              `
                            INSERT INTO crm_data (
                                app_id, standard_id, customer_id, control_id, 
                                crm_provider, crm_status, crm_parameters, 
                                crm_explanation, partner_instructions, 
                                end_customer_instructions, created_at, updated_at
                            ) VALUES ${newCrmData
                              .map(
                                (_, index) =>
                                  `($${index * 12 + 1}, $${index * 12 + 2}, $${index * 12 + 3}, $${index * 12 + 4}, 
                                $${index * 12 + 5}, $${index * 12 + 6}, $${index * 12 + 7}, 
                                $${index * 12 + 8}, $${index * 12 + 9}, $${index * 12 + 10}, 
                                $${index * 12 + 11}, $${index * 12 + 12})`
                              )
                              .join(",")}
                        `,
              newCrmData.flatMap((data) => [
                data.app_id,
                data.standard_id,
                data.customer_id,
                data.control_id,
                data.crm_provider,
                data.crm_status,
                data.crm_parameters,
                data.crm_explanation,
                data.partner_instructions,
                data.end_customer_instructions,
                data.created_at,
                data.updated_at,
              ])
            );
          }
        }
      }
    }

    // Start transaction for deep copy
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clone application control mappings
      await this.cloneApplicationControlMappings(
        appId,
        savedApp.id,
        queryRunner
      );

      // Clone application control evidence
      await this.cloneApplicationControlEvidence(
        appId,
        savedApp.id,
        queryRunner
      );

      // Create a map to store original source ID to new source ID mapping
      const sourceIdMapping = new Map<number, number>();

      // Clone sources and their chunk mappings
      const sources = await this.sourceRepo.find({
        where: { app_id: appId, is_deleted: false },
      });

      // First, create all new sources and store their mappings
      for (const source of sources) {
        const newSource = await this.cloneSource(
          source,
          savedApp,
          customerId,
          userId,
          queryRunner
        );
        sourceIdMapping.set(source.id, newSource.id);
      }

      // Then, clone chunk mappings for all sources
      for (const source of sources) {
        await this.cloneSourceChunkMappings(
          source.id,
          sourceIdMapping.get(source.id),
          savedApp.id,
          customerId,
          queryRunner
        );
      }

      // Update app standards timestamps after source cloning
      await queryRunner.manager.update(
        AppStandard,
        { app_id: savedApp.id },
        {
          updated_at: new Date(),
          source_updated_at: new Date(),
        }
      );

      // Verify sourceIdMapping is populated before cloning connections
      if (sourceIdMapping.size === 0) {
        this.logger.warn("No source mappings found for application cloning");
      }

      // Clone application connections
      await this.cloneApplicationConnections(
        appId,
        savedApp.id,
        sourceIdMapping,
        queryRunner
      );

      // Clone control chunk mappings
      await this.cloneControlChunkMappings(appId, savedApp.id, queryRunner);

      // Clone control evaluation results
      await this.cloneControlEvaluationResults(
        appId,
        savedApp.id,
        customerId,
        queryRunner
      );

      // Clone control recommendations
      await this.cloneApplicationControlRecommendations(
        appId,
        savedApp.id,
        queryRunner
      );

      await queryRunner.commitTransaction();

      // Unlock both original and new app, and mark task as processed
      await Promise.all([
        this.appRepo.update(appId, {
          is_locked: false,
          updated_at: new Date(),
          updated_by: userId,
        }),
        this.appRepo.update(savedApp.id, {
          is_locked: false,
          updated_at: new Date(),
          updated_by: userId,
        }),
        this.asyncTaskRepo.update(taskId, {
          status: TaskStatus.PROCESSED,
          updated_at: new Date(),
        }),
      ]);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await Promise.all([
        this.appRepo.update(appId, {
          is_locked: false,
          updated_at: new Date(),
          updated_by: userId,
        }),
        this.asyncTaskRepo.update(taskId, {
          status: TaskStatus.FAILED,
          updated_at: new Date(),
        }),
      ]);
      this.logger.error("Error in processApplicationClone:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Helper: Clone a source and its file
  private async cloneSource(
    source: SourceV1,
    savedApp: App,
    customerId: string,
    userId: string,
    queryRunner: any
  ): Promise<SourceV1> {
    const { id, current_version, file_bucket_key, ...sourceData } = source;
    const newSource = this.sourceRepo.create({
      ...sourceData,
      id: undefined,
      app_id: savedApp.id,
      customer_id: customerId,
      current_version: null,
      file_bucket_key: null,
      is_deleted: false,
      is_active: true,
      is_available: false,
      uuid: uuidv4(),
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const savedSource = await queryRunner.manager.save(SourceV1, newSource);

    // Copy file if exists
    if (source.file_bucket_key) {
      const newSourceVersion: SourceVersion = await this.copySourceFile(
        source,
        savedSource,
        customerId,
        savedApp.id,
        userId,
        queryRunner
      );
      savedSource.file_bucket_key = newSourceVersion.file_bucket_key;
      savedSource.is_available = true;
      savedSource.current_version = newSourceVersion.id;
      await queryRunner.manager.save(SourceV1, savedSource);
    }

    return savedSource;
  }

  // Helper: Copy a source file in S3 and create a new version
  private async copySourceFile(
    originalSource: SourceV1,
    newSource: SourceV1,
    customerId: string,
    newAppId: number,
    userId: string,
    queryRunner: any
  ): Promise<SourceVersion> {
    const s3Client = this.s3Service.getS3();
    const bucketName = process.env.S3_FILES_BUCKET;
    if (!bucketName)
      throw new Error("S3_FILES_BUCKET environment variable is not set");

    const newFileKey = `${customerId}/${newAppId}/${FileType.SOURCE_DOCUMENTS}/${newSource.uuid}_1_${newSource.name}`;

    let savedSourceVersion: SourceVersion;

    try {
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${originalSource.file_bucket_key}`,
          Key: newFileKey,
        })
      );

      const originalSourceVersion = await this.sourceVersionRepo.findOne({
        where: { id: originalSource.current_version },
      });
      let newTextVersionFileKey = null;
      if (originalSourceVersion && originalSourceVersion.is_text_available) {
        const s3TextVersionKey = originalSourceVersion.text_s3_path;
        newTextVersionFileKey = `${customerId}/${newAppId}/${FileType.SOURCE_TEXT}/${newSource.uuid}_${1}_${newSource.name}`;

        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${originalSourceVersion.text_s3_path}`,
            Key: newTextVersionFileKey,
          })
        );
      }

      const newSourceVersion = this.sourceVersionRepo.create({
        source_id: newSource.id,
        file_bucket_key: newFileKey,
        text_s3_path: originalSourceVersion?.is_text_available
          ? newTextVersionFileKey
          : null,
        text_version: 1,
        is_text_available: false,
      });
      savedSourceVersion = await queryRunner.manager.save(
        SourceVersion,
        newSourceVersion
      );

      newSource.current_version = savedSourceVersion.id;
      newSource.file_bucket_key = newFileKey;
      await queryRunner.manager.save(SourceV1, newSource);
    } catch (error) {
      this.logger.error("Error copying S3 file:", error);
      throw new Error(`Failed to copy S3 file: ${error.message}`);
    }

    return savedSourceVersion;
  }

  // Helper: Clone all chunk mappings for a source
  private async cloneSourceChunkMappings(
    originalSourceId: number,
    newSourceId: number,
    newAppId: number,
    customerId: string,
    queryRunner: any
  ): Promise<void> {
    const sourceChunkMappings = await this.sourceChunkMappingRepo.find({
      where: { source_id: originalSourceId },
    });
    if (!sourceChunkMappings.length) return;

    const newMappings = sourceChunkMappings.map((mapping) => {
      const { id, created_at, updated_at, chunk_emb, ...rest } = mapping;
      return this.sourceChunkMappingRepo.create({
        ...rest,
        id: undefined,
        source_id: newSourceId,
        app_id: null,
        customer_id: customerId,
        chunk_emb: chunk_emb ? JSON.parse(chunk_emb) : null,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
    await queryRunner.manager.save(SourceChunkMapping, newMappings);
  }

  private async cloneApplicationControlRecommendations(
    originalAppId: number,
    newAppId: number,
    queryRunner: any
  ): Promise<void> {
    const recommendations = await queryRunner.manager.find(
      ApplicationControlRecommendation,
      {
        where: { application_id: originalAppId },
      }
    );

    if (!recommendations.length) {
      this.logger.info("No control recommendations found to clone");
      return;
    }

    const newRecommendations = recommendations.map((recommendation) => {
      const { id, created_at, updated_at, ...rest } = recommendation;
      return {
        ...rest,
        id: undefined,
        application_id: newAppId,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await queryRunner.manager.save(
      ApplicationControlRecommendation,
      newRecommendations
    );
    this.logger.info(
      `Successfully cloned ${newRecommendations.length} control recommendations`
    );
  }

  private async cloneControlEvaluationResults(
    originalAppId: number,
    newAppId: number,
    customerId: string,
    queryRunner: any
  ): Promise<void> {
    const evaluations = await queryRunner.manager.find(
      ControlEvaluationResult,
      {
        where: { app_id: originalAppId },
      }
    );

    if (!evaluations.length) {
      this.logger.info("No control evaluation results found to clone");
      return;
    }

    const newEvaluations = evaluations.map((evaluation) => {
      const { id, created_at, updated_at, ...rest } = evaluation;
      return {
        ...rest,
        id: undefined,
        app_id: newAppId,
        customer_id: customerId,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    await queryRunner.manager.save(ControlEvaluationResult, newEvaluations);
    this.logger.info(
      `Successfully cloned ${newEvaluations.length} control evaluation results`
    );
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
