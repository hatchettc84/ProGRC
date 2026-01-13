import { UserData } from "src/common/interfaces";
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SqsMessageHandler, SqsService } from "@ssut/nestjs-sqs";
import { UploadService } from "src/app/fileUpload.service";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { SourceAsset } from "src/entities/source/applicationSourceType.entity";
import { Asset } from "src/entities/source/assets.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { User } from "src/entities/user.entity";
import { Readable } from "stream";
import { DataSource, In, IsNull, Repository } from "typeorm";
import * as metadata from "../common/metadata";
import { CreateDummyAssetService } from "./createDummyAsset.service";
import { LlmDocumentProcessorService } from "./llmDocumentProcessor.service";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { LoggerService } from "src/logger/logger.service";
import { Control } from "src/entities/compliance/control.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import {
  SourceFileUpdateRequest,
  SourceFileUpdateResponse,
} from "./source.dto";
import { AppUser } from "src/entities/appUser.entity";
import { SourcePolicyService } from "./sourcePolicy.service";
import { FileDownloadService } from "src/app/fileDownload.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { FileType } from "src/app/app.dto";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
const appSourceTypes = metadata["appSourceTypes"];

@Injectable()
export class SourcesService {
  private sourceTypesById = {};
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(App) private appsRepo: Repository<App>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(SourceVersion)
    private sourceVersionRepo: Repository<SourceVersion>,
    @InjectRepository(AsyncTask) private asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(SourceType)
    private sourceTypeRepository: Repository<SourceType>,
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(SourceAsset)
    private readonly sourceAsseteRepository: Repository<SourceAsset>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    private readonly uploadSvc: UploadService,
    private readonly sqsProducerService: SqsService,
    private readonly dataSource: DataSource,
    private readonly createDummyAsset: CreateDummyAssetService,
    private readonly llmDocumentProcessor: LlmDocumentProcessorService,
    private readonly sqsClient: SQSClient,
    private readonly fileDownloadService: FileDownloadService,
    private readonly s3Service: AwsS3ConfigService,
    @InjectRepository(SourceV1)
    private readonly sourceRepov1: Repository<SourceV1>,
    @InjectRepository(ControlChunkMapping)
    private readonly controlChunkMappingRepo: Repository<ControlChunkMapping>,
    @InjectRepository(SourceChunkMapping)
    private readonly sourceChunkMappingRepo: Repository<SourceChunkMapping>,
    private readonly logger: LoggerService,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @InjectRepository(StandardControlMapping)
    private readonly standardControlMappingRepo: Repository<StandardControlMapping>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
    private readonly sourcePolicyService: SourcePolicyService,
    @InjectRepository(ApplicationConnection)
    private readonly connectionsRepo: Repository<ApplicationConnection>
  ) {
    Object.keys(appSourceTypes).forEach((key) => {
      this.sourceTypesById[appSourceTypes[key] + ""] = key;
    });
  }

  async createSourceType(data: any, userInfo: any): Promise<SourceType> {
    const userId = userInfo["userId"];

    let { name, templateSchema, subType } = data;

    if (!name) {
      throw new ForbiddenException({
        error: "Please provide source name.",
        message: "Please provide source name.",
      });
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User!`,
      });
    }
    const sourceType = await this.sourceTypeRepository.findOne({
      where: { name: data.name },
    });
    if (sourceType) {
      throw new ForbiddenException({
        error: `Source type Already exist!`,
        message: `Source type Already exist!`,
      });
    }

    const newSourceType = this.sourceTypeRepository.create({
      name: data.name,
      created_at: new Date(),
      template_schema: templateSchema,
    });
    return await this.sourceTypeRepository.save(newSourceType);
  }

  async getAllSourceTypes(userInfo: any, appId: any): Promise<SourceType[]> {
    const result: SourceType[] = await this.sourceTypeRepository.find();

    if (appId) {
      const totals: SourceAsset[] = await this.sourceAsseteRepository.find({
        where: {
          app_id: appId,
          customer_id: userInfo["tenant_id"],
        },
      });

      const totalsSourceTypeIdMap: Record<
        string,
        { source_count: number; asset_count: number }
      > = {};

      totals.forEach((t) => {
        if (!totalsSourceTypeIdMap[t.source_type]) {
          totalsSourceTypeIdMap[t.source_type] = {
            source_count: 0,
            asset_count: 0,
          };
        }
        totalsSourceTypeIdMap[t.source_type].source_count +=
          t.source_count || 0;
        totalsSourceTypeIdMap[t.source_type].asset_count += t.assets_count || 0;
      });

      // Enrich the source types with source_count and asset_count
      result.forEach((element) => {
        if (totalsSourceTypeIdMap[element.id]) {
          element.source_count = totalsSourceTypeIdMap[element.id].source_count;
          element.assets_count = totalsSourceTypeIdMap[element.id].asset_count;
        } else {
          element.source_count = 0;
          element.assets_count = 0;
        }
      });
    }
    return result;
  }

  async getSourceTypeById(id: number, userInfo: any): Promise<SourceType> {
    const sourceType = await this.sourceTypeRepository.findOne({
      where: { id },
    });
    if (!sourceType) {
      throw new ForbiddenException({
        error: "SourceType with id ${id} not found",
        message: "SourceType with id ${id} not found",
      });
    }
    return sourceType;
  }

  async getSourceTypeByName(name: string, userInfo: any): Promise<SourceType> {
    const sourceType = await this.sourceTypeRepository.findOne({
      where: { name },
    });
    if (!sourceType) {
      throw new ForbiddenException({
        error: "SourceType with id ${id} not found",
        message: "SourceType with id ${id} not found",
      });
    }
    return sourceType;
  }

  async updateSourceType(
    id: number,
    userInfo: any,
    data: any
  ): Promise<SourceType> {
    const userId = userInfo["userId"];
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User!`,
      });
    }
    const sourceType = await this.getSourceTypeById(id, userInfo); // Ensure the entity exists

    sourceType.name = data.name;
    sourceType.updated_at = new Date();

    return await this.sourceTypeRepository.save(sourceType);
  }

  async deleteSourceType(id: string, userInfo: any): Promise<void> {
    const userId = userInfo["userId"];
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User!`,
      });
    }
    const result = await this.sourceTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new ForbiddenException({
        error: "SourceType with id ${id} not found",
        message: "SourceType with id ${id} not found",
      });
    }
  }

  async uploadSourceToS3(req: any, files: Array<Express.Multer.File>) {
    const userInfo = req["user_data"];
    const orgId = userInfo["tenant_id"];
    const userId = userInfo["userId"];
    const count = await this.customerRepo.findOne({ where: { id: orgId } });

    if (!count || !userInfo["userId"]) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User or organization!`,
      });
    }

    if (!req.body || !files || !files.length) {
      throw new BadRequestException({
        message: `No files or template info provided!`,
      });
    }

    const { files_info } = req.body;
    if (!files_info) {
      throw new BadRequestException({
        message: `Please send files_info in json array.`,
      });
    }

    let parsedFilesInfo, response;
    try {
      parsedFilesInfo = JSON.parse(files_info);
      if (!Array.isArray(parsedFilesInfo))
        throw new Error("Invalid files_info array");

      if (files.length !== parsedFilesInfo.length) {
        throw new Error(`Mismatch between files and files_info count.`);
      }
      const { file_name, file_type, app_id, source_type } = parsedFilesInfo[0];

      const app = await this.appsRepo.findOneBy({
        id: app_id,
        deleted_at: IsNull(),
      });

      if (!app) {
        throw new ForbiddenException({
          error: `Invalid App Id!`,
          message: `Invalid App Id!`,
        });
      }
      const uploadResults = await this.uploadSvc.uploadFiles(
        files,
        parsedFilesInfo,
        {
          tenant_id: userInfo.tenant_id || -1,
        }
      );

      return uploadResults;
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async getSourceDetails(
    data: any,
    userInfo: any,
    appId: number
  ): Promise<any[]> {
    const orgId = userInfo["tenant_id"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    const source_assets = await this.sourceAsseteRepository.find({
      where: {
        customer_id: orgId,
        app_id: appId,
      },
    });

    if (!source_assets || source_assets.length === 0) {
      return [];
    }

    const sourceTypeIds = source_assets.map((asset) => asset.source_type);

    const sourceTypes =
      await this.sourceTypeRepository.findByIds(sourceTypeIds);

    const combinedResult = sourceTypes.map((sourceType) => {
      const matchingAsset = source_assets.find(
        (asset) => asset.source_type === sourceType.id
      );

      return {
        ...sourceType,
        source_count: matchingAsset ? matchingAsset.source_count : 0, // Example of 1st additional data
        assets_count: matchingAsset ? matchingAsset.assets_count : 0, // Example of 2nd additional data
      };
    });

    return combinedResult;
  }

  // To-Do: should be removed in future
  async downloadSourceFromS3(req: any, fileKey: string): Promise<Readable> {
    const orgId = req["tenant_id"];

    // Validate user and organization
    if (!orgId || !req["userId"]) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User or organization!`,
      });
    }

    // Validate the fileKey
    if (!fileKey) {
      throw new BadRequestException({
        message: `File key is required.`,
      });
    }

    try {
      // Fetch the file from S3
      const fileStream = await this.uploadSvc.downloadSrcFromS3(fileKey);
      if (!fileStream) {
        throw new NotFoundException({
          error: `File not found.`,
          message: `Unable to locate the file with key: ${fileKey}.`,
        });
      }
      return fileStream;
    } catch (error) {
      this.logger.error(`Error downloading file from S3:`, error.message);
      throw new BadRequestException({
        error: `Unable to download the file.`,
        message: `Something went wrong while downloading the file. Please try again.`,
      });
    }
  }

  // To-Do: should be removed in future
  async addSourceDetails_v1(file: any, data: any, userData: UserData) {
    const orgId = userData["customerId"];
    const userId = userData["userId"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException({
        error: `Invalid User!`,
        message: `Invalid User!`,
      });
    }
    let { name, sourceDetails, sourceTypeId, appId, fileBucketKey } = data;
    const srcTypeId = await this.sourceTypeRepository.findOneBy({
      id: sourceTypeId,
    });

    if (!srcTypeId) {
      throw new BadRequestException({
        error: `Invalid source_type_id provided.`,
        message: `Invalid source_type_id provided.`,
      });
    }

    //     if(sourceDetails.)
  }

  async substringAfterSecondOccurrence(input, char) {
    // Find the first occurrence of the character
    const splits = input.split(char);
    if (splits.length < 2) {
      return input;
    }
    return splits.slice(2).join(char);
  }

  // To-Do: should be removed in future
  async addSourceDetails_v2(data: any, userInfo: any) {
    const orgId = userInfo["customerId"];

    const count = await this.customerRepo.count({
      where: { id: orgId },
    });

    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    let {
      name,
      sourceDetails,
      sourceTypeId,
      appId,
      fileBucketKey,
      tags,
      controlIds,
    } = data;
    let controlData = [];
    if (controlIds && controlIds.length > 0) {
      controlData = await this.controlRepo.find({
        where: { id: In(controlIds) },
      });
    }

    const controlMappings = controlData.map((control) => control.control_name);

    const srcTypeData = await this.sourceTypeRepository.findOneBy({
      name: sourceTypeId,
    });
    this.logger.info("sourceDetails", sourceDetails);

    const splitedFileNameArray = fileBucketKey.split("/");

    name = splitedFileNameArray[splitedFileNameArray.length - 1];
    name = await this.substringAfterSecondOccurrence(name, "_");

    if (!name) {
      throw new BadRequestException({
        error: `Source name not provided.`,
        message: `Source name not provided.`,
      });
    }

    if (!fileBucketKey) {
      throw new BadRequestException({
        error: `Please upload config file.`,
        message: `Please upload config file.`,
      });
    }

    const app = await this.appsRepo.findOneBy({
      id: appId,
      deleted_at: IsNull(),
    });

    if (!sourceDetails) {
      // throw new ForbiddenException({
      //     error: 'Please provide source details.',
      //     message: 'Please provide source details.',
      // });
      sourceDetails = {};
    }

    if (!app) {
      throw new ForbiddenException({
        error: "Please provide valid appId.",
        message: "Please provide valid appId.",
      });
    }

    // await this.sourcePolicyService.canUploadSource(userInfo, appId);

    this.logger.info("sourceDetails", sourceDetails);

    const newSource = this.sourceRepov1.create({
      name: name,
      customer_id: orgId,
      source_type: srcTypeData.id,
      data: sourceDetails,
      created_at: new Date(),
      created_by: userInfo["userId"],
      updated_by: userInfo["userId"],
      updated_at: new Date(),
      app_id: appId,
      tags: tags,
      control_mapping: controlIds,
    });
    const savedSource = await this.sourceRepov1.save(newSource);

    const newSourceVersion = this.sourceVersionRepo.create({
      source_id: savedSource.id, // Reference the newly created source ID
      file_bucket_key: fileBucketKey, // Use the provided file_bucket_key
      created_at: new Date(),
    });

    const savedSourceVersion =
      await this.sourceVersionRepo.save(newSourceVersion);

    // Now, update the source with the new version details
    const srcUpdate = await this.getSourceById_v2(savedSource.id, userInfo);
    srcUpdate.updated_at = new Date();
    srcUpdate.current_version = savedSourceVersion.id; // Link the current version ID
    this.sourceRepov1.save(srcUpdate);

    const whereClause: any = {
      customer_id: orgId, // Use customer_id from your schema
      source_type: srcTypeData.id,
    };

    if (appId) {
      whereClause.app_id = appId;
    }

    // Increment the source_count if the record exists
    const updateResult = await this.sourceAsseteRepository
      .createQueryBuilder()
      .update(SourceAsset)
      .set({
        source_count: () => "source_count + 1", // Increment the source_count
        updated_at: new Date(), // Update the updated_at timestamp
      })
      .where(whereClause)
      .returning("*") // Returns the updated row(s)
      .execute();

    // Check if no record was updated
    if (updateResult.affected === 0) {
      // If no record was updated, insert a new record
      const newSourceAsset = this.sourceAsseteRepository.create({
        customer_id: orgId,
        source_type: srcTypeData.id,
        app_id: appId || null, // Optional
        source_count: 1, // Initialize count for new entry
        assets_count: 0, // Initialize assets_count
        created_at: new Date(),
        updated_at: new Date(),
      });

      await this.sourceAsseteRepository.save(newSourceAsset);
    }

    const sourceId = savedSource.id;
    const sourceVersionId = savedSourceVersion.id;
    const previousVersionId = savedSourceVersion.id; // find priouse version first
    const currentVersionFileLocation = fileBucketKey;
    const previousVersionFileLocation = fileBucketKey;
    const srctypeId = srcTypeData.id;

    const assetsData = {
      name,
      appId,
      sourceId,
      sourceVersionId,
      previousVersionId,
      currentVersionFileLocation,
      previousVersionFileLocation,
      srctypeId,
      tags: controlMappings,
    };

    const processResponse = await this.processSource_v1(assetsData, userInfo);

    if (process.env.POPULATE_ASSET_DUMMY_DATA === "true") {
      // Use LLM document processing instead of dummy data
      try {
        await this.llmDocumentProcessor.processDocument(
          appId,
          sourceId,
          orgId,
          srcTypeData.id
        );
        this.logger.log(`LLM document processing completed for source ${sourceId}`);
      } catch (error) {
        this.logger.error(`LLM document processing failed for source ${sourceId}, falling back to dummy data:`, error);
        // Fallback to dummy data if LLM processing fails
        await this.createDummyAsset.createDummyAsse_v2(
          appId,
          srcTypeData.id,
          orgId,
          sourceId
        );
      }
    }

    return processResponse;
  }

  private async processSource_v1(req: any, userInfo: any): Promise<any> {
    this.logger.info("processSource_v1", req);
    const orgId = userInfo?.["customerId"];
    const userId = userInfo?.["userId"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    // Extract data from request
    const customer_id = orgId;
    const msg_entity_type = req.Ops || TaskOps.CREATE_ASSETS;
    const sourceId = req.sourceId;
    const sourceVersionId = req.sourceVersionId;
    const previousVersionId = req.previousVersionId;
    const currentVersionFileLocation = req.currentVersionFileLocation;
    const previousVersionFileLocation = req.previousVersionFileLocation;
    const s3_file_key = req.text_s3_path
      ? req.text_s3_path.includes(".")
        ? req.text_s3_path.substring(0, req.text_s3_path.lastIndexOf("."))
        : req.text_s3_path
      : req.text_s3_path;
    const appId = req.appId;
    const sourceTypeId = req.srctypeId;
    const name = req.name;
    const tags = req.tags || [];

    if (!sourceId || !sourceVersionId || !currentVersionFileLocation) {
      throw new BadRequestException("Missing required fields.");
    }

    const standard_ids = await this.appStandardRepo.find({
      where: { app_id: appId },
    });

    const appStds = standard_ids.map((std) => std.standard_id);

    const message = {
      taskId: null,
      standard_ids: appStds,
      appId,
      customer_id,
      msg_entity_type,
      sourceId,
      sourceVersionId,
      previousVersionId: previousVersionId || null,
      currentVersionFileLocation,
      previousVersionFileLocation: previousVersionFileLocation || null,
      sourceTypeId,
      name,
      s3_file_key,
      tags: tags,
    };

    // Prepare async task data
    const task = this.asyncTaskRepo.create({
      ops: TaskOps.CREATE_ASSETS, // Set enum based on entity_type
      status: TaskStatus.PENDING, // Set status to 'PENDING'
      request_payload: message,
      customer_id: orgId,
      created_by: userId,
      app_id: appId,
      entity_id: sourceId,
      entity_type: this.sourceRepov1.metadata.tableName,
    });

    // Save async task entry in the database
    const createdTask = await this.asyncTaskRepo.save(task);

    message.taskId = createdTask.id;

    const result = await this.appStandardRepo.update(
      { app_id: appId },
      {
        have_pending_compliance: true,
        updated_at: new Date(),
        source_updated_at: new Date(),
      }
    );

    // Note: When POPULATE_ASSET_DUMMY_DATA is true, processing happens in the calling method
    // This method just creates the task and returns. The caller will process it.
    if (process.env.POPULATE_ASSET_DUMMY_DATA === "true") {
      return {
        message: "Task created successfully. Processing will happen immediately.",
        taskId: createdTask.id,
      };
    }

    this.logger.info("SQS message sent successfully.", message);
    await this.sendToQueue(process.env.DS_QUEUE_NAME, {
      id: createdTask.id.toString(),
      body: { type: "artifacts", payload: message },
    }, 'artifact ingestion');

    return {
      message: "SQS message sent successfully.",
      taskId: createdTask.id,
    };
  }

  async handleSourceMessage(message: any) {
    let canDelete: boolean = true;
    try {
      this.logger.log("Received SQS message for source creation:", message);
      const body = message.Body ? JSON.parse(message.Body) : {};
      await this.processMessage(body);
    } catch (error) {
      canDelete = false;
      this.logger.error("Error processing SQS message:", error);
    } finally {
      if (canDelete) {
        await this.deleteSourceMessage(message);
      }
    }
  }

  async processMessage(body: any) {
    // Extract taskId and status
    const taskId = body.taskId ?? null;
    const status = body.status ?? null;
    const responsePayload = body.response ?? {};
    const payload = responsePayload.payload;
    const source_id = payload?.sourceId ?? null;
    const app_id = payload?.appId ?? null;
    const org_id = payload?.customerId ?? null;

    // Log extracted fields to verify

    if (!app_id) {
      this.logger.error("App id not found in mesage body");
      return;
    }
    this.logger.log("Received SQS message source v2:", {
      taskId,
      status,
      responsePayload,
    });

    // Find the AsyncTask by taskId (id)
    const asyncTask = await this.asyncTaskRepo.findOne({
      where: { id: taskId },
    });

    if (!asyncTask) {
      this.logger.error(`AsyncTask with id ${taskId} not found`);
      return;
    }

    if (
      asyncTask.status === TaskStatus.PROCESSED ||
      asyncTask.status === TaskStatus.FAILED ||
      asyncTask.status === TaskStatus.CANCELLED
    ) {
      this.logger.warn("Task already processed, skipping");
      return;
    }

    if (status === "in_progress" && asyncTask.status === TaskStatus.PENDING) {
      asyncTask.status = TaskStatus.IN_PROCESS;
      asyncTask.updated_at = new Date();
      this.logger.log(
        `AsyncTask ${taskId} updated with status ${asyncTask.status}`
      );
    }

    // Update the task status and response_payload based on the status in the message
    if (status === "success" && asyncTask.status === TaskStatus.IN_PROCESS) {
      asyncTask.status = TaskStatus.PROCESSED;
      asyncTask.updated_at = new Date();

      const source_data = await this.sourceRepov1.findOne({
        where: { id: source_id },
        relations: ["current_version_entity"],
      });
      this.logger.log(`source_data for task_id - ${taskId}`, source_data);
      if (source_data.current_version) {
        const source_version = await this.sourceVersionRepo.findOne({
          where: { id: source_data.current_version },
        });
        if (source_version) {
          source_version.is_text_available = true;
          source_version.text_updated_at = new Date();
          await this.sourceVersionRepo.save(source_version);
        }
        this.logger.log(
          `source_version for task_id - ${taskId} updated is_text_available to true`,
          source_version
        );
      } else {
        this.logger.error(
          `source_version for task_id - ${taskId} not found`,
          source_data.current_version_entity
        );
      }

      const sourceTypeId = asyncTask.request_payload?.sourceTypeId ?? null;
      const whereClause: any = {
        customer_id: org_id,
        source_type: sourceTypeId,
      };

      if (app_id) {
        whereClause.app_id = app_id;
      }

      const assetsCount = await this.assetRepo.count({
        where: {
          app_id: app_id,
          source_type_id: sourceTypeId,
          customer_id: org_id,
        },
      });

      const updateResult = await this.sourceAsseteRepository
        .createQueryBuilder()
        .update(SourceAsset)
        .set({
          assets_count: assetsCount,
          updated_at: () => "NOW()",
        })
        .where(whereClause)
        .returning("*")
        .execute();

      await this.appStandardRepo.update(
        { app_id: app_id },
        { have_pending_compliance: true, updated_at: new Date() }
      );

      if (
        source_data &&
        source_data.control_mapping &&
        source_data.control_mapping.length > 0
      ) {
        const sourceChunkMapping = await this.sourceChunkMappingRepo.find({
          where: { source_id: source_id },
        });
        if (sourceChunkMapping && sourceChunkMapping.length > 0) {
          await this.controlChunkMappingRepo.update(
            {
              chunk_id: In(sourceChunkMapping.map((chunk) => chunk.chunk_id)),
              app_id: source_data.app_id,
              control_id: In(source_data.control_mapping),
            },
            { is_tagged: true }
          );
        }
      }
    } else if (status === "failed") {
      asyncTask.status = TaskStatus.FAILED;
      asyncTask.updated_at = new Date();
    }

    // Save the updated AsyncTask
    await this.asyncTaskRepo.save(asyncTask);
    return;
  }

  private async deleteSourceMessage(message: any) {
    const deleteParams = {
      QueueUrl: process.env.SQS_ARTIFACT_OUTPUT_QUEUE,

      ReceiptHandle: message.ReceiptHandle,
    };
    await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
  }

  async getSourceById_v2(id: number, userInfo: any): Promise<SourceV1> {
    const orgId = userInfo["customerId"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }
    this.logger.info("source_id", id);
    const source = await this.sourceRepov1.findOneBy({
      id,
      is_active: true,
      is_available: true,
    });
    if (!source) {
      throw new ForbiddenException({
        error: "Please provide valid source_v2 .",
        message: "Please provide valid source_v2 ",
      });
    }
    return source;
  }

  async getSourceV2ById(id: number, userInfo: any): Promise<SourceV1> {
    const orgId = userInfo["tenant_id"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }
    const source = await this.sourceRepov1.findOneBy({
      id,
      is_deleted: false,
      is_available: true,
    });
    if (!source) {
      throw new ForbiddenException({
        error: "Please provide valid source .",
        message: "Please provide valid source ",
      });
    }
    return source;
  }

  async getAllSourcesV2(
    userInfo: any,
    appId: number,
    name: string,
    limit: number,
    offset: number
  ): Promise<
    [
      {
        name: string;
        id: number;
        customer_id: string;
        source_type: string;
        current_version: number;
        app_id: number;
        data: any;
        created_at: Date;
        updated_at: Date;
        source_type_name: string;
        file_bucket_key: string | null;
        tags: string[];
        control_mapping: any;
        text_s3_path: string | null;
        is_text_available: boolean;
        text_version: number;
        text_config: string | null;
        text_created_at: Date | null;
        text_updated_at: Date | null;
      }[],
      number,
    ]
  > {
    const orgId = userInfo["customerId"];
    const count = await this.customerRepo.count({
      where: { id: orgId },
    });
    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    let srcType = null;
    if (name) {
      srcType = await this.sourceTypeRepository.findOne({ where: { name } });

      // If the source type name is provided but doesn't exist, return an empty array
      if (!srcType) {
        return [[], 0];
      }
    }

    // Fetch sources and join with source_types to get the source_type name
    const queryBuilder = this.sourceRepov1
      .createQueryBuilder("source")
      .leftJoinAndSelect("source.type_source", "sourceType")
      .leftJoinAndSelect(
        "source.current_version_entity",
        "currentVersionEntity"
      )
      .select([
        "source.name",
        "source.id",
        "source.customer_id",
        "source.source_type",
        "source.current_version",
        "source.app_id",
        "source.data",
        "source.created_at",
        "source.updated_at",
        "source.name",
        "sourceType.name",
        "source.tags",
        "source.control_mapping",
        "currentVersionEntity.text_s3_path",
        "currentVersionEntity.is_text_available",
        "currentVersionEntity.text_version",
        "currentVersionEntity.text_config",
        "currentVersionEntity.text_created_at",
        "currentVersionEntity.text_updated_at",
      ]);

    if (appId) {
      queryBuilder.andWhere("source.app_id = :appId", { appId });
    }

    if (srcType) {
      queryBuilder.andWhere("source.source_type = :sourceTypeId", {
        sourceTypeId: srcType.id,
      });
    }

    queryBuilder.andWhere("source.is_deleted = false");
    queryBuilder.andWhere("source.is_available = true");

    const [sources, totalCount] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const sourcesWithS3Url = await Promise.all(
      sources.map(async (source) => {
        // const sourceVersion = await this.sourceVersionRepo.findOne({
        //     where: { source_id: source.id },
        //     order: { created_at: 'DESC' },
        // });

        const cIds = source.control_mapping;
        let control_mapping = [];
        if (cIds && cIds.length > 0) {
          const controlDetails = await this.controlRepo.find({
            select: ["id", "control_name", "control_long_name"],
            where: { id: In(source.control_mapping) },
          });

          control_mapping = controlDetails.map((control) => ({
            id: control.id,
            short_name: control.control_name,
            long_name: control.control_long_name,
          }));
        }

        this.logger.info("sourceType name", source.source_type);
        return {
          ...source,
          control_mapping,
          source_type_name: source.type_source ? source.type_source.name : null,
          // file_bucket_key: sourceVersion ? sourceVersion.file_bucket_key : null,
          source_type: source.source_type.toString(), // Convert source_type to string
          text_s3_path: source.current_version_entity
            ? source.current_version_entity.text_s3_path
            : null,
          is_text_available: source.current_version_entity
            ? source.current_version_entity.is_text_available
            : null,
          text_version: source.current_version_entity
            ? source.current_version_entity.text_version
            : null,
          text_config: source.current_version_entity
            ? source.current_version_entity.text_config
            : null,
          text_created_at: source.current_version_entity
            ? source.current_version_entity.text_created_at
            : null,
          text_updated_at: source.current_version_entity
            ? source.current_version_entity.text_updated_at
            : null,
        };
      })
    );

    return [sourcesWithS3Url, totalCount];
  }

  async deleteSourceV2(
    userInfo: any,
    appId: number,
    sourceId: number
  ): Promise<any> {
    const orgId = userInfo["customerId"];
    const count = await this.customerRepo.count({ where: { id: orgId } });

    if (!count) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    // await this.sourcePolicyService.canDeleteSource(userInfo, appId);

    let sourceDetails;
    try {
      sourceDetails = await this.sourceRepov1.findOneOrFail({
        where: { id: sourceId, is_deleted: false, is_available: true },
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
      let deletedAssetsCount = 0;
      let deletedChunksCount = 0;
      let deletedControlChunksCount = 0;

      const chunkIds = await this.sourceChunkMappingRepo.find({
        where: { source_id: sourceDetails.id },
      });

      const deletedControlChunks = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(ControlChunkMapping)
        .where("app_id = :appId AND chunk_id IN (:...chunkIds)", {
          appId,
          chunkIds,
        })
        .execute();

      deletedControlChunksCount += deletedControlChunks.affected || 0;

      const deletedChunks = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(SourceChunkMapping)
        .where("source_id = :sourceId", { sourceId: sourceDetails.id })
        .execute();

      deletedChunksCount = deletedChunks.affected || 0;

      const deletedAssets = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Asset)
        .where("source_id = :sourceId", { sourceId: sourceDetails.id })
        .execute();

      deletedAssetsCount += deletedAssets.affected || 0;

      const srcVersion = await this.sourceVersionRepo.findOne({
        where: { source_id: sourceDetails.id },
        order: { created_at: "DESC" },
      });

      const fileKey = sourceDetails.file_bucket_key;
      if (fileKey) {
        const s3Client = this.s3Service.getS3();
        const deleteCommand = this.s3Service.deleteObjectCommand(fileKey);
        await s3Client.send(deleteCommand);
      }
      const deletedSrcVersion = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(SourceVersion)
        .where("source_id = :sourceId", { sourceId: sourceDetails.id })
        .execute();

      const deletedSource = await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(SourceV1)
        .where("id = :sourceId", { sourceId: sourceDetails.id })
        .execute();

      const whereClause: any = {
        customer_id: orgId,
        source_type: sourceDetails.source_type,
      };

      if (appId) {
        whereClause.app_id = appId;
      }

      const updateResult = await queryRunner.manager
        .getRepository(SourceAsset)
        .createQueryBuilder()
        .update(SourceAsset)
        .set({
          source_count: () =>
            `CASE WHEN source_count > 0 THEN source_count - 1 ELSE 0 END`,
          assets_count: () =>
            `GREATEST(assets_count - ${deletedAssetsCount}, 0)`,
          updated_at: new Date(),
        })
        .where(whereClause)
        .returning("*")
        .execute();

      const appStandard = await this.appStandardRepo.findOne({
        where: { app_id: appId },
      });

      if (appStandard) {
        await queryRunner.manager
          .getRepository(AppStandard)
          .createQueryBuilder()
          .update(AppStandard)
          .set({
            have_pending_compliance: true,
            updated_at: new Date(),
            source_updated_at: new Date(),
          })
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

  async updateSourceDetails(
    data: any,
    userInfo: any,
    srcId: number,
    isRetriggered: boolean
  ) {
    const orgId = userInfo["customerId"];
    const { appId } = data;
    const app = await this.appsRepo.findOneBy({
      id: appId,
      deleted_at: IsNull(),
    });
    if (!app) {
      throw new NotFoundException({
        error: `App with id ${appId} not found`,
        message: `App with id ${appId} not found`,
      });
    }
    if (app && app.customer_id !== userInfo["customerId"]) {
      throw new ForbiddenException({
        error: `User not authorized to update source files for app ${appId}`,
        message: `User not authorized to update source files for app ${appId}`,
      });
    }

    // Fetch the existing source
    const source = await this.sourceRepov1.findOne({
      where: { id: srcId, is_deleted: false, is_available: true },
      relations: ["source_versions"],
    });
    if (!source) {
      throw new NotFoundException(`Source with ID ${srcId} not found.`);
    }

    let {
      name,
      sourceTypeId = source.source_type,
      fileBucketKey = source.file_bucket_key,
      tags,
      controlIds,
    } = data;

    // Extract fields from input data
    let controlData = [];
    if (controlIds && controlIds.length > 0) {
      controlData = await this.controlRepo.find({
        where: { id: In(controlIds) },
      });
    }

    const controlMappings = controlData.map((control) => control.control_name);

    const source_text_path = await this.createTextPath(
      userInfo["customerId"],
      appId,
      source
    );
    // get latest source version by finding the max text_version, text_version is nullable
    const latestSourceVersion =
      source.source_versions && source.source_versions.length > 0
        ? source.source_versions.sort(
            (a, b) => (b.text_version || 0) - (a.text_version || 0)
          )[0]
        : null;
    const newSourceVersion = this.sourceVersionRepo.create({
      source_id: source.id,
      file_bucket_key: fileBucketKey,
      created_at: new Date(),
      text_s3_path: source_text_path,
      is_text_available: false,
      text_version:
        latestSourceVersion && latestSourceVersion.text_version
          ? latestSourceVersion.text_version + 1
          : 1,
      text_created_at: new Date(),
      text_updated_at: new Date(),
    });

    await this.sourceVersionRepo.save(newSourceVersion);

    source.tags = tags;
    source.control_mapping = controlIds;
    source.updated_by = userInfo["userId"];
    source.current_version = newSourceVersion.id;
    source.source_versions = [...source.source_versions, newSourceVersion];

    await this.sourceRepov1.save(source);

    const assetsData = {
      name: source.name,
      appId,
      sourceId: source.id,
      sourceVersionId: newSourceVersion.id,
      previousVersionId: newSourceVersion.id,
      currentVersionFileLocation: fileBucketKey,
      previousVersionFileLocation: fileBucketKey,
      srctypeId: sourceTypeId,
      tags: controlMappings,
      Ops: TaskOps.UPDATE_SOURCE,
      text_s3_path: source_text_path,
    };

    if (isRetriggered === true) {
      await this.deleteExistingChunks(srcId);
      const processResponse = await this.processSource_v1(assetsData, userInfo);
      return processResponse;
    }

    return { message: "Source tags updated successfully." };
  }

  extractFilePath(url): string | null {
    // Regular expression to extract the string between "cloudfront.net/" and "?Expires"
    const regex = /cloudfront\.net\/(.*?)\?Expires/;
    const match = url.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  }

  deleteFileFromS3(fileKey: string): Promise<any> {
    return this.uploadSvc.deleteFileSingedUrl(fileKey);
  }

  async deleteExistingChunks(srcId: number) {
    const sourceChunks = await this.sourceChunkMappingRepo.find({
      where: { source_id: srcId },
    });
    if (sourceChunks.length > 0) {
      const chunkIds = sourceChunks.map((chunk) => chunk.chunk_id);
      await this.sourceChunkMappingRepo.delete({ source_id: srcId });
      await this.controlChunkMappingRepo.delete({ chunk_id: In(chunkIds) });
    }
  }

  async getTags(
    user_info: any,
    app_id: number
  ): Promise<{ id: number; short_name: string; long_name: string }[]> {
    const standard_data = await this.appStandardRepo.find({
      where: { app_id },
    });
    const standard_ids = standard_data.map((std) => std.standard_id);
    const control_ids = await this.standardControlMappingRepo.find({
      where: { standard_id: In(standard_ids) },
    });
    const controls = await this.controlRepo.find({
      select: ["id", "control_name", "control_long_name"],

      where: { id: In(control_ids.map((control) => control.control_id)) },
    });

    return controls.map((control) => ({
      id: control.id,
      short_name: control.control_name,
      long_name: control.control_long_name,
    }));
  }

  async updateSourceFiles(
    userInfo: any,
    appId: number,
    data: SourceFileUpdateRequest[],
    isInternal?: boolean,
    connectionId?: number
  ): Promise<SourceFileUpdateResponse[]> {
    if (!isInternal) {
      await this.sourcePolicyService.canUploadSource(userInfo, appId);
    }

    if (isInternal) {
      const app = await this.appsRepo.findOneBy({
        id: appId,
        deleted_at: IsNull(),
      });
      if (!app) {
        throw new NotFoundException(`App with ID ${appId} not found.`);
      }

      const user = await this.userRepo.findOneBy({
        customer_id: app.customer_id,
      });

      userInfo = {
        userId: user.id,
        customerId: app.customer_id,
      };
    }
    if (data.length === 0 || Object.keys(data[0]).length === 0) {
      throw new BadRequestException({
        error: `No files to update`,
        message: `No files to update`,
      });
    }
    let response: SourceFileUpdateResponse[] = [];
    for (const file of data) {
      const source = await this.sourceRepov1.findOneBy({
        uuid: file.uuid,
        is_available: false,
      });
      if (!source) {
        this.logger.error(`Source with uuid ${file.uuid} not found`);
        continue;
      }

      source.is_available = true;
      source.updated_at = new Date();
      let controlData = [];
      if (file.control_ids && file.control_ids.length > 0) {
        const validControls = await this.controlRepo.find({
          where: { id: In(file.control_ids), active: true },
        });
        if (validControls.length > 0) {
          source.control_mapping = validControls.map((control) => control.id);
          controlData = validControls;
        }
      }
      const controlMappings =
        controlData.map((control) => control.control_name) || [];
      if (file.tags && file.tags.length > 0) {
        source.tags = file.tags;
      }
      const source_text_path = await this.createTextPath(
        userInfo["customerId"],
        appId,
        source
      );
      const latestSourceVersion =
        source.source_versions && source.source_versions.length > 0
          ? source.source_versions.sort(
              (a, b) => (b.text_version || 0) - (a.text_version || 0)
            )[0]
          : null;
      const newSourceVersion = this.sourceVersionRepo.create({
        source_id: source.id,
        file_bucket_key: source.file_bucket_key,
        created_at: new Date(),
        text_s3_path: source_text_path,
        is_text_available: false,
        text_version:
          latestSourceVersion && latestSourceVersion.text_version
            ? latestSourceVersion.text_version + 1
            : 1,
        text_created_at: new Date(),
        text_updated_at: new Date(),
      });

      const savedSourceVersion =
        await this.sourceVersionRepo.save(newSourceVersion);

      source.current_version = savedSourceVersion.id;
      await this.sourceRepov1.save(source);
      const sourceId = source.id;
      const sourceVersionId = savedSourceVersion.id;
      const previousVersionId = savedSourceVersion.id; // find priouse version first
      const currentVersionFileLocation = source.file_bucket_key;
      const previousVersionFileLocation = source.file_bucket_key;
      const srctypeId = source.source_type;

      const assetsData = {
        name: source.name,
        appId,
        sourceId,
        sourceVersionId,
        previousVersionId, //should be change to old version
        currentVersionFileLocation,
        previousVersionFileLocation, // should loaction of previous version
        srctypeId,
        tags: controlMappings,
        text_s3_path: source_text_path,
      };

      await this.processSource_v1(assetsData, userInfo);

      response.push(new SourceFileUpdateResponse(true, file.uuid));
      if (isInternal) {
        await this.connectionsRepo.update(connectionId, {
          source_id: source.id,
        });
      }
    }
    return response;
  }

  async downloadSourceById(
    userInfo: any,
    app_id: number,
    sourceId: number
  ): Promise<{ downloadUrl: string; source_id: number; name: string }> {
    await this.sourcePolicyService.canDownloadSource(userInfo, app_id);
    const source = await this.sourceRepov1.findOneBy({
      id: sourceId,
      is_deleted: false,
      is_available: true,
    });
    if (!source) {
      throw new NotFoundException(`Source with ID ${sourceId} not found.`);
    }

    const fileKey = source.file_bucket_key;
    if (!fileKey) {
      throw new NotFoundException(
        `File not found for source with ID ${sourceId}.`
      );
    }
    const downloadUrl =
      await this.fileDownloadService.generateSignedUrl(fileKey);
    return { downloadUrl, source_id: source.id, name: source.name };
  }

  async createTextPath(customer_id: any, appId: number, source: SourceV1) {
    const splitedFileNameArray = source.file_bucket_key.split("/");

    let name = splitedFileNameArray[splitedFileNameArray.length - 1];
    name = await this.substringAfterSecondOccurrence(name, "_");
    name = name.split(".")[0] + ".txt";
    const version =
      source.current_version_entity &&
      source.current_version_entity.text_version
        ? source.current_version_entity.text_version + 1
        : 1;
    const sourceTextPath = `${customer_id}/${appId}/${FileType.SOURCE_TEXT}/${source.uuid}_${version}_${name}`;
    return sourceTextPath;
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
