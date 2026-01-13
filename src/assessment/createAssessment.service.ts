import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SqsMessageHandler, SqsService } from "@ssut/nestjs-sqs";
import { createHash } from "crypto";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { Templates, TemplateType } from "src/entities/template.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { User } from "src/entities/user.entity";
import { DataSource, In, Repository } from "typeorm";
import { AssessmentPolicyService } from "./service/assessmentPolicy.service";
import { CustomAssessmentTemplateProcessor } from "./service/customAssessmentTemplateProcessor.service";
import { LoggerService } from "src/logger/logger.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { FileType } from "src/app/app.dto";

interface CreateAssessmentParams {
  application_id: number;
  frameworks: number[];
  template_id: number;
}

interface CreateAssessmentOutlineParams {
  title: string;
  standardIds: number[];
  appId: number;
  templateId: string;
}

export enum TaskOps {
  CREATE_ASSETS = "CREATE_ASSETS",
  CREATE_ASSESSMENTS = "CREATE_ASSESSMENTS",
  UPDATE_ASSETS = "UPDATE_ASSETS",
  UPDATE_ASSESSMENTS = "UPDATE_ASSESSMENTS",
  UPDATE_COMPLIANCE = "UPDATE_COMPLIANCE",
  EXPORT_TRUST_CENTER = "EXPORT_TRUST_CENTER",
  CONTROL_EVALUATION = "CONTROL_EVALUATION",
  CREATE_POLICY = "CREATE_POLICY",
  UPDATE_POLICY = "UPDATE_POLICY",
}

export enum TaskStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  IN_PROCESS = "IN_PROCESS",
  CANCELLED = "CANCELLED",
}

