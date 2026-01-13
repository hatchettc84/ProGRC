import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { PolicyDetails, PolicyStatus } from 'src/entities/policyDetails.entity';
import { CreatePolicyDto } from './dto/createPolicy.dto';
import { Customer } from 'src/entities/customer.entity';
import { TaskStatus } from 'src/entities/asyncTasks.entity';
import { TaskOps } from 'src/entities/asyncTasks.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs';
import { UpdatePolicyContentDto } from './dto/updatePolicyContent.dto';
import { Templates, EntityType } from 'src/entities/template.entity';
import { UpdatePolicyDetailsDto } from './dto/updatePolicyDetails.dto';
import { Standard } from 'src/entities/standard_v1.entity';
import { DeleteMessageCommand, Message, SQSClient } from '@aws-sdk/client-sqs';
import { Control } from 'src/entities/compliance/control.entity';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class PolicyService {
  private policies = [];
  sqsClient: any;

  constructor(
    @InjectRepository(PolicyDetails)
    private readonly policyRepo: Repository<PolicyDetails>,
    @InjectRepository(Templates)
    private readonly templateRepo: Repository<Templates>,
    private readonly dataSource: DataSource,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(AsyncTask) private asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(Standard) private standardRepo: Repository<Standard>,
    @InjectRepository(Control) private controlRepo: Repository<Control>,
    private readonly sqsProducerService: SqsService,
    private readonly aiHelper: AiHelperService,
    private readonly logger: LoggerService
  ) {}

  async findAll(userInfo: any) {
    const customerId = userInfo["customerId"];
    return this.policyRepo
      .createQueryBuilder("policy")
      .leftJoinAndSelect("policy.policyTemplate", "template")
      .where("policy.customerId = :customerId", { customerId })
      .orderBy("policy.createdAt", "DESC")
      .getMany();
  }

  async findOne(id: number) {
    const policy = await this.policyRepo
      .createQueryBuilder("policy")
      .leftJoinAndSelect("policy.policyTemplate", "template")
      .where("policy.id = :id", { id })
      .getOne();

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return policy;
  }

  async create(userInfo: any, createPolicyDto: CreatePolicyDto) {
    const customerId = userInfo["customerId"];
    const userId = userInfo["userId"];
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, verify if the template exists (only if templateId is provided)
      let templateContent = null;
      if (createPolicyDto.templateId) {
        templateContent = await this.templateRepo.findOne({ 
          where: { id: createPolicyDto.templateId, entity_type: EntityType.POLICY } 
        });
        
        if (!templateContent) {
          throw new NotFoundException(`Policy template with ID ${createPolicyDto.templateId} not found`);
        }
      }

      // Process S3 URLs if provided
      let extractedS3Urls: string[] = [];
      if (createPolicyDto.s3Urls && createPolicyDto.s3Urls.length > 0) {
        extractedS3Urls = createPolicyDto.s3Urls.map((url) => {
          // Extract the substring after the second forward slash
          const parts = url.split("/");
          if (parts.length >= 5) {
            // Join all parts after the second slash and before the query parameters
            const keyParts = parts.slice(4);
            const keyWithQuery = keyParts.join("/");
            const endIndex = keyWithQuery.indexOf("?");
            return endIndex > -1
              ? keyWithQuery.substring(0, endIndex)
              : keyWithQuery;
          }
          return url;
        });
      }

      console.log("templateId--------------", createPolicyDto.templateId);

      const policy = this.policyRepo.create({
        ...createPolicyDto,
        customerId,
        customerName: customer.organization_name,
        updateBy: userId,
        standards: createPolicyDto.standards || [],
        appIds: createPolicyDto.appIds || [],
        remarks: createPolicyDto.remarks || "",
        references3urls: extractedS3Urls,
        is_locked: true,
        templateId: createPolicyDto.templateId,
        status: PolicyStatus.DRAFT,
        content: createPolicyDto.content || (templateContent ? (typeof templateContent.outline === 'string' 
          ? { htmlContent: templateContent.outline }
          : templateContent.outline) : { htmlContent: '' })
      });

      // Validate content is valid JSON
      try {
        JSON.stringify(policy.content);
      } catch (error) {
        throw new InternalServerErrorException({
          error: "Invalid JSON content in policy",
          message: "Failed to create policy due to invalid content format",
        });
      }

      const savedPolicy = await queryRunner.manager.save(policy);

      const standardName = await this.standardRepo.findOne({
        where: { id: savedPolicy.standards[0] },
      });

      const message = {
        task_id: null,
        policy_id: savedPolicy.id,
        policy_name: savedPolicy.policyName,
        customer_id: savedPolicy.customerId,
        sector: savedPolicy.sector,
        organization_name: savedPolicy.customerName,
        standard_ids: savedPolicy.standards,
        standard_names: standardName.name,
        remarks: savedPolicy.remarks,
        created_by: userId,
        support_s3_urls: extractedS3Urls,
        app_ids: savedPolicy.appIds,
        msg_entity_type: "POLICY_GENERATION",
      };

      const task = this.asyncTaskRepo.create({
        ops: TaskOps.CREATE_POLICY,
        status: TaskStatus.PENDING,
        request_payload: message,
        customer_id: customerId,
        created_by: userId,
        entity_id: savedPolicy.id.toString(),
        entity_type: "POLICY_GENERATION",
      });

      // Save async task entry in the database
      const createdTask = await this.asyncTaskRepo.save(task);
      message.task_id = createdTask.id;

      console.log("message--------------", message);

      await this.sendToQueue(process.env.DS_QUEUE_NAME, {
        id: task.id.toString(),
        body: { type: "policy", payload: message },
      }, 'policy generation');

      await queryRunner.commitTransaction();
      return savedPolicy;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Check if it's a unique constraint violation for policy name
      if (
        error.code === "23505" &&
        error.constraint === "unique_policy_name_per_customer"
      ) {
        throw new ConflictException({
          error: "Duplicate policy name",
          message: `Cannot create policy with duplicate name "${createPolicyDto.policyName}". Policy names must be unique within your organization.`,
        });
      }

      // Check if it's a generic unique constraint violation
      if (error.code === "23505") {
        throw new ConflictException({
          error: "Duplicate entry",
          message:
            "Cannot create policy due to duplicate entry. Please check your input and try again.",
        });
      }

      // For other errors, throw the original error or a generic one
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to create policy",
      });
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updatePolicyDto: any) {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    this.policies[index] = {
      ...this.policies[index],
      ...updatePolicyDto,
      updatedAt: new Date(),
    };
    return this.policies[index];
  }

  async remove(id: string) {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    this.policies.splice(index, 1);
  }

  async handleMessage(message: Message) {
    const messageBody = message.Body;
    const body = JSON.parse(messageBody);
    await this.processMessage(body, message);
    await this.deleteMessage(message, process.env.SQS_POLICY_OUTPUT_QUEUE_URL);
  }

  async processMessage(body: any, message?: Message) {
    const taskId = body.taskId;
    const status = body.status;
    const response = body.response;
    const remarks = body.remarks;
    const messageText = body.message; // Additional field from your message

    console.log("Parsed policy message:", body);
    console.log("Task ID:", taskId);
    console.log("Status:", status);
    console.log("Message:", messageText);

    if (!taskId) {
      console.error("Task ID is missing in message body");
      return;
    }

    try {
      const asyncTask = await this.asyncTaskRepo.findOne({
        where: { id: taskId },
      });

      if (!asyncTask) {
        console.error(`AsyncTask with ID ${taskId} not found`);
        return;
      }

      const policy_id = asyncTask.request_payload.policy_id;
      const policy = await this.policyRepo.findOne({
        where: { id: policy_id },
      });

      if (!policy) {
        console.error(`Policy with ID ${policy_id} not found`);
        return;
      }

      if (
        asyncTask.status === TaskStatus.PROCESSED ||
        asyncTask.status === TaskStatus.FAILED ||
        asyncTask.status === TaskStatus.CANCELLED
      ) {
        console.warn("Task already processed, skipping");
        return;
      }

      if (status === "in_progress" && asyncTask.status === TaskStatus.PENDING) {
        asyncTask.status = TaskStatus.IN_PROCESS;
        asyncTask.updated_at = new Date();
        console.log(
          `AsyncTask ${asyncTask.id} updated with status ${asyncTask.status}`
        );
      }

      if (status === "success") {
        asyncTask.status = TaskStatus.PROCESSED;
        asyncTask.updated_at = new Date();

        // Unlock the policy when processing is successful
        policy.is_locked = false;
        await this.policyRepo.save(policy);
        await this.asyncTaskRepo.save(asyncTask);

        console.log(
          `Policy ${policy_id} unlocked and task ${taskId} marked as processed`
        );
      }

      await this.deleteMessage(
        message,
        process.env.SQS_POLICY_OUTPUT_QUEUE_URL
      );
    } catch (error) {
      console.error("Error processing SQS message:", error);
      // Don't delete the message if there's an error, let it be retried
    }
  }

  private async deleteMessage(message: any, queueUrl: string) {
    console.log("deleting sqs compliance", message);
    try {
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      };
      await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
      console.log("sqs compliance deleted", message);
    } catch (error) {
      console.log("failed to delete compliance because", error, message);
    }
  }

  async updatePolicyContent(
    id: string,
    updatePolicyContentDto: UpdatePolicyContentDto
  ): Promise<PolicyDetails> {
    const policy = await this.policyRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    if (updatePolicyContentDto.content) {
      if (typeof updatePolicyContentDto.content === "object") {
        const content = updatePolicyContentDto.content as Record<string, any>;
        if ("htmlContent" in content) {
          const htmlContent = { htmlContent: content.htmlContent };
          if (
            htmlContent &&
            typeof htmlContent === "object" &&
            "htmlContent" in htmlContent
          ) {
            policy.content = htmlContent;
          } else {
            policy.content = content;
          }
        } else {
          // If content is an object without htmlContent property
          policy.content = content;
        }
      } else {
        // If content is a string
        policy.content = { htmlContent: updatePolicyContentDto.content };
      }
    }

    if (updatePolicyContentDto.version) {
      policy.version = updatePolicyContentDto.version;
    }
    if (updatePolicyContentDto.description) {
      policy.description = updatePolicyContentDto.description;
    }
    policy.updatedAt = new Date();

    return await this.policyRepo.save(policy);
  }

  async findAllPolicyTemplates(): Promise<Templates[]> {
    try {
      const policyTemplates = await this.templateRepo.find({
        where: { entity_type: EntityType.POLICY }
      });
      return policyTemplates;
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to fetch policy templates",
      });
    }
  }

  async findPolicyTemplateById(id: number): Promise<Templates> {
    const template = await this.templateRepo.findOne({ 
      where: { id, entity_type: EntityType.POLICY } 
    });
    if (!template) {
      throw new NotFoundException(`Policy template with ID ${id} not found`);
    }
    return template;
  }

  async clonePolicy(
    id: string,
    newPolicyName: string,
    userData: any
  ): Promise<any> {
    // Find the original policy
    const originalPolicy = await this.policyRepo.findOne({
      where: { id: Number(id) },
    });

    if (!originalPolicy) {
      throw new NotFoundException("Original policy not found");
    }

    try {
      // Create new policy object with original data
      const clonedPolicyData = {
        ...originalPolicy,
        id: undefined, // Remove ID to create new entry
        policyName: newPolicyName,
        is_locked: false, // Reset lock status for new policy
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userData.id,
        updatedBy: userData.id,
      };

      // Create new policy in database
      const clonedPolicy = await this.policyRepo.create(clonedPolicyData);
      return await this.policyRepo.save(clonedPolicy);
    } catch (error) {
      // Check if it's a unique constraint violation for policy name
      if (
        error.code === "23505" &&
        error.constraint === "unique_policy_name_per_customer"
      ) {
        throw new ConflictException({
          error: "Duplicate policy name",
          message: `Cannot clone policy with duplicate name "${newPolicyName}". Policy names must be unique within your organization.`,
        });
      }

      // Check if it's a generic unique constraint violation
      if (error.code === "23505") {
        throw new ConflictException({
          error: "Duplicate entry",
          message:
            "Cannot clone policy due to duplicate entry. Please check your input and try again.",
        });
      }

      // For other errors, throw the original error or a generic one
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to clone policy",
      });
    }
  }

  async updatePolicyDetails(
    id: string,
    updatePolicyDetailsDto: UpdatePolicyDetailsDto
  ): Promise<PolicyDetails> {
    const policy = await this.policyRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["policyTemplate"],
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update basic fields if provided
      if (updatePolicyDetailsDto.policyName) {
        policy.policyName = updatePolicyDetailsDto.policyName;
      }
      if (updatePolicyDetailsDto.description) {
        policy.description = updatePolicyDetailsDto.description;
      }
      if (updatePolicyDetailsDto.sector) {
        policy.sector = updatePolicyDetailsDto.sector;
      }
      if (updatePolicyDetailsDto.remarks) {
        policy.remarks = updatePolicyDetailsDto.remarks;
      }
      if (updatePolicyDetailsDto.standards) {
        policy.standards = updatePolicyDetailsDto.standards;
      }

      // Handle template update if provided
      if (updatePolicyDetailsDto.templateId) {
        const templateContent = await this.templateRepo.findOne({ 
          where: { id: updatePolicyDetailsDto.templateId, entity_type: EntityType.POLICY } 
        });

        if (!templateContent) {
          throw new NotFoundException(
            `Policy template with ID ${updatePolicyDetailsDto.templateId} not found`
          );
        }

        policy.templateId = templateContent.id;
        policy.content = { htmlContent: templateContent.outline };
        policy.is_locked = true;

        // Create SQS message payload
        const message: any = {
          task_id: null,
          policy_id: policy.id,
          customer_id: policy.customerId,
          sector: policy.sector,
          organization_name: policy.customerName,
          remarks: policy.remarks,
          created_by: policy.updateBy,
        };

        // Only include standard_ids if they exist and are not empty
        if (policy.standards && policy.standards.length > 0) {
          message.standard_ids = policy.standards;
        }

        // Create async task
        const task = this.asyncTaskRepo.create({
          ops: TaskOps.UPDATE_POLICY,
          status: TaskStatus.PENDING,
          request_payload: message,
          customer_id: policy.customerId,
          created_by: policy.updateBy,
          entity_id: policy.id.toString(),
          entity_type: "policy",
        });

        // Save async task
        const createdTask = await this.asyncTaskRepo.save(task);
        message.task_id = createdTask.id;

        // Send SQS message
        await this.sendToQueue(process.env.DS_QUEUE_NAME, {
          id: task.id.toString(),
          body: { type: "policy", payload: message },
        }, 'policy update');
      }

      policy.updatedAt = new Date();
      const savedPolicy = await queryRunner.manager.save(policy);
      await queryRunner.commitTransaction();

      return savedPolicy;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Check if it's a unique constraint violation for policy name
      if (
        error.code === "23505" &&
        error.constraint === "unique_policy_name_per_customer"
      ) {
        throw new ConflictException({
          error: "Duplicate policy name",
          message: `Cannot update policy with duplicate name "${updatePolicyDetailsDto.policyName}". Policy names must be unique within your organization.`,
        });
      }

      // Check if it's a generic unique constraint violation
      if (error.code === "23505") {
        throw new ConflictException({
          error: "Duplicate entry",
          message:
            "Cannot update policy due to duplicate entry. Please check your input and try again.",
        });
      }

      // For other errors, throw the original error or a generic one
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to update policy",
      });
    } finally {
      await queryRunner.release();
    }
  }

  async deletePolicy(id: string): Promise<void> {
    const policy = await this.policyRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete the policy
      await queryRunner.manager.remove(policy);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to delete policy",
      });
    } finally {
      await queryRunner.release();
    }
  }

  async deletePolicyTemplate(id: number): Promise<void> {
    const template = await this.templateRepo.findOne({ 
      where: { id, entity_type: EntityType.POLICY } 
    });
    if (!template) {
      throw new NotFoundException(`Policy template with ID ${id} not found`);
    }

    // Check if template is being used by any policies
    const policiesUsingTemplate = await this.policyRepo.find({
      where: { templateId: id },
    });
    if (policiesUsingTemplate.length > 0) {
      throw new ForbiddenException(
        `Cannot delete template as it is being used by ${policiesUsingTemplate.length} policies`
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete the template
      await queryRunner.manager.remove(template);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException({
        error: error.message,
        message: "Failed to delete policy template",
      });
    } finally {
      await queryRunner.release();
    }
  }

  async changePolicyStatus(
    id: string,
    status: "published" | "draft"
  ): Promise<PolicyDetails> {
    const policy = await this.policyRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    // Validate status value
    if (status !== "published" && status !== "draft") {
      throw new ForbiddenException(
        'Invalid status value. Must be either "published" or "draft"'
      );
    }

    // Update the status
    policy.status = status;
    policy.updatedAt = new Date();

    // Save the updated policy
    return await this.policyRepo.save(policy);
  }

  async togglePolicyLock(
    id: string,
    is_locked: boolean
  ): Promise<PolicyDetails> {
    const policy = await this.policyRepo.findOne({
      where: { id: parseInt(id) },
    });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    // Update the lock status
    policy.is_locked = is_locked;
    policy.updatedAt = new Date();

    // Save the updated policy
    return await this.policyRepo.save(policy);
  }

  /**
   * Generate policy content from control requirements using AI
   */
  async generatePolicyFromControls(
    controlIds: number[],
    standardId: number,
    policyName?: string
  ): Promise<{
    policy_content: string;
    policy_outline: any;
    suggested_sections: string[];
  }> {
    const controls = await this.controlRepo.find({
      where: { id: In(controlIds) },
    });

    if (controls.length === 0) {
      throw new NotFoundException('No controls found');
    }

    const standard = await this.standardRepo.findOne({
      where: { id: standardId },
    });

    const controlsText = controls.map((c, i) => 
      `${i + 1}. ${c.control_name}\n   Description: ${c.control_text.substring(0, 400)}...\n   Family: ${c.family_name}`
    ).join('\n\n');

    const prompt = `Generate a comprehensive policy document based on the following compliance controls:

Standard: ${standard?.name || 'Unknown'}
Policy Name: ${policyName || 'Compliance Policy'}

Controls:
${controlsText}

Generate:
1. A complete policy document (HTML format, 3-5 pages) that addresses all control requirements
2. A structured outline/sections for the policy
3. Suggested section headings

The policy should:
- Be professional and comprehensive
- Address each control requirement
- Include implementation guidance
- Be suitable for organizational use

Return JSON: { "policy_content": "<html>...</html>", "policy_outline": {...}, "suggested_sections": ["Section 1", ...] }`;

    const systemMessage = `You are a GRC policy writer. Generate professional, comprehensive policy documents that address compliance control requirements.`;

    interface PolicyGenerationResponse {
      policy_content: string;
      policy_outline: any;
      suggested_sections: string[];
    }

    const aiResponse = await this.aiHelper.generateStructuredResponse<PolicyGenerationResponse>(
      prompt,
      systemMessage,
      {
        temperature: 0.6,
        max_tokens: 4000,
      }
    );

    if (!aiResponse) {
      throw new InternalServerErrorException('Failed to generate policy content');
    }

    return aiResponse;
  }

  private async sendToQueue(queueName: string | undefined, payload: any, context: string) {
    if (process.env.AWS_SQS_ENABLED === 'false') {
      console.warn(`SQS disabled; skipping ${context} message`);
      return;
    }
    if (!queueName) {
      console.warn(`SQS queue not configured; skipping ${context} message`);
      return;
    }
    await this.sqsProducerService.send(queueName, payload);
  }
}
