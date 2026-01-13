import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Like, Repository } from "typeorm";
import { AppStandard } from "src/entities/appStandard.entity";
import { App } from "src/entities/app.entity";
import { CrmData } from "src/entities/compliance/crmData.entity";
import { LoggerService } from "src/logger/logger.service";
import { SqsService } from "@ssut/nestjs-sqs";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { parse as csvParse } from "csv-parse/sync";
import { CrmCsvRow } from "../dto/crm.dto";
import { Control } from "src/entities/compliance/control.entity";
import { FileDownloadService } from "src/app/fileDownload.service";
import { CompliancePolicy } from "./compliance.policy";
import {
  ApplicationControlMapping,
  ApplicationControlMappingStatus,
} from "src/entities/compliance/applicationControlMapping.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { FileType } from "src/app/app.dto";
@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(App)
    private readonly appRepo: Repository<App>,
    @InjectRepository(CrmData)
    private readonly crmDataRepo: Repository<CrmData>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMappingRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(ApplicationControlEvidence)
    private readonly appControlEvidenceRepo: Repository<ApplicationControlEvidence>,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    private readonly sqsProducerService: SqsService,
    private readonly s3Service: AwsS3ConfigService,
    private readonly fileDownloadService: FileDownloadService,
    private readonly compliancePolicy: CompliancePolicy
  ) {}

  /**
   * Validates if a file in S3 is a valid CSV file
   * @param filePath The S3 file path to validate
   * @param appId The app id
   * @param standardId The standard id
   * @param customerId The customer id
   * @param saveData Whether to save the data to the database
   * @returns The file content if valid, throws BadRequestException otherwise
   */
  async validateCrmFile(
    filePath: string,
    appId: number,
    standardId: number,
    customerId: string,
    saveData: boolean
  ): Promise<string> {
    if (!filePath) {
      throw new BadRequestException("No file path provided");
    }

    try {
      // Get the file from S3
      const s3Client = this.s3Service.getS3();
      const getCommand = this.s3Service.getObjectCommand(filePath);
      const response = await s3Client.send(getCommand);

      // Check file content type
      const contentType = response.ContentType;
      const fileName = filePath.split("/").pop();

      if (
        !contentType?.includes("csv") &&
        !fileName.toLowerCase().endsWith(".csv")
      ) {
        throw new BadRequestException("Uploaded file must be a CSV file");
      }

      // Use body.transformToByteArray() to convert to Buffer in AWS SDK v3
      const bodyContents = await response.Body.transformToByteArray();
      const buffer = Buffer.from(bodyContents);

      // Try to parse the buffer directly as CSV to validate format
      try {
        const crmCsvRows: CrmCsvRow[] = csvParse(buffer, {
          delimiter: ",",
          columns: true,
          skip_empty_lines: true,
        });

        if (saveData && appId && standardId && customerId) {
          await this.dataSource.transaction(
            async (transactionalEntityManager) => {
              // save the crm data to the database by clubbing the same Control ID in the same csv rows by create a Map with Control ID as the key
              const crmDataMap = new Map<string, CrmData>();
              for (const row of crmCsvRows) {
                row["CRM Provider"] = row["CRM Provider"] || "Palantir";
                let controlName = row["Control ID"];
                // Remove last parenthesis containing a letter if present
                controlName = controlName.replace(/\(([a-z])\)$/, "");
                controlName = controlName.trim();
                const control = await this.controlRepo.findOne({
                  where: { control_name: controlName },
                });
                if (!control) {
                  this.logger.error(
                    `Control not found for control name: ${controlName} for row: ${JSON.stringify(row)}`
                  );
                  continue;
                }
                const controlId = control.id;
                if (crmDataMap.has(controlName)) {
                  // for existing data, append the new data to the existing data
                  // 1. append the crm_parameters = existingData.crm_parameters.concat(', ', row['Control ID']+`[row['CRM Status']]`)
                  // 2. append the crm_status = if(row['CRM Status'] == 'Partial' || existingData.crm_status == 'Partial' ? 'Partial' : 'Yes')
                  // 3. append the crm_explanation = addedExplaination = row['CRM Status'] == 'Partial' ? row['CRM Explanation'] : row['CRM Explanation']+"\n"+row['CRM Parameters']; existingData.crm_explanation.concat('\n\n', addedExplanation)
                  // 5. append the partner_instructions = existingData.partner_instructions.concat('\n\n', row['CRM Explanation'])
                  // 6. append the end_customer_instructions = existingData.end_customer_instructions.concat('\n\n', row['CRM Parameters'])
                  const existingData = crmDataMap.get(controlName);
                  existingData.crm_parameters =
                    existingData.crm_parameters.concat(
                      "\n",
                      row["Control ID"] + ` [${row["CRM Status"]}]`
                    );
                  existingData.crm_status =
                    row["CRM Status"] == "Partial" ||
                    existingData.crm_status == "Partial"
                      ? "Partial"
                      : "Yes";
                  const addedExplanation = `${row["Control ID"]} is implemented by ${row["CRM Provider"]}`;
                  existingData.crm_explanation =
                    existingData.crm_explanation.concat(
                      "\n\n",
                      addedExplanation
                    );
                  existingData.partner_instructions =
                    row["CRM Explanation"].trim().length > 0
                      ? existingData.partner_instructions.concat(
                          "\n\n",
                          row["CRM Explanation"]
                        )
                      : existingData.partner_instructions;
                  existingData.end_customer_instructions =
                    row["CRM Parameters"].trim().length > 0
                      ? existingData.end_customer_instructions.concat(
                          "\n\n",
                          row["CRM Parameters"]
                        )
                      : existingData.end_customer_instructions;
                } else {
                  // for new data, create a new CrmData object with same logic as above but not appending the data to the existing data
                  crmDataMap.set(
                    controlName,
                    this.crmDataRepo.create({
                      control_id: controlId,
                      crm_parameters:
                        row["Control ID"] + ` [${row["CRM Status"]}]`,
                      crm_status:
                        row["CRM Status"].trim().toLowerCase() == "partial"
                          ? "Partial"
                          : "Yes",
                      crm_explanation: `${row["Control ID"]} is implemented by ${row["CRM Provider"]}`,
                      crm_provider: row["CRM Provider"],
                      partner_instructions: row["CRM Explanation"],
                      end_customer_instructions: row["CRM Parameters"],
                      app_id: appId,
                      standard_id: standardId,
                      customer_id: customerId,
                    })
                  );
                }
              }

              const crmExistingData = await transactionalEntityManager.find(
                CrmData,
                { where: { app_id: appId, standard_id: standardId } }
              );

              if (crmExistingData.length > 0) {
                // delete the existing crm data from the database
                for (const crm of crmExistingData) {
                  const appControlMapping =
                    await this.appControlMappingRepo.findOne({
                      where: {
                        app_id: appId,
                        standard_id: standardId,
                        control_id: crm.control_id,
                      },
                    });
                  if (appControlMapping) {
                    await this.appControlEvidenceRepo.delete({
                      application_control_mapping_id: appControlMapping.id,
                      document: Like(
                        `${customerId}/${appId}/${standardId}/${FileType.CRM_DOCUMENTS}/%`
                      ),
                    });
                    if (crm.crm_status.toLocaleLowerCase().trim() == "yes") {
                      appControlMapping.user_implementation_status = null;
                      appControlMapping.user_implementation_explanation = null;
                      appControlMapping.user_additional_parameter = null;

                      // delete the existing evidence for the app control mapping where document starts with ${customerId}/${appId}/${standardId}/${FileType.CRM_DOCUMENTS}/
                      await this.appControlMappingRepo.save(appControlMapping);
                    }
                  }
                }
              }

              this.logger.info(`crmExistingData: ${crmExistingData.length}`);

              // save the crm data to the database
              await transactionalEntityManager.save(
                Array.from(crmDataMap.values())
              );

              for (const crm of crmDataMap.values()) {
                const appControlMapping =
                  await transactionalEntityManager.findOne(
                    ApplicationControlMapping,
                    {
                      where: {
                        app_id: appId,
                        standard_id: standardId,
                        control_id: crm.control_id,
                      },
                    }
                  );
                if (appControlMapping) {
                  const evidence = this.appControlEvidenceRepo.create({
                    application_control_mapping_id: appControlMapping.id,
                    document: filePath,
                    description: "CRM file uploaded by the user",
                  });
                  await transactionalEntityManager.save(evidence);

                  if (crm.crm_status.toLocaleLowerCase().trim() == "yes") {
                    appControlMapping.user_implementation_status =
                      ApplicationControlMappingStatus.IMPLEMENTED;
                    appControlMapping.user_implementation_explanation =
                      crm.crm_explanation;
                    appControlMapping.user_additional_parameter =
                      crm.crm_parameters;
                    appControlMapping.percentage_completion = 100;

                    await transactionalEntityManager.save(appControlMapping);
                  }
                } else {
                  this.logger.warn(
                    `App control mapping not found for control id: ${crm.control_id}`
                  );
                }
              }

              if (crmExistingData.length > 0) {
                // delete the existing crm data from the database
                const crmDataIds = crmExistingData.map((data) => data.id);
                await transactionalEntityManager.delete(CrmData, crmDataIds);
              }

              // mark the app_standard.have_pending_compliance to true
              await transactionalEntityManager.update(
                AppStandard,
                { app_id: appId, standard_id: standardId },
                { have_pending_compliance: true }
              );

              // update the async task status to COMPLETED
            }
          );
        }

        // Return the file content as string for convenience
        return buffer.toString();
      } catch (parseError) {
        this.logger.error("CSV parse error:", parseError);
        throw new BadRequestException("Uploaded file is not a valid CSV file");
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error("Error validating CRM file", { error });
      throw new BadRequestException(
        `Failed to validate CRM file: ${error.message}`
      );
    }
  }

  /**
   * Update CRM file path and send SQS message to process the file
   */
  async updateCrmFile(
    userInfo: any,
    appId: number,
    standardId: number
  ): Promise<{ message: string; taskId: number }> {
    // Validate app and user access
    const app = await this.appRepo.findOne({
      where: { id: appId },
    });

    if (!app) {
      throw new NotFoundException(`App with ID ${appId} not found`);
    }

    if (app.customer_id !== userInfo.tenant_id) {
      throw new ForbiddenException(
        "You do not have permission to update CRM for this app"
      );
    }

    const appStandard = await this.appStandardRepo.findOne({
      where: { app_id: appId, standard_id: standardId },
    });

    if (!appStandard) {
      throw new NotFoundException(
        `App standard with app ID ${appId} and standard ID ${standardId} not found`
      );
    }

    await this.compliancePolicy.canUploadCRMFile(userInfo, appId, standardId);

    // Check if the temporary file exists and is a CSV
    if (!appStandard.temp_crm_file_path) {
      throw new BadRequestException(
        "No temporary CRM file found. Please upload a file first."
      );
    }

    // Validate that the file is a CSV file using the extracted method
    let filePath = appStandard.temp_crm_file_path;
    // Get the file from S3
    const s3Client = this.s3Service.getS3();
    const getCommand = this.s3Service.getObjectCommand(filePath);
    const response = await s3Client.send(getCommand);

    // Check file content type
    const contentType = response.ContentType;
    const fileName = filePath.split("/").pop();

    if (
      !contentType?.includes("csv") &&
      !fileName.toLowerCase().endsWith(".csv")
    ) {
      throw new BadRequestException("Uploaded file must be a CSV file");
    }

    // Use body.transformToByteArray() to convert to Buffer in AWS SDK v3
    const bodyContents = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bodyContents);

    try {
      csvParse(buffer, {
        delimiter: ",",
        columns: true,
        skip_empty_lines: true,
      });
    } catch (error) {
      this.logger.error("Error validating CRM file", { error });
      throw new BadRequestException(
        `Failed to validate CRM file: ${error.message}`
      );
    }

    // Start a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the app standard with the CRM file path
      appStandard.crm_file_path = appStandard.temp_crm_file_path;
      appStandard.temp_crm_file_path = null;
      appStandard.is_crm_available = true; // Set to false until processed
      appStandard.updated_at = new Date();
      appStandard.crm_file_uploaded_at = new Date();

      await queryRunner.manager.save(appStandard);

      // Prepare task for SQS message
      const task = this.asyncTaskRepo.create({
        ops: TaskOps.PROCESS_CRM,
        status: TaskStatus.PENDING,
        request_payload: {
          appId,
          standardId,
          filePath: appStandard.crm_file_path,
          customerId: userInfo.tenant_id,
        },
        customer_id: userInfo.tenant_id,
        created_by: userInfo.userId,
        app_id: appId,
        entity_id: `${appId}_${standardId}`,
        entity_type: "app_standards",
      });

      const createdTask = await queryRunner.manager.save(task);

      // Prepare and send SQS message
      const message = {
        taskId: createdTask.id,
        appId,
        standardId,
        filePath: appStandard.crm_file_path,
        customerId: userInfo.tenant_id,
        messageType: TaskOps.PROCESS_CRM,
      };
      await queryRunner.commitTransaction();

      await this.sendToQueue(process.env.BACKEND_QUEUE_NAME, {
        id: createdTask.id.toString(),
        body: { type: "compliance", payload: message },
        messageAttributes: {
          messageType: {
            DataType: "String",
            StringValue: TaskOps.PROCESS_CRM,
          },
        },
      }, 'crm processing');

      return {
        message: "CRM file updated and processing initiated",
        taskId: createdTask.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Error updating CRM file", { error });
      throw new BadRequestException(
        `Failed to update CRM file: ${error.message}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCrmFile(
    userInfo: any,
    appId: number,
    standardId: number
  ): Promise<void> {
    const appStandard = await this.appStandardRepo.findOne({
      where: { app_id: appId, standard_id: standardId },
    });

    if (!appStandard) {
      throw new NotFoundException(
        `App standard with app ID ${appId} and standard ID ${standardId} not found`
      );
    }

    await this.compliancePolicy.canDeleteCRMFile(userInfo, appId, standardId);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const crmDataAll: CrmData[] = await transactionalEntityManager.find(
        CrmData,
        { where: { app_id: appId, standard_id: standardId } }
      );

      for (const crm of crmDataAll) {
        const appControlMapping = await transactionalEntityManager.findOne(
          ApplicationControlMapping,
          {
            where: {
              app_id: appId,
              standard_id: standardId,
              control_id: crm.control_id,
            },
          }
        );
        if (appControlMapping) {
          appControlMapping.user_implementation_status = null;
          appControlMapping.user_implementation_explanation = null;
          appControlMapping.user_additional_parameter = null;
          await transactionalEntityManager.delete(ApplicationControlEvidence, {
            application_control_mapping_id: appControlMapping.id,
            document: appStandard.crm_file_path,
          });
          await transactionalEntityManager.save(appControlMapping);
        }
      }

      await transactionalEntityManager.delete(CrmData, {
        app_id: appId,
        standard_id: standardId,
      });
      const crm_file_path = appStandard.crm_file_path;
      const temp_crm_file_path = appStandard.temp_crm_file_path;
      await transactionalEntityManager.update(
        AppStandard,
        { app_id: appId, standard_id: standardId },
        {
          is_crm_available: false,
          updated_at: new Date(),
          crm_file_path: null,
          temp_crm_file_path: null,
          source_updated_at: new Date(),
        }
      );
      if (crm_file_path) {
        const s3Client = this.s3Service.getS3();
        const deleteCommand = this.s3Service.deleteObjectCommand(crm_file_path);
        await s3Client.send(deleteCommand);
      }
      if (temp_crm_file_path) {
        const s3Client = this.s3Service.getS3();
        const deleteCommand =
          this.s3Service.deleteObjectCommand(temp_crm_file_path);
        await s3Client.send(deleteCommand);
      }
    });
  }

  async getCRMFile(
    userInfo: any,
    appId: number,
    standardId: number
  ): Promise<any> {
    const appStandard = await this.appStandardRepo.findOne({
      where: { app_id: appId, standard_id: standardId },
    });

    if (!appStandard) {
      throw new NotFoundException(
        `App standard with app ID ${appId} and standard ID ${standardId} not found`
      );
    }

    if (!appStandard.is_crm_available) {
      throw new NotFoundException(
        `CRM file for app ID ${appId} and standard ID ${standardId} not found`
      );
    }

    await this.compliancePolicy.canDownloadCRMFile(userInfo, appId, standardId);

    const fileKey = appStandard.crm_file_path;
    if (!fileKey) {
      throw new NotFoundException(
        `File not found for app with Id ${appId} and standard with ID ${standardId}.`
      );
    }
    const downloadUrl =
      await this.fileDownloadService.generateSignedUrl(fileKey);

    return {
      downloadUrl,
      fileName: fileKey.split("/").pop(),
      crm_file_uploaded_at: appStandard.crm_file_uploaded_at,
      is_crm_available: appStandard.is_crm_available,
    };
  }

  async processCrm(message: any): Promise<void> {
    let body: any = {};
    if(typeof message === 'string') {
      body = JSON.parse(message);
    } else if(typeof message === 'object') {
      body = message;
    } else {
      this.logger.error('Invalid message type');
      return;
    }
    const taskId = body.taskId;
    const appId = body.appId;
    const standardId = body.standardId;
    const filePath = body.filePath;
    const customerId = body.customerId;
    const messageType = body.messageType;
    const task = await this.asyncTaskRepo.findOne({
      where: { id: taskId },
    });
    if (!task) {
      this.logger.error(`Task with ID ${taskId} not found`);
    }
    if (task.status !== TaskStatus.PENDING) {
      this.logger.error(`Task with ID ${taskId} is not pending`);
    }
    if (task.ops !== TaskOps.PROCESS_CRM) {
      this.logger.error(`Task with ID ${taskId} is not PROCESS_CRM`);
    }

    try {
      // put task in process
      await this.asyncTaskRepo.update(taskId, {
        status: TaskStatus.IN_PROCESS,
      });
      const source_updated_at = new Date();

      // fetch the csv file from s3
      const s3Client = this.s3Service.getS3();
      const getCommand = this.s3Service.getObjectCommand(filePath);
      const response = await s3Client.send(getCommand);

      // Convert S3 response to Buffer
      const bodyContents = await response.Body.transformToByteArray();
      const buffer = Buffer.from(bodyContents);

      this.logger.info(`CSV data length: ${buffer.length} bytes`);

      // parse the csv file from buffer
      const crmCsvRows: CrmCsvRow[] = csvParse(buffer, {
        delimiter: ",",
        columns: true, // Parse headers
        skip_empty_lines: true,
      });

      if (crmCsvRows.length == 0) {
        this.logger.error(`taskId ${taskId} : No data found in the CRM file`);
        await this.asyncTaskRepo.update(taskId, { status: TaskStatus.FAILED });
        return;
      }

      this.logger.info(`Processed ${crmCsvRows.length} rows`);
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          AppStandard,
          { app_id: parseInt(appId), standard_id: parseInt(standardId) },
          { source_updated_at: source_updated_at }
        );
        // save the crm data to the database by clubbing the same Control ID in the same csv rows by create a Map with Control ID as the key
        const crmDataMap = new Map<string, CrmData>();
        for (const row of crmCsvRows) {
          row["CRM Provider"] = row["CRM Provider"] || "Palantir";
          let controlName = row["Control ID"];
          // Remove last parenthesis containing a letter if present
          controlName = controlName.replace(/\(([a-z])\)$/, "");
          controlName = controlName.trim();
          const control = await this.controlRepo.findOne({
            where: { control_name: controlName },
          });
          if (!control) {
            this.logger.error(
              `taskId ${taskId} : Control not found for control name: ${controlName} for row: ${JSON.stringify(row)}`
            );
            continue;
          }
          const controlId = control.id;
          if (crmDataMap.has(controlName)) {
            // for existing data, append the new data to the existing data
            // 1. append the crm_parameters = existingData.crm_parameters.concat(', ', row['Control ID']+`[row['CRM Status']]`)
            // 2. append the crm_status = if(row['CRM Status'] == 'Partial' || existingData.crm_status == 'Partial' ? 'Partial' : 'Yes')
            // 3. append the crm_explanation = addedExplaination = row['CRM Status'] == 'Partial' ? row['CRM Explanation'] : row['CRM Explanation']+"\n"+row['CRM Parameters']; existingData.crm_explanation.concat('\n\n', addedExplanation)
            // 5. append the partner_instructions = existingData.partner_instructions.concat('\n\n', row['CRM Explanation'])
            // 6. append the end_customer_instructions = existingData.end_customer_instructions.concat('\n\n', row['CRM Parameters'])
            const existingData = crmDataMap.get(controlName);
            existingData.crm_parameters = existingData.crm_parameters.concat(
              "\n",
              row["Control ID"] + ` [${row["CRM Status"]}]`
            );
            existingData.crm_status =
              row["CRM Status"] == "Partial" ||
              existingData.crm_status == "Partial"
                ? "Partial"
                : "Yes";
            const addedExplanation = `${row["Control ID"]} is implemented by ${row["CRM Provider"]}`;
            existingData.crm_explanation = existingData.crm_explanation.concat(
              "\n\n",
              addedExplanation
            );
            existingData.partner_instructions =
              row["CRM Explanation"].trim().length > 0
                ? existingData.partner_instructions.concat(
                    "\n\n",
                    row["CRM Explanation"]
                  )
                : existingData.partner_instructions;
            existingData.end_customer_instructions =
              row["CRM Parameters"].trim().length > 0
                ? existingData.end_customer_instructions.concat(
                    "\n\n",
                    row["CRM Parameters"]
                  )
                : existingData.end_customer_instructions;
          } else {
            // for new data, create a new CrmData object with same logic as above but not appending the data to the existing data
            crmDataMap.set(
              controlName,
              this.crmDataRepo.create({
                control_id: controlId,
                crm_parameters: row["Control ID"] + ` [${row["CRM Status"]}]`,
                crm_status:
                  row["CRM Status"].trim().toLowerCase() == "partial"
                    ? "Partial"
                    : "Yes",
                crm_explanation: `${row["Control ID"]} is implemented by ${row["CRM Provider"]}`,
                crm_provider: row["CRM Provider"],
                partner_instructions: row["CRM Explanation"],
                end_customer_instructions: row["CRM Parameters"],
                app_id: parseInt(appId),
                standard_id: parseInt(standardId),
                customer_id: customerId,
              })
            );
          }
        }

        const crmExistingData = await transactionalEntityManager.find(CrmData, {
          where: { app_id: parseInt(appId), standard_id: parseInt(standardId) },
        });

        if (crmExistingData.length > 0) {
          // delete the existing crm data from the database
          for (const crm of crmExistingData) {
            const appControlMapping = await this.appControlMappingRepo.findOne({
              where: {
                app_id: parseInt(appId),
                standard_id: parseInt(standardId),
                control_id: crm.control_id,
              },
            });
            if (appControlMapping) {
              await this.appControlEvidenceRepo.delete({
                application_control_mapping_id: appControlMapping.id,
                document: Like(
                  `${customerId}/${appId}/${standardId}/${FileType.CRM_DOCUMENTS}/%`
                ),
              });
              if (crm.crm_status.toLocaleLowerCase().trim() == "yes") {
                appControlMapping.user_implementation_status = null;
                appControlMapping.user_implementation_explanation = null;
                appControlMapping.user_additional_parameter = null;

                // delete the existing evidence for the app control mapping where document starts with ${customerId}/${appId}/${standardId}/${FileType.CRM_DOCUMENTS}/
                await this.appControlMappingRepo.save(appControlMapping);
              }
            }
          }
        }

        this.logger.info(`crmExistingData: ${crmExistingData.length}`);

        // save the crm data to the database
        await transactionalEntityManager.save(Array.from(crmDataMap.values()));

        for (const crm of crmDataMap.values()) {
          const appControlMapping = await transactionalEntityManager.findOne(
            ApplicationControlMapping,
            {
              where: {
                app_id: parseInt(appId),
                standard_id: parseInt(standardId),
                control_id: crm.control_id,
              },
            }
          );
          if (appControlMapping) {
            const evidence = this.appControlEvidenceRepo.create({
              application_control_mapping_id: appControlMapping.id,
              document: filePath,
              description: "CRM file uploaded by the user",
            });
            await transactionalEntityManager.save(evidence);
            if (crm.crm_status.toLocaleLowerCase().trim() == "yes") {
              appControlMapping.user_implementation_status =
                ApplicationControlMappingStatus.IMPLEMENTED;
              appControlMapping.user_implementation_explanation =
                crm.crm_explanation;
              appControlMapping.user_additional_parameter = crm.crm_parameters;
              appControlMapping.percentage_completion = 100;
              await transactionalEntityManager.save(appControlMapping);
            }
          } else {
            this.logger.warn(
              `taskId ${taskId} : App control mapping not found for control id: ${crm.control_id}`
            );
          }
        }

        if (crmExistingData.length > 0) {
          // delete the existing crm data from the database
          const crmDataIds = crmExistingData.map((data) => data.id);
          await transactionalEntityManager.delete(CrmData, crmDataIds);
        }

        // update the async task status to COMPLETED
        await transactionalEntityManager.update(AsyncTask, taskId, {
          status: TaskStatus.PROCESSED,
        });
      });
    } catch (error) {
      this.logger.error("Error processing CRM file", {
        error: error.message,
        stack: error.stack,
        taskId,
        appId,
        standardId,
        filePath,
      });

      // Update task status to ERROR
      await this.asyncTaskRepo.update(taskId, {
        status: TaskStatus.FAILED,
      });
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