@Injectable()
export class CreateAssessmentService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(App) private readonly appsRepo: Repository<App>,
    @InjectRepository(OrganizationTemplate)
    private readonly orgTemplateRepo: Repository<OrganizationTemplate>,
    @InjectRepository(OrganizationStandards)
    private readonly organizationStandardRepo: Repository<OrganizationStandards>,
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(AssessmentDetail)
    private readonly assessmentDetailsRepo: Repository<AssessmentDetail>,
    @InjectRepository(AssessmentOutline)
    private readonly assessmentOutlineRepo: Repository<AssessmentOutline>,
    @InjectRepository(Templates)
    private readonly templateRepo: Repository<Templates>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AssessmentSections)
    private readonly assessnentSectionRepo: Repository<AssessmentSections>,
    @InjectRepository(TemplateSection)
    private readonly templateSectionRepo: Repository<TemplateSection>,

    private readonly dataSource: DataSource,
    private readonly sqsProducerService: SqsService,
    private readonly sqsClient: SQSClient,
    private readonly assessmentPolicyService: AssessmentPolicyService,
    private readonly customTemplateProcessor: CustomAssessmentTemplateProcessor,
    private readonly logger: LoggerService,
    private readonly s3Service: AwsS3ConfigService
  ) {}

  async createAssessment(userInfo: any, data: any) {
    const orgId = userInfo.tenant_id || userInfo.customerId;
    const userId = userInfo.userId;
    const date = new Date();

    // Check if the tenant organization exists
    const org = await this.customerRepo.findOne({
      where: { id: orgId },
      relations: ["licenseType", "licenseType.licenseRule"],
    });
    if (!org) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }
    const application_id = data.applicationId;
    const frameworks = data.frameworks;
    const template_id = data.templateId;
    const title = data.title;

    await this.validateAssessment(application_id, orgId);
    await this.validateStandards(frameworks[0], application_id, orgId);

    await this.assessmentPolicyService.canCreateAssessment(
      userInfo,
      data.applicationId
    );

    const orgTemplate = await this.validateTemplate(orgId, template_id);
    if (!orgTemplate) {
      throw new ForbiddenException({
        error: "Please provide a valid template_id.",
        message: "Please provide a valid template_id.",
      });
    }

    const template = await this.templateRepo.findOne({
      where: { id: template_id },
    });

    await this.validateApp(orgId, application_id);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["name"], // Only select the 'name' field
    });

    const app = await this.appsRepo.findOne({
      where: { id: application_id },
      select: ["name"], // Only select the 'name' field
    });
    const isLocked = await this.assessmentDetailsRepo.find({
      where: {
        customer_id: orgId,
        app_id: application_id,
        is_locked: true,
        is_deleted: false,
      },
    });
    if (isLocked.length > 0) {
      throw new BadRequestException({
        error: "Assessment is already running.....",
        message: "Assessment is already running.....",
      });
    }

    if (
      (template_id === 4 || template.is_default || template.is_editable) &&
      template.type === TemplateType.WORD &&
      !template.llm_enabled
    ) {
      const { savedAssessment, createdTask } =
        await this.dataSource.transaction(async (manager) => {
          const assessmentToCreate = this.assessmentDetailsRepo.create({
            title: title,
            customer_id: orgId,
            app_id: application_id,
            frameworks,
            template_id,
            created_by: userId,
            created_on: date,
            updated_by: userId,
            is_locked: true,
          });
          const savedAssessment = await manager.save(assessmentToCreate);
          const asyncTask = this.asyncTaskRepo.create({
            ops: TaskOps.CREATE_ASSESSMENTS, // Set enum based on entity_type
            status: TaskStatus.PENDING, // Set status to 'PENDING'
            request_payload: "",
            customer_id: orgId,
            created_by: userId,
            app_id: application_id,
            entity_id: savedAssessment.id.toString(),
            entity_type: this.assessmentDetailsRepo.metadata.tableName,
          });

          const createdTask = await manager.save(asyncTask);

          return { savedAssessment, createdTask };
        });

      this.customTemplateProcessor.processTemplate(
        template_id,
        application_id,
        frameworks[0],
        savedAssessment,
        createdTask,
        template.is_default || template.is_editable
      );

      return { title, user, app, status: "Pending" };
    } else {
      try {
        let message, createdTask;
        if (template.type === TemplateType.EXCEL) {
          const savedAssessmentassessmentInfo =
            await this.dataSource.transaction(async (manager) => {
              if (template.location) {
                let is_locked = template.llm_enabled;
                // copy the template to the assessment location
                const assessmentToCreate = this.assessmentDetailsRepo.create({
                  title: title,
                  customer_id: orgId,
                  app_id: application_id,
                  frameworks,
                  template_id,
                  created_by: userId,
                  created_on: date,
                  updated_by: userId,
                  type: template.type,
                  is_locked: is_locked,
                });
                const createdAssessment =
                  await manager.save(assessmentToCreate);
                const templateLocation = template.location;
                const ext = this.getFileExtension(templateLocation);
                const assessmentKey = `${orgId}/${application_id}/${FileType.ASSESSMENT}/${createdAssessment.id}/${Date.now().toString()}_${title}.${ext}`;
                const copiedAssessment = await this.s3Service.copyObject(
                  templateLocation,
                  assessmentKey
                );
                if (!copiedAssessment) {
                  throw new BadRequestException({
                    error: "Failed to copy template to assessment location!",
                    message: "Failed to copy template to assessment location!",
                  });
                }
                createdAssessment.location = assessmentKey;
                await manager.save(createdAssessment);
                return createdAssessment;
              } else {
                throw new BadRequestException({
                  error: "Template is not uploaded!",
                  message: "Template is not uploaded!",
                });
              }
            });
          this.logger.info(
            "Assessment created successfully:- ",
            savedAssessmentassessmentInfo
          );
          message = {
            task_id: null,
            type: template.type,
            llm_enabled: template.llm_enabled,
            assessment_id: savedAssessmentassessmentInfo.id,
            standard_id: savedAssessmentassessmentInfo.frameworks[0],
            operation: TaskOps.CREATE_ASSESSMENTS,
            frameworks: savedAssessmentassessmentInfo.frameworks,
            template_id: savedAssessmentassessmentInfo.template_id,
            app_id: savedAssessmentassessmentInfo.app_id,
            assessment_s3_location: savedAssessmentassessmentInfo.location,
            customer_id: orgId,
            created_at: date,
            created_by: userId,
          };

          const asyncTask = this.asyncTaskRepo.create({
            ops: TaskOps.CREATE_ASSESSMENTS, // Set enum based on entity_type
            status: TaskStatus.PENDING, // Set status to 'PENDING'
            request_payload: message,
            customer_id: orgId,
            created_by: userId,
            app_id: application_id,
            entity_id: savedAssessmentassessmentInfo.id.toString(),
            entity_type: this.assessmentDetailsRepo.metadata.tableName,
          });

          createdTask = await this.asyncTaskRepo.save(asyncTask);
          message.task_id = createdTask.id;
        } else {
          const savedAssessmentassessmentInfo =
            await this.dataSource.transaction(async (manager) => {
              const assessmentToCreate = this.assessmentDetailsRepo.create({
                title: title,
                customer_id: orgId,
                app_id: application_id,
                frameworks,
                template_id,
                created_by: userId,
                created_on: date,
                updated_by: userId,
                is_locked: true,
                type: template.type,
              });
              const savedAssessment = await manager.save(assessmentToCreate);

              const outline = await this.getOutline(template_id);
              const outlineHash = await this.generateMD5Hash(outline);
              // Create and save assessment outline
              const assessmentOutlineToCreate =
                this.assessmentOutlineRepo.create({
                  customer_id: orgId,
                  assessment_id: savedAssessment.id,
                  app_id: application_id,
                  created_by: userId,
                  created_on: date,
                  version: 0,
                  outline_hash: outlineHash,
                  outline: outline, // Outline type is now compatible
                });

              await manager.save(assessmentOutlineToCreate);

              return savedAssessment;
            });
          message = {
            task_id: null,
            type: template.type,
            llm_enabled: template.llm_enabled,
            assessment_id: savedAssessmentassessmentInfo.id,
            standard_id: savedAssessmentassessmentInfo.frameworks[0],
            operation: TaskOps.CREATE_ASSESSMENTS,
            frameworks: savedAssessmentassessmentInfo.frameworks,
            template_id: savedAssessmentassessmentInfo.template_id,
            app_id: savedAssessmentassessmentInfo.app_id,
            customer_id: orgId,
            created_at: date,
            created_by: userId,
          };

          const asyncTask = this.asyncTaskRepo.create({
            ops: TaskOps.CREATE_ASSESSMENTS, // Set enum based on entity_type
            status: TaskStatus.PENDING, // Set status to 'PENDING'
            request_payload: message,
            customer_id: orgId,
            created_by: userId,
            app_id: application_id,
            entity_id: savedAssessmentassessmentInfo.id.toString(),
            entity_type: this.assessmentDetailsRepo.metadata.tableName,
          });

          createdTask = await this.asyncTaskRepo.save(asyncTask);

          // Temporary section creation
          if (process.env.POPULATE_ASSESSMENT_DUMMY_DATA === "true") {
            const templateSections = await this.templateSectionRepo.find({
              where: { template_id, is_active: true },
              select: ["title", "section_id", "html_content"],
            });

            if (!templateSections || templateSections.length === 0) {
              throw new NotFoundException(
                `No active sections found for template ID: ${template_id}`
              );
            }

            const assessmentSectionsData = templateSections.map((section) => ({
              customer_id: orgId,
              app_id: application_id,
              title: section.title,
              assessment_id: savedAssessmentassessmentInfo.id,
              section_id: section.section_id,
              version: 0,
              created_by: userId,
              content: { htmlContent: section.html_content },
              s3_path: section.s3_path,
              copy_of: null,
            }));

            await this.dataSource.transaction(async (manager) => {
              for (const sectionData of assessmentSectionsData) {
                const assessmentSection =
                  this.assessnentSectionRepo.create(sectionData);
                await manager.save(assessmentSection);
              }
            });
          }

          this.logger.info(
            "Saved assessment task_id:",
            createdTask.id.toString()
          );

          message.task_id = createdTask.id;
        }
        this.logger.info("Sending Assessment message to SQS:- ", message);
        let status = "Pending";
        if (message.llm_enabled) {
          await this.sendToQueue(process.env.DS_QUEUE_NAME, {
            id: message.task_id.toString(),
            body: { type: "assessment", payload: message },
          }, 'assessment creation');
        } else {
          status = "Processed";
          createdTask.status = TaskStatus.PROCESSED;
          await this.asyncTaskRepo.save(createdTask);
        }

        return { title, user, app, status: status };
      } catch (error) {
        this.logger.error("Error when creating assessment:", error);
        throw new BadRequestException({
          error: error.message,
          message:
            "An error occurred while creating the assessment. Please try again.",
        });
      }
    }
  }

  async getFileExtension(filePath: string): Promise<string> {
    return filePath.split(".").pop();
  }

  async generateMD5Hash(data: any): Promise<string> {
    const contentString =
      typeof data === "string" ? data : JSON.stringify(data);
    return createHash("md5").update(contentString).digest("hex");
  }

  private async getOutline(template_id: number): Promise<any> {
    const result = await this.templateRepo.findOne({
      where: { id: template_id },
      select: ["outline"], // Only select the 'outline' column
    });

    if (!result) {
      throw new NotFoundException(`Template with id ${template_id} not found`);
    }

    return result.outline; // Return only the outline data
  }

  private async validateApp(orgId: string, appId: number) {
    const appExists = await this.appsRepo.count({
      where: { id: appId, customer_id: orgId },
    });

    if (!appExists) {
      throw new BadRequestException({
        error: "Invalid app_id provided!",
        message: "Invalid app_id provided!",
      });
    }
  }

  private async validateAssessment(appId: number, orgId: string) {
    const org = await this.customerRepo.findOne({
      where: { id: orgId },
      relations: ["licenseType", "licenseType.licenseRule"],
    });
    if (!org) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    const licenseRule = org.licenseType.licenseRule;

    const assessmentCount = await this.assessmentDetailsRepo.count({
      where: { app_id: appId, customer_id: orgId },
    });

    if (
      licenseRule.number_of_assessments > 0 &&
      assessmentCount >= licenseRule.number_of_assessments
    ) {
      throw new ForbiddenException({
        error:
          "Organization has reached the maximum assessment limit per application.",
        message:
          "Organization has reached the maximum assessment limit per application.",
      });
    }
  }

  private async validateStandards(
    standardId: number,
    appId: number,
    tenantId: string
  ): Promise<void> {
    if (!standardId) {
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

    if (licenseRule.available_standards.length) {
      const standardExists =
        licenseRule.available_standards.includes(standardId);
      if (!standardExists) {
        throw new ForbiddenException(
          `The standard is not part of the organization's License.`
        );
      }
    }

    const validStandard = await this.organizationStandardRepo.find({
      where: {
        customer_id: tenantId,
        standard_id: standardId,
      },
      select: ["standard_id"],
    });

    if (!validStandard) {
      throw new ForbiddenException(
        `The standard is not part of the organization.`
      );
    }

    const appStandard = await this.appStandardRepo.find({
      where: {
        app_id: appId,
        standard_id: standardId,
      },
      select: ["standard_id"],
    });

    if (!appStandard) {
      throw new ForbiddenException(
        `The standard is not part of the application.`
      );
    }
  }

  private async validateTemplate(
    orgId: string,
    templateId: number
  ): Promise<OrganizationTemplate> {
    const org = await this.customerRepo.findOne({
      where: { id: orgId },
      relations: ["licenseType", "licenseType.licenseRule"],
    });
    if (!org) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    if (!org.licenseType || !org.licenseType.licenseRule) {
      throw new ForbiddenException({
        error: "Invalid License!",
        message: "Invalid License!",
      });
    }

    const licenseRule = org.licenseType.licenseRule;
    if (licenseRule.available_templates.length) {
      const templateExists =
        licenseRule.available_templates.includes(templateId);
      if (!templateExists) {
        throw new BadRequestException({
          error: "Template not valid for this organization!",
          message: "Template not valid for this organization!",
        });
      }
    }

    const orgTemplate = await this.orgTemplateRepo.findOne({
      where: { template_id: templateId, customer_id: orgId },
    });

    if (!orgTemplate) {
      throw new BadRequestException({
        error: "Invalid template_id provided!",
        message: "Invalid template_id provided!",
      });
    }

    return orgTemplate;
  }

  private validateAssessmenOutlinetData(data: any) {
    if (!data.customer_id) {
      throw new BadRequestException({
        error: "No title provided!",
        message: "No title provided!",
      });
    }

    if (!data.standardIds || !data.standardIds.length) {
      throw new BadRequestException({
        error: "No standard_id provided!",
        message: "No standard_id provided!",
      });
    }

    if (!data.appId) {
      throw new BadRequestException({
        error: "No app_id provided!",
        message: "No app_id provided!",
      });
    }

    if (!data.templateId) {
      throw new BadRequestException({
        error: "No template_id provided!",
        message: "No template_id provided!",
      });
    }
  }

  async update(userInfo: any, assessmentId: number, data: any) {
    const orgId = userInfo.tenant_id;
    const userId = userInfo.userId;
    const date = new Date();

    // Check if the tenant organization exists
    const orgExists = await this.customerRepo.count({ where: { id: orgId } });
    if (!orgExists) {
      throw new ForbiddenException({
        error: "You are not linked to any organization.",
        message: "You are not linked to any organization.",
      });
    }

    const assessmentDetails = await this.assessmentDetailsRepo.findOne({
      where: {
        id: assessmentId,
        is_deleted: false,
      },
    });
    if (!assessmentDetails) {
      throw new ForbiddenException({
        error: "Assessment id you provided not exist in table.",
        message: "Assessment id you provided not exist in table.",
      });
    }

    // Check if values don't exist in data object, then fetch from assessmentDetails
    const application_id =
      data.applicationId !== undefined
        ? data.applicationId
        : assessmentDetails.app_id;
    const frameworks =
      data.frameworks !== undefined
        ? data.frameworks
        : assessmentDetails.frameworks;
    const template_id =
      data.templateId !== undefined
        ? data.templateId
        : assessmentDetails.template_id;
    const title =
      data.title !== undefined ? data.title : assessmentDetails.title;

    await this.validateStandards(frameworks[0], application_id, orgId);
    // Validate template association with the organization
    const orgTemplate = await this.validateTemplate(orgId, template_id);
    if (!orgTemplate) {
      throw new ForbiddenException({
        error: "Please provide a valid template_id.",
        message: "Please provide a valid template_id.",
      });
    }

    // Validate application association
    await this.validateApp(orgId, application_id);

    if (!frameworks) {
      throw new ForbiddenException({
        error: "Frameworks are required.",
        message: "Please provide frameworks for the assessment.",
      });
    }

    // Check if any assessment is already locked for this customer
    const isLocked = await this.assessmentDetailsRepo.find({
      where: { customer_id: orgId, is_locked: true },
    });
    if (isLocked.length > 0) {
      throw new BadRequestException({
        error: "Assessment is already running for application_id.",
        message: "Assessment is already running for application_id.",
      });
    }

    // Check if an assessment with the same app and template already exists
    const frameworksParam = JSON.stringify(frameworks);

    // Use query builder instead of find method for complex JSON comparison
    const assessmentExists = await this.assessmentDetailsRepo
      .createQueryBuilder("assessment")
      .where("assessment.customer_id = :orgId", { orgId })
      .andWhere("assessment.app_id = :application_id", { application_id })
      .andWhere("assessment.template_id = :template_id", { template_id })
      .andWhere("assessment.is_deleted = :is_deleted", { is_deleted: false })
      .getMany();

    const updateData = null;
    if (title && assessmentExists) {
      // Check if the title is different and needs updating
      if (title !== assessmentExists[0].title) {
        // Use the update function to only change the title
        const updateData = await this.assessmentDetailsRepo.update(
          assessmentId,
          { title }
        );
      }
      return updateData;
    }

    try {
      // Transactional block to create and save assessment and outline
      const assessmentInfo = await this.dataSource.transaction(
        async (manager) => {
          // Create and save assessment details
          const assessmentToCreate = this.assessmentDetailsRepo.create({
            title,
            customer_id: orgId,
            app_id: application_id,
            frameworks,
            template_id,
            created_by: userId,
            created_on: date,
            updated_by: userId,
            is_locked: true,
          });
          const savedAssessment = await manager.save(assessmentToCreate);

          // Create and save assessment outline
          const assessmentOutlineToCreate = this.assessmentOutlineRepo.create({
            customer_id: orgId,
            app_id: application_id,
            created_by: userId,
            created_on: date,
            outline: await this.getOutline(template_id), // Outline type is now compatible
          });

          const savedAssessmentOutline = await manager.save(
            assessmentOutlineToCreate
          );

          return savedAssessment;
        }
      );

      return { message: `Assessment updated successfully!` };
    } catch (error) {
      this.logger.error("Error when creating assessment:", error);
      throw new BadRequestException({
        error: error.message,
        message:
          "An error occurred while creating the assessment. Please try again.",
      });
    }
  }

  async handleSqsMessage(message: any) {
    try {
      // Parse message body
      let body;
      try {
        body = message.Body ? JSON.parse(message.Body) : {};
      } catch (parseError) {
        console.error("Error parsing message body:", parseError);
        throw new BadRequestException("Invalid SQS message format.");
      }

      await this.processMessage(body);
    } catch (error) {
      console.error("Error processing SQS message:", error);
      throw error;
    }
  }

  async processMessage(body: any, message?: any) {
    // Extract fields from the message body
    const taskId = body.taskId ?? null;
    const status = body.response?.status ?? null;
    const responsePayload = body.response ?? {};
    const payload = responsePayload.payload;
    const app_id = payload?.appId ?? null;
    const customer_id = payload?.customerId ?? null;
    const assessment_id = payload?.assessmentId ?? null;

    // Validate required fields
    if (!customer_id) {
      console.error("Missing customer_id:", customer_id);
      throw new ForbiddenException({
        error: "Required identifier is missing.",
        message: "Please provide a valid customer_id.",
      });
    }

    if (!app_id) {
      console.error("Missing app_id:", app_id);
      throw new ForbiddenException({
        error: "Required identifier is missing.",
        message: "Please provide a valid app_id.",
      });
    }

    if (!assessment_id) {
      console.error("Missing assessment_id:", assessment_id);
      throw new ForbiddenException({
        error: "Required identifier is missing.",
        message: "Please provide a valid assessment_id.",
      });
    }

    console.log("Received Assessment Completion SQS message:", {
      taskId,
      status,
      responsePayload,
    });

    // Find the AsyncTask by taskId
    const asyncTask = await this.asyncTaskRepo.findOne({
      where: { id: taskId },
    });
    if (!asyncTask) {
      console.error(`AsyncTask with id ${taskId} not found`);
      throw new NotFoundException(`AsyncTask with id ${taskId} not found`);
    }

    // Find the assessment detail
    const assessmentDetail = await this.assessmentDetailsRepo.findOne({
      where: {
        id: assessment_id,
        customer_id,
        app_id,
      },
    });
    if (!assessmentDetail) {
      console.error(`Assessment detail not found for id ${assessment_id}`);
      throw new NotFoundException(
        `Assessment detail not found for id ${assessment_id}`
      );
    }

    // Update AsyncTask status
    if (status === "success") {
      asyncTask.status = TaskStatus.PROCESSED;
      asyncTask.updated_at = new Date();
    } else if (status === "in_process") {
      asyncTask.status = TaskStatus.IN_PROCESS;
      asyncTask.updated_at = new Date();
      await this.asyncTaskRepo.save(asyncTask);
      console.log(
        `AsyncTask ${taskId} updated with status ${asyncTask.status}`
      );

      // Delete the SQS message
      try {
        await this.deleteMessage(message);
        console.log(
          `Message successfully deleted from SQS: ${message.MessageId}`
        );
      } catch (deleteError) {
        console.error("Error deleting SQS message:", deleteError);
        throw new Error("Failed to delete SQS message.");
      }

      return { in_process: true };
    } else if (status === "failed") {
      asyncTask.status = TaskStatus.FAILED;
      asyncTask.updated_at = new Date();
    }

    // Unlock the assessment
    assessmentDetail.is_locked = false;

    // Save the updated entities
    await this.asyncTaskRepo.save(asyncTask);
    await this.assessmentDetailsRepo.save(assessmentDetail);

    // Delete the SQS message
    if (message) {
      try {
        await this.deleteMessage(message);
        console.log(
          `Message successfully deleted from SQS: ${message.MessageId}`
        );
      } catch (deleteError) {
        console.error("Error deleting SQS message:", deleteError);
        throw new Error("Failed to delete SQS message.");
      }
    }

    console.log(`AsyncTask ${taskId} updated with status ${asyncTask.status}`);
    return { success: true };
  }

  private async deleteMessage(message: any) {
    const deleteParams = {
      QueueUrl: process.env.ASSESSMENT_COMPLETION_LISTENER_QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle,
    };
    await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
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
