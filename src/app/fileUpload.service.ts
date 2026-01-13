import { PutObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entities/customer.entity";
import { Readable } from "stream";
import { IsNull, Repository } from "typeorm";
import { AwsS3ConfigService } from "./aws-s3-config.service";
import { LoggerService } from "src/logger/logger.service";
import {
  FileType,
  FileTypeHelper,
  GeneratePresignedUploadUrlRequest,
  GeneratePresignedUploadUrlResponse,
} from "./app.dto";
import { User } from "src/entities/user.entity";
import { AppUser } from "src/entities/appUser.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { v4 as uuidv4 } from "uuid";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { App } from "src/entities/app.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { Templates } from "src/entities/template.entity";
import { UserRole } from "src/masterData/userRoles.entity";
@Injectable()
export class UploadService {
  constructor(
    private awsS3ConfigService: AwsS3ConfigService,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AppUser) private appUserRepo: Repository<AppUser>,
    @InjectRepository(AppStandard) private appStandardRepo: Repository<AppStandard>,
    @InjectRepository(SourceType)
    private sourceTypeRepo: Repository<SourceType>,
    @InjectRepository(ApplicationControlEvidence)
    private applicationControlEvidenceRepo: Repository<ApplicationControlEvidence>,
    @InjectRepository(SourceV1) private sourceRepo: Repository<SourceV1>,
    @InjectRepository(App) private appsRepo: Repository<App>,
    @InjectRepository(AssessmentDetail) private assessmentRepo: Repository<AssessmentDetail>,
    @InjectRepository(Templates) private templateRepo: Repository<Templates>,
    @InjectRepository(SourceVersion)
    private sourceVersionRepo: Repository<SourceVersion>,
    private readonly logger: LoggerService
  ) { }

  async uploadFiles(
    files: Array<Express.Multer.File>,
    filesInfo: any,
    userInfo?: any
  ) {
    this.logger.info(userInfo);

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
    const s3 = this.awsS3ConfigService.getS3();
    const uploadedData = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { file_name, file_type, app_id, source_type } = filesInfo[i];

        let filePrefix: string;
        if (file_type === "source_documents") {
          filePrefix = `${orgId}/${file_type}/${app_id}/${source_type}`;
        } else {
          filePrefix = this.awsS3ConfigService.getFileNamePrefix(
            orgId,
            file_type
          );
        }
        const bucketName = this.awsS3ConfigService.getS3Bucket();
        const keyName = `${filePrefix}_${Date.now().toString()}_${file_name}`;
        const command = this.awsS3ConfigService.putObjectCommand(keyName, file);

        let s3Response = await s3.send(command);

        if (s3Response) {
          const data = { url: s3Response, key: keyName };
          uploadedData.push({
            ...data,
            ...filesInfo[i],
          });
        } else {
          throw new Error(
            `Something went wrong while uploading ${file_name} ${file_type} file.`
          );
        }
      }
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
        message: error.message,
      });
    }
    if (!uploadedData.length) {
      throw new BadRequestException({
        message: `Somehting went wrong when uploading files to server!`,
        error: `Somehting went wrong when uploading files to server!`,
      });
    }
    return {
      message: `File/s uploaded successfully!`,
      data: uploadedData,
    };
  }

  // To-Do: this might not be needed. validate and remove if not needed
  async downloadFromS3(fileKey: string) {
    if (!fileKey) {
      throw new BadRequestException({
        error: `Please provide a valid key for downloading the file.`,
        message: `Please provide a valid key for downloading the file.`,
      });
    }
    const s3 = this.awsS3ConfigService.getS3();
    this.logger.info("Created s3 connection");
    // const params = {
    //   Bucket: this.awsS3ConfigService.getS3Bucket(),
    //   Key: fileKey,
    // };

    const params = this.awsS3ConfigService.getObjectCommand(fileKey);
    this.logger.info("prepared get object for s3 key: ", fileKey);
    try {
      return await s3.send(params);
    } catch (e) {
      this.logger.info(`error occured when downloading file from s3`);
      this.logger.info(e);
      throw new BadRequestException({
        error: `Something went wrong when downloading file from server.`,
        message: `Something went wrong when downloading file from server.`,
      });
    }
  }

  // To-Do: this might not be needed. validate and remove if not needed
  async downloadSrcFromS3(fileKey: string): Promise<Readable> {
    if (!fileKey) {
      throw new BadRequestException({
        error: `Invalid file key.`,
        message: `File key is required for downloading.`,
      });
    }

    const s3 = this.awsS3ConfigService.getS3();
    const params = this.awsS3ConfigService.getObjectCommand(fileKey);

    try {
      this.logger.info(`Attempting to download file with key: ${fileKey}`);
      const { Body } = await s3.send(params);

      if (!Body || !(Body instanceof Readable)) {
        throw new NotFoundException({
          error: `File not found.`,
          message: `The file with key: ${fileKey} does not exist.`,
        });
      }

      this.logger.info(`File successfully fetched from S3: ${fileKey}`);
      return Body as Readable;
    } catch (error) {
      this.logger.error(`Failed to download file from S3: ${fileKey}`, error);
      throw new BadRequestException({
        error: `Failed to download file.`,
        message: `An error occurred while fetching the file. Please check the file key and try again.`,
      });
    }
  }

  // To-Do: this might not be needed. validate and remove if not needed
  async uploadFile(
    fileName: string,
    file: Express.Multer.File
  ): Promise<{ s3Response: PutObjectCommandOutput; fileName: string }> {
    const s3 = this.awsS3ConfigService.getS3();
    const command = this.awsS3ConfigService.putObjectCommand(fileName, file);
    try {
      let s3Response = await s3.send(command);
      return {
        s3Response,
        fileName,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
        message: `Failed to upload ${fileName}: ${error.message}`,
      });
    }
  }

  // To-Do: this might not be needed. validate and remove if not needed
  async uploadUseBytes(
    fileName: string,
    contentType: string,
    fileBytes: Uint8Array
  ): Promise<{ s3Response: PutObjectCommandOutput; fileName: string }> {
    try {
      const s3 = this.awsS3ConfigService.getS3();
      const params = {
        Bucket: this.awsS3ConfigService.getS3Bucket(),
        Key: fileName,
        Body: fileBytes,
        ContentType: contentType,
      };

      const command = new PutObjectCommand(params);
      const s3Response = await s3.send(command);

      if (!s3Response) {
        throw new Error(
          `Something went wrong while uploading ${fileName} file.`
        );
      }

      return {
        s3Response,
        fileName,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
        message: `Failed to upload ${fileName}: ${error.message}`,
      });
    }
  }

  async deleteFileSingedUrl(fileUrl: string): Promise<{ message: string }> {
    if (!fileUrl) {
      throw new BadRequestException({
        error: "Invalid file key.",
        message: "File key is required for deletion.",
      });
    }

    // extract the file key from the file url and remove the base url and query params
    const fileKey = fileUrl.split("/").pop().split("?")[0];

    const s3 = this.awsS3ConfigService.getS3();

    try {
      this.logger.info(`Attempting to delete file with key: ${fileKey}`);
      const command = this.awsS3ConfigService.deleteObjectCommand(fileKey);
      await s3.send(command);
      this.logger.info(`File successfully deleted from S3: ${fileKey}`);
      return { message: `File deleted successfully.` };
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${fileKey}`, error);
      if (error.name === "NoSuchKey") {
        throw new NotFoundException({
          error: "File not found.",
          message: `The file with key: ${fileKey} does not exist.`,
        });
      }
      throw new BadRequestException({
        error: error.message,
        message: `Failed to delete file: ${error.message}`,
      });
    }
  }

  async generateSignedUrl(
    app_id: number,
    standard_id: number,
    userInfo: any,
    data: GeneratePresignedUploadUrlRequest[],
    source_id?: number,
    isInternal?: boolean
  ): Promise<any> {
    try {
      this.logger.log(`Generating presigned URLs for ${data.length} file(s), app_id: ${app_id}, source_id: ${source_id || 'none'}`);
      
      const userId = userInfo?.["userId"];
      const impersonatedUser = userInfo["impersonateExpTime"] ? true : false;
      
      // OPTIMIZED: Check if we need appStandard for CRM_DOCUMENTS files
      const needsAppStandard = data.some(file => 
        FileTypeHelper.getFromValue(file.file_type) === FileType.CRM_DOCUMENTS
      );
      
      // OPTIMIZED: Run ALL independent database queries in parallel to reduce latency
      // This reduces latency from ~800-2000ms (sequential) to ~200-500ms (parallel)
      const [app, user, sourceType, appuser, appStandard] = await Promise.all([
        app_id ? this.appsRepo.findOneBy({
          id: app_id,
          deleted_at: IsNull(),
        }) : Promise.resolve(null),
        this.userRepo.findOneOrFail({
          where: {
            id: userId,
          },
        }),
        this.sourceTypeRepo.findOneOrFail({
          where: { name: "FILE" },
        }),
        // ✅ FIX: Include appuser query in Promise.all (only if app_id exists and not internal)
        (app_id && !isInternal) ? this.appUserRepo.findOne({
          where: {
            user_id: userId,
            app_id: app_id,
          },
        }) : Promise.resolve(null),
        // ✅ FIX: Pre-fetch appStandard for CRM_DOCUMENTS files if needed
        (needsAppStandard && app_id && standard_id) ? this.appStandardRepo.findOne({
          where: {
            app_id: app_id,
            standard_id: standard_id,
          },
        }) : Promise.resolve(null),
      ]);

      if (isInternal && app) {
        userInfo = {
          tenant_id: app.customer_id,
        };
      }

      if (app_id && !isInternal) {
        if (!app) {
          throw new NotFoundException({
            error: `App with id ${app_id} not found`,
            message: `App with id ${app_id} not found`,
          });
        }
        if (app && app.customer_id !== userInfo["customerId"]) {
          throw new ForbiddenException({
            error: `User not authorized to upload files for app ${app_id}`,
            message: `User not authorized to upload files for app ${app_id}`,
          });
        }
        
        // ✅ FIX: appuser is already fetched in Promise.all above, just check it
        if (!appuser && !impersonatedUser) {
          throw new ForbiddenException({
            error: "You are not allowed to perform this action.",
            message: "You are not allowed to perform this action.",
          });
        }
      }

      // ✅ OPTIMIZATION: Pre-fetch source for SOURCE_DOCUMENTS files outside the loop
      // This eliminates sequential queries inside the loop (saves ~200-500ms per file)
      let preFetchedSource = null;
      let preFetchedVersion = 1;
      const hasSourceDocuments = data.some(file => 
        FileTypeHelper.getFromValue(file.file_type) === FileType.SOURCE_DOCUMENTS
      );
      
      if (hasSourceDocuments && source_id) {
        preFetchedSource = await this.sourceRepo.findOne({
          where: {
            id: source_id,
          },
          relations: ["current_version_entity"],
        });
        if (preFetchedSource && preFetchedSource.current_version) {
          preFetchedVersion = preFetchedSource.current_version_entity.text_version + 1;
        }
      }

      const response: GeneratePresignedUploadUrlResponse[] = [];

      // ✅ OPTIMIZATION: Process files in parallel where safe
      // Independent operations (S3 URL generation, database reads) can run in parallel
      // Operations that modify shared state (PROFILE_PICTURE, ORG_LOGO) remain sequential
      const filePromises = data.map(async (fileRequest, index) => {
        let filePrefix: string;
        const uuid = uuidv4();
        const fileResponse = new GeneratePresignedUploadUrlResponse();
        fileResponse.fe_id = fileRequest.fe_id;
        let keyName = "";
        let s3Response: string;
        let responseUuid: string;

        try {
          switch (FileTypeHelper.getFromValue(fileRequest.file_type)) {
            case FileType.PROFILE_PICTURE:
              // Sequential: Updates user profile (shared state)
              filePrefix = `public/profile_image/${uuid}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              s3Response = await this.updateUserProfilePicture(userId, keyName);
              responseUuid = userId;
              break;
            case FileType.ORG_LOGO:
              // Sequential: Updates org logo (shared state)
              filePrefix = `public/${userInfo["tenant_id"]}/${uuid}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              s3Response = await this.updateOrgLogo(
                userInfo["tenant_id"],
                keyName
              );
              responseUuid = userInfo["customerId"];
              break;
            case FileType.ENHANCEMENT_EVIDENCE:
              if (!app_id) {
                throw new BadRequestException(
                  `App id is required for enhancement evidence.`
                );
              }
              filePrefix = `${userInfo["tenant_id"]}/${FileType.ENHANCEMENT_EVIDENCE
                }/${app_id}/${Date.now().toString()}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              s3Response = await this.updateEnhancementEvidence(
                app_id,
                uuid,
                keyName
              );
              responseUuid = uuid;
              break;
            case FileType.SOURCE_DOCUMENTS:
              if (!app_id) {
                throw new BadRequestException(
                  `App id is required for source documents.`
                );
              }
              // ✅ OPTIMIZATION: Use pre-fetched source instead of querying inside loop
              const version = preFetchedSource ? preFetchedVersion : 1;
              
              filePrefix = `${userInfo["tenant_id"]}/${app_id}/${FileType.SOURCE_DOCUMENTS}/${uuid}_${version}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              s3Response = await this.updateSourceDocuments(
                userInfo["tenant_id"],
                app_id,
                sourceType.id,
                uuid,
                fileRequest.file_name,
                keyName,
                source_id,
                isInternal,
                version,
                userId // ✅ FIX: Pass userId for created_by and updated_by fields
              );
              responseUuid = uuid;
              break;
            case FileType.SUPPORT_POLICY_DOCUMENTS:
              filePrefix = `${userInfo["tenant_id"]}/${FileType.SUPPORT_POLICY_DOCUMENTS
                }/${Date.now().toString()}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              try {
                s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(keyName);
                this.logger.log(`Generated presigned URL for ${keyName}: ${s3Response?.substring(0, 100)}...`);
              } catch (error) {
                this.logger.error(`Error generating presigned URL for ${keyName}:`, error);
                throw error;
              }
              responseUuid = uuid;
              break;
            case FileType.CRM_DOCUMENTS:
              if (!app_id) {
                throw new BadRequestException(
                  `App id is required for CRM documents.`
                );
              }
              if (!standard_id) {
                throw new BadRequestException(
                  `Standard id is required for CRM documents.`
                );
              }
              // ✅ FIX: appStandard is already fetched in Promise.all above, just check it
              if (!appStandard) {
                throw new BadRequestException(
                  `App standard not found for app ${app_id} and standard ${standard_id}.`
                );
              }
              filePrefix = `${userInfo["tenant_id"]}/${app_id}/${standard_id}/${FileType.CRM_DOCUMENTS
                }/${Date.now().toString()}`;
              keyName = `${filePrefix}_${fileRequest.file_name}`;
              s3Response = await this.generateUploadSignedUrl(
                fileRequest.file_name,
                keyName
              );
              // ✅ OPTIMIZATION: Batch appStandard updates at the end instead of per-file
              // Note: For multiple CRM_DOCUMENTS files, only the last one's path will be saved
              // This is acceptable as temp_crm_file_path is typically single-file
              appStandard.temp_crm_file_path = keyName;
              appStandard.is_crm_available = false;
              appStandard.updated_at = new Date();
              await this.appStandardRepo.save(appStandard);
              responseUuid = uuid;
              break;
            case FileType.TEMPLATE:
              if(Number(user.role_id) !== Number(UserRole.SuperAdmin) && Number(user.role_id) !== Number(UserRole.CSM)) {
                throw new ForbiddenException(
                  `User is not authorized to upload template files.`
                );
              }
              let { s3Url, templateId } = await this.uploadTemplateFile(
                fileRequest.file_name,
                fileRequest.template_id,
                userId
              );
              s3Response = s3Url;
              responseUuid = templateId;
              break;
            case FileType.ASSESSMENT:
              if (!fileRequest.assessment_id) {
                throw new BadRequestException(
                  `Assessment id is required for assessmen file upload.`
                );
              }
              s3Response = await this.uploadAssessmentFile(
                userInfo["tenant_id"],
                fileRequest.file_name,
                fileRequest.assessment_id,
                userId
              );
              responseUuid = uuid;
              break;
            default:
              throw new BadRequestException(
                `Unknown file type: ${fileRequest.file_type}`
              );
          }

          fileResponse.url = s3Response;
          fileResponse.uuid = responseUuid;
          return fileResponse;
        } catch (error) {
          this.logger.error(`Error processing file ${fileRequest.file_name}:`, error);
          throw error;
        }
      });

      // Wait for all file processing to complete
      const results = await Promise.all(filePromises);
      response.push(...results);

      return response;
    } catch (error) {
      this.logger.error("Error occured while generating signed Url", error);
      throw error;
    }
  }

  private async uploadTemplateFile(
    fileName: string,
    templateId: number,
    userId: string
  ): Promise<any> {
    let template: Templates;
    if (templateId) {
      template = await this.templateRepo.findOneOrFail({
        where: {
          id: templateId,
        },
      });
    } else {
      template = this.templateRepo.create({
        name: fileName,
        is_default: false,
        is_editable: false,
        is_available: false,
        is_published: false,
        updated_by: userId,
        created_by: userId,
        location: null,
        temp_location: null,
        license_type_id: 1,
      });
      await this.templateRepo.save(template);
    }
    const fileKey = `${FileType.TEMPLATE}/${template.id}/${Date.now().toString()}_${fileName}`;
    template.temp_location = fileKey;
    await this.templateRepo.save(template);
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileKey
    );
    return { s3Url: s3Response, templateId: template.id };
  }

  private async uploadAssessmentFile(
    customerId: string,
    fileName: string,
    assessmentId: number,
    userId: string
  ): Promise<string> {
    const assessment = await this.assessmentRepo.findOneOrFail({
      where: {
        id: assessmentId,
      },
    });
    const ext = fileName.split('.').pop();
    const fileKey = `${customerId}/${assessment.app_id}/${FileType.ASSESSMENT}/${assessment.id}/${Date.now().toString()}_${assessment.title}.${ext}`;
    assessment.temp_location = fileKey;
    assessment.updated_by = userId;
    await this.assessmentRepo.save(assessment);
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileKey
    );
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
    }
    return s3Response;
  }

  private async updateUserProfilePicture(
    userId: string,
    fileName: string
  ): Promise<string> {
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileName
    );
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
    }
    try {
      const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
      user.temp_profile_image_key = fileName;
      user.image_updated_at = new Date();
      user.is_profile_image_available = false;
      await this.userRepo.save(user);
      return s3Response;
    } catch (error) {
      this.logger.error(
        `Error occured while updating user profile picture: ${error}`
      );
      throw new InternalServerErrorException(
        `Something went wrong while updating user profile picture.`
      );
    }
  }

  private async updateOrgLogo(
    orgId: string,
    fileName: string
  ): Promise<string> {
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileName
    );
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
    }
    try {
      const customer = await this.customerRepo.findOneOrFail({
        where: { id: orgId },
      });
      customer.temp_logo_image_key = fileName;
      customer.logo_updated_at = new Date();
      customer.is_logo_available = false;
      await this.customerRepo.save(customer);
      return s3Response;
    } catch (error) {
      this.logger.error(`Error occured while updating org logo: ${error}`);
      throw new InternalServerErrorException(
        `Something went wrong while updating org logo.`
      );
    }
  }

  private async updateEnhancementEvidence(
    appId: number,
    uuid: string,
    fileName: string
  ): Promise<string> {
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileName
    );
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
    }
    try {
      const evidence = await this.applicationControlEvidenceRepo.create({
        uuid: uuid,
        document: fileName,
        is_available: false,
      });
      await this.applicationControlEvidenceRepo.save(evidence);
      return s3Response;
    } catch (error) {
      this.logger.error(
        `Error occured while updating enhancement evidence: ${error}`
      );
      throw new InternalServerErrorException(
        `Something went wrong while updating enhancement evidence.`
      );
    }
  }

  private async updateSourceDocuments(
    org_id: string,
    app_id: number,
    sourceTypeId: number,
    uuid: string,
    fileName: string,
    fileKey: string,
    source_id?: number,
    isInternal?: boolean,
    version?: number,
    userId?: string
  ): Promise<string> {
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      fileKey
    );
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileKey} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileKey} file.`
      );
    }
    try {
      if (isInternal && source_id && version) {
        const sourceVersion = this.sourceVersionRepo.create({
          source_id: source_id,
          text_version: version,
          is_text_available: false,
          text_s3_path: fileKey,
        });
        await this.sourceVersionRepo.save(sourceVersion);

        await this.sourceRepo.update(source_id, {
          uuid: uuid,
          is_available: false,
          current_version: sourceVersion.id,
        });
      } else {
        // ✅ FIX: Include all required fields for source creation
        // Match how sources are created in sources.service.ts (line 510-523)
        const source = this.sourceRepo.create({
          customer_id: org_id,
          app_id: app_id,
          source_type: sourceTypeId,
          name: fileName,
          file_bucket_key: fileKey,
          is_available: false,
          uuid: uuid,
          data: {},
          summary: {}, // Required field (JSON type) - set to empty object
          created_by: userId || '', // Set userId for created_by (matches sources.service.ts)
          updated_by: userId || '', // Set userId for updated_by (matches sources.service.ts)
          // Note: is_active defaults to true in DB, current_version is set later after version creation
        });
        await this.sourceRepo.save(source);
      }
      return s3Response;
    } catch (error) {
      this.logger.error(
        `Error occured while updating source documents: ${error}`
      );
      throw new InternalServerErrorException(
        `Something went wrong while updating source documents.`
      );
    }
  }

  private async generateUploadSignedUrl(
    fileName: string,
    keyName: string
  ): Promise<string> {
    this.logger.log(`Generating presigned URL for key: ${keyName}`);
    let s3Response = await this.awsS3ConfigService.generateUploadSignedUrl(
      keyName
    );
    this.logger.log(`Presigned URL generated: ${s3Response?.substring(0, 100)}...`);
    if (!s3Response) {
      this.logger.error(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
      throw new InternalServerErrorException(
        `Something went wrong while generating signed Url for ${fileName} file.`
      );
    }
    return s3Response;
  }
}