import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  // Res,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Response,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { Response as Res } from "express";

import { AppService } from "./app.service";
import { AuthGuard } from "src/guards/authGuard";
import { OpenAiService } from "src/llms/openAi.service";
import { join } from "path";
import { promises as fs } from "fs";
import { SeedService } from "./seedService";
import { Roles } from "src/decorators/roles.decorator";
import * as metadata from "../common/metadata";
import { FilesInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./fileUpload.service";
import { Readable } from "stream";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { LoggerService } from "src/logger/logger.service";
import { FileDownloadService } from "./fileDownload.service";
import {
  GeneratePresignedUploadUrlRequestArray,
  GeneratePresignedUploadUrlResponse,
} from "./app.dto";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Permission } from "src/entities/permission.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
const userRoles = metadata["userRoles"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; //Bytes

@Controller("app")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly openAiSvc: OpenAiService,
    private readonly seedSvc: SeedService,
    private readonly uploadSvc: UploadService,
    private readonly fileDownloadSvc: FileDownloadService,
    private readonly logger: LoggerService
  ) {}

  @Get()
  welcome(@Request() req: any) {
    return {
      message: `Welcome to ProGRC`,
    };
  }

  //this has to be removed in future.
  @Get("/seed_master-data_in-db")
  async seedData() {
    this.seedSvc.seedData();
    return "seeding data...";
  }

  @Get("/metadata")
  @ApiOperation({ summary: "Fetch Master Data" })
  @ApiResponse({
    status: 200,
    description:
      "Returns the master data like data for dropdowns, pre-defined types etc.",
  })
  getMetadata() {
    return this.appService.getMetadata();
  }

  @Post("/generate_response")
  @ApiOperation({ summary: "Fetch AI generated response for given input" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        section_info: {
          type: "string",
          description: "Needed when some specific section is selected",
        },
        context: {
          type: "string",
          description: "Selected Data Context string",
        },
        prompt: { type: "string", description: "Command for AI tool" },
      },
      required: ["context", "prompt"],
    },
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns the AI generated response for given input. Along with the actual input data.",
  })
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  async generateOpenAiResponse(@Body() body: any, @Response() res: Res) {
    const { section_info, context, prompt } = body;
    let response = "";
    let contentType = "text";
    if (!section_info) {
      response = await this.openAiSvc.generateText(prompt, context);
    } else {
      if (
        section_info
          .toLowerCase()
          .includes(
            "AT-1 Security Awareness and Training Policy and Procedures (H)".toLowerCase()
          )
      ) {
        response = `Sure I have generated a document outlining a training plan for your user based on your current documentation and application design. Please review it at this link <a href="https://doc.progrc.com/dd4624a9-a8d7-486e-9fec-cb1796583821/at1-training-plan">https://doc.progrc.com/dd4624a9-a8d7-486e-9fec-cb1796583821/at1-training-plan</a>`;
      } else if (
        section_info
          .toLowerCase()
          .includes("AC-12 Session Termination (M) (H)".toLowerCase())
      ) {
        const htmlPath = join(`${process.cwd()}/src/public/ac12.html`);
        try {
          response = await fs.readFile(htmlPath, "utf8");
          contentType = "html";
        } catch (error) {
          this.logger.info(error);
          response = "AC-12 Session Termination (M) (H)";
        }
        // return res.sendFile(htmlPath);
      } else if (
        section_info
          .toLowerCase()
          .includes(
            "AC-14 Permitted Actions without Identification or Authentication (L) (M) (H)".toLowerCase()
          )
      ) {
        const htmlPath = join(`${process.cwd()}/src/public/ac14.html`);
        try {
          response = await fs.readFile(htmlPath, "utf8");
          contentType = "html";
        } catch (error) {
          this.logger.info(error);
          response =
            "AC-14 Permitted Actions without Identification or Authentication (L) (M) (H)";
        }
        // return res.sendFile(htmlPath);
      }
    }
    return res.send({
      input: {
        ...body,
      },
      result: response,
      content_type: contentType,
    });
  }

  @Post("/upload_files")
  @ApiOperation({
    summary:
      "Upload File/e to S3. It takes an array of files as input in multipart form data",
  })
  @ApiBody({
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          files_info: {
            type: "string",
            description:
              "A Json String of Array of files info in an predefined order.",
          },
        },
        required: ["files_info"],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns array of objects that contains S3 key for the uploaded files in the same order as requested.",
  })
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @UseInterceptors(FilesInterceptor(`files`, 3))
  uploadFiles(
    @Request() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (files && files.length) {
      if (files.length > 3) {
        throw new BadRequestException({
          message: `Maximum 3 files are allowed to be uploaded at a time.`,
          error: `Maximum 3 files are allowed to be uploaded at a time.`,
        });
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const size = file.size;
        if (size > MAX_FILE_SIZE) {
          throw new BadRequestException({
            message: `Please upload a valid size (MAX 5 MB) file.`,
            error: `Please upload a valid size (MAX 5 MB) file.`,
          });
        }
      }
    } else {
      throw new BadRequestException({
        message: `No files provided for uploading!`,
        error: `No files provided for uploading!`,
      });
    }
    const { files_info } = req.body;
    if (!files_info) {
      throw new BadRequestException({
        message: `Please send files_info in json array.`,
        error: `Please send files_info in json array.`,
      });
    }
    let parsedFilesInfo;
    try {
      parsedFilesInfo = JSON.parse(files_info);
      if (!Array.isArray(parsedFilesInfo)) {
        throw new Error("No/Invalid files_info json array provided.");
      }
      if (files.length !== parsedFilesInfo.length) {
        throw Error(
          `Number of files_info array items should be same as the number of files uploaded.`
        );
      }
      for (let i = 0; i < parsedFilesInfo.length; i++) {
        const currentFile = parsedFilesInfo[i];
        if (!currentFile.file_type) {
          throw new Error("Every files_info object should contain file_type");
        }
        if (!currentFile.file_name) {
          throw new Error("Every files_info object should contain file_name");
        }
      }
      this.logger.info(req?.["user_data"]);

      return this.uploadSvc.uploadFiles(files, parsedFilesInfo, {
        tenant_id: req?.["user_data"]?.tenant_id || -1,
      });
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
        error: error.message,
      });
    }
  }

  @Get(`/download_file`)
  async downloadS3File(@Request() req: any, @Response() res: Res) {
    const { key } = req.query;
    this.logger.info("received key: ", key);

    try {
      const downloadResult = await this.uploadSvc.downloadFromS3(key);
      if (downloadResult && downloadResult.Body) {
        this.logger.info("received object from s3");

        // Set appropriate headers for file download
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${key}"`);

        // Stream the S3 object directly to the response
        const stream = downloadResult.Body as Readable;
        stream.pipe(res).on("error", (err) => {
          this.logger.error("Error piping stream:", err);
          res.status(500).send({
            error: "Error downloading file",
            message: "Error downloading file",
          });
        });
      } else {
        res.status(400).send({
          error: "Unable to download file at the moment!",
          message: "Unable to download file at the moment!",
        });
      }
    } catch (error) {
      this.logger.error("Error downloading from S3:", error);
      res.status(500).send({
        error: "Internal server error",
        message: "Error occurred while downloading file",
      });
    }
  }

  @Post(`/upload/generate-presigned-url`)
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.csm)
  @UseInterceptors(TransformInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    })
  )
  @ApiQuery({ name: "app_id", required: false, type: "number" })
  @ApiQuery({ name: "standard_id", required: false, type: "number" })
  @ApiOperation({ summary: "Generate presigned URL for file upload" })
  @ApiBody({
    type: GeneratePresignedUploadUrlRequestArray,
    examples: {
      example1: {
        summary: "Example request",
        value: {
          items: [
            {
              file_name: "1aws-cfgv-config.json",
              file_type: "source_documents",
              fe_id: "9sd-2sd-as44f-a987",
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns presigned URL for file upload",
    schema: {
      example: {
        code: "200",
        message: "Success",
        data: [
          {
            fe_id: "9sd-2sd-as44f-a987",
            uuid: "a3175549-4707-4a34-b2ae-e83ad0f8b87a",
            url: "https://s3.us-west-2.amazonaws.com/progrc-app-file-uploads-dev/c7e9c58f/source_documents/123/16_1738755624660_1aws-cfgv-config.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUJ3VUDZNMDRD2DBC%2F20250205%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250205T114024Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECsaCXVzLXdlc3QtMiJGMEQCIDUFVmZfwR30A46O9XnE7%2FrzXORFgwVelr2Wc1M8ap6uAiBIXdsNO7AkmHte3kgt3ka%2Fvwwgz07AbVUnVD6bk7%2BTNiq7BQhEEAAaDDI5NjA2MjU1Nzc4NiIMSSSx6CrF4S1J0xhMKpgFSgrvIcHqTDRtSFtiP8ZzsUi5bP%2B1QH8pRKHulHrsZpU6zRV8DFuMSGpD4Rmx2CtVvHh85lGYWbLHqVhHMeEplf%2Fccsdb5NsvxxWP0fK%2F%2BBzK9UBWB707CSU3Btw3fExTtXuNhcjc1xGz6wKE1rdQ2LR8azeN5mG0VrmWuV3u2qdKnHOW7Jzqy120t2ToYr48IV0z57Rr8LrjvMZuN%2Btgavi7Ha4MpCSmkbMcRM0c8ytiXfLAIKFQE6h2KyspbjIn1v%2FY5w41WYr7baGV%2BRXXqgItg9z4HbncSzEu25gtyaqD3r%2BzHsTuHNSU0s8bC5JeFxYb7BK7lIzotLru3pR5ZFsuC4noPN2v8OoPlfsf4SZ7oC4F3xhYaxTqVwun4qDSZjiNQzZByy0vbjPumCqp8%2FEFByYrcMg7dvHvt21mdODqjS7KYwMjKC7kUWAQ0eOpvM2U%2F8cFPOkCFXmTGy2YSnVHpl3AOuUSRjBC%2FgRTE4qE3Jcg2dTDTar5v99RSwiqb8w1qjxGGYVhu%2FznPY9cA7oEs6kqN8MG%2Fw2eNgqO8Qcg4w7kCW4mwLrM6yvWvAeSKTjeWEro6UHQqVFadW0ZaiOv3hTigNUjLSBFCUs4OOswTigg7eIE0Awpkwm1Q%2Bgs9gesNXU6S18wUd5hp%2FN6MiOE26IuUBTveQQKz8NZJilhAGk0IC3aokjB8qaTT41Zu7EB59wDkib3MLNiYej6lB63yOrc61eYpzPMQOIOzqnhwQx654wB3V1Z9%2BInVF5SMhNJAjcSJ0%2FJxTCGyEmzDzycys0diJLoYRm8jnQbfyvX%2BAfFG6bKPLj5B1%2FqN13AlKT85RC6j2gZEsx29zHTt2gE9kycNeIrz23ozBBmE%2BeCfpOyrLS%2FYTCLgo29BjqyAfa3YFy8MYmQ5ePRDEonB%2FzvibOGkn1Td0Kk8MgFY8CcQMKS240clqA1%2BqUIJzEJrDCDYfkvBucJWQ7mvrCN6%2B5cZDkT1HZCROURtQ6A4ZXIyzbOZOn4%2Fpqjf5DW11Vcqi1PUMnpLjPDFzP4WRHdueaQ6tppkVrSVPNpYzfQJd13yri8xMqecwr%2FbSanOfFJHwc6RB%2BLckPiBA%2Fmr1TmUHmN4aadkPXhJxcNhPrlNA27f8s%3D&X-Amz-Signature=87b058e76079c1d27d390cd3285ecfe73f9b4e8cc78332290f72cd2bd57c7458&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject",
          },
        ],
      },
    },
  })
  async generateUploadSignedUrl(
    @Request() req: any,
    @Query("app_id") app_id: number,
    @Query("standard_id") standard_id: number,
    @Body() body: GeneratePresignedUploadUrlRequestArray
  ) {
    try {
      let responseData: GeneratePresignedUploadUrlResponse[] =
        await this.uploadSvc.generateSignedUrl(
          app_id,
          standard_id,
          req?.["user_data"],
          body.items
        );
      return StandardResponse.success("Success", responseData);
    } catch (error) {
      this.logger.error("Error generating the signed url:", error);
      throw error;
    }
  }

  @Post(`/uploads/generate-presigned-url-internal`)
  @UseInterceptors(TransformInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    })
  )
  @ApiQuery({ name: "app_id", required: false, type: "number" })
  @ApiOperation({ summary: "Generate presigned URL for file upload" })
  @ApiBody({
    type: GeneratePresignedUploadUrlRequestArray,
    examples: {
      example1: {
        summary: "Example request",
        value: {
          items: [
            {
              file_name: "1aws-cfgv-config.json",
              file_type: "source_documents",
              fe_id: "9sd-2sd-as44f-a987",
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns presigned URL for file upload",
    schema: {
      example: {
        code: "200",
        message: "Success",
        data: [
          {
            fe_id: "9sd-2sd-as44f-a987",
            uuid: "a3175549-4707-4a34-b2ae-e83ad0f8b87a",
            url: "https://s3.us-west-2.amazonaws.com/progrc-app-file-uploads-dev/c7e9c58f/source_documents/123/16_1738755624660_1aws-cfgv-config.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUJ3VUDZNMDRD2DBC%2F20250205%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250205T114024Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECsaCXVzLXdlc3QtMiJGMEQCIDUFVmZfwR30A46O9XnE7%2FrzXORFgwVelr2Wc1M8ap6uAiBIXdsNO7AkmHte3kgt3ka%2Fvwwgz07AbVUnVD6bk7%2BTNiq7BQhEEAAaDDI5NjA2MjU1Nzc4NiIMSSSx6CrF4S1J0xhMKpgFSgrvIcHqTDRtSFtiP8ZzsUi5bP%2B1QH8pRKHulHrsZpU6zRV8DFuMSGpD4Rmx2CtVvHh85lGYWbLHqVhHMeEplf%2Fccsdb5NsvxxWP0fK%2F%2BBzK9UBWB707CSU3Btw3fExTtXuNhcjc1xGz6wKE1rdQ2LR8azeN5mG0VrmWuV3u2qdKnHOW7Jzqy120t2ToYr48IV0z57Rr8LrjvMZuN%2Btgavi7Ha4MpCSmkbMcRM0c8ytiXfLAIKFQE6h2KyspbjIn1v%2FY5w41WYr7baGV%2BRXXqgItg9z4HbncSzEu25gtyaqD3r%2BzHsTuHNSU0s8bC5JeFxYb7BK7lIzotLru3pR5ZFsuC4noPN2v8OoPlfsf4SZ7oC4F3xhYaxTqVwun4qDSZjiNQzZByy0vbjPumCqp8%2FEFByYrcMg7dvHvt21mdODqjS7KYwMjKC7kUWAQ0eOpvM2U%2F8cFPOkCFXmTGy2YSnVHpl3AOuUSRjBC%2FgRTE4qE3Jcg2dTDTar5v99RSwiqb8w1qjxGGYVhu%2FznPY9cA7oEs6kqN8MG%2Fw2eNgqO8Qcg4w7kCW4mwLrM6yvWvAeSKTjeWEro6UHQqVFadW0ZaiOv3hTigNUjLSBFCUs4OOswTigg7eIE0Awpkwm1Q%2Bgs9gesNXU6S18wUd5hp%2FN6MiOE26IuUBTveQQKz8NZJilhAGk0IC3aokjB8qaTT41Zu7EB59wDkib3MLNiYej6lB63yOrc61eYpzPMQOIOzqnhwQx654wB3V1Z9%2BInVF5SMhNJAjcSJ0%2FJxTCGyEmzDzycys0diJLoYRm8jnQbfyvX%2BAfFG6bKPLj5B1%2FqN13AlKT85RC6j2gZEsx29zHTt2gE9kycNeIrz23ozBBmE%2BeCfpOyrLS%2FYTCLgo29BjqyAfa3YFy8MYmQ5ePRDEonB%2FzvibOGkn1Td0Kk8MgFY8CcQMKS240clqA1%2BqUIJzEJrDCDYfkvBucJWQ7mvrCN6%2B5cZDkT1HZCROURtQ6A4ZXIyzbOZOn4%2Fpqjf5DW11Vcqi1PUMnpLjPDFzP4WRHdueaQ6tppkVrSVPNpYzfQJd13yri8xMqecwr%2FbSanOfFJHwc6RB%2BLckPiBA%2Fmr1TmUHmN4aadkPXhJxcNhPrlNA27f8s%3D&X-Amz-Signature=87b058e76079c1d27d390cd3285ecfe73f9b4e8cc78332290f72cd2bd57c7458&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject",
          },
        ],
      },
    },
  })
  async generateUploadSignedUrlInternal(
    @Request() req: any,
    @Query("app_id") app_id: number,
    @Query("source_id") source_id: number,
    @Body() body: GeneratePresignedUploadUrlRequestArray
  ) {
    try {
      let responseData: GeneratePresignedUploadUrlResponse[] =
        await this.uploadSvc.generateSignedUrl(
          app_id,
          null,
          req?.["user_data"],
          body.items,
          source_id,
          true
        );
      return StandardResponse.success("Success", responseData);
    } catch (error) {
      this.logger.error("Error generating the signed url:", error);
      throw error;
    }
  }

  @Get("/permissions")
  @ApiOperation({ summary: "Fetch permissions" })
  @ApiResponse({
    status: 200,
    description: "Returns a list of permissions",
    schema: {
      example: {
        code: "200",
        message: "Success",
        data: [
          {
            id: 1,
            api_path: "/example/path",
            method: "GET",
            allowed_licenses: ["license1", "license2"],
            allowed_roles: ["role1", "role2"],
            allow_all: false,
            created_at: "2023-10-01T00:00:00.000Z",
            updated_at: "2023-10-01T00:00:00.000Z",
          },
        ],
      },
    },
  })
  async getPermissions() {
    const permissions: Permission[] = await this.appService.getPermissions();
    return StandardResponse.success("Success", permissions);
  }

  @Get("/licenseRules")
  @ApiOperation({ summary: "Fetch license rules" })
  @ApiResponse({
    status: 200,
    description: "Returns a list of license rules",
    schema: {
      example: {
        code: "200",
        message: "Success",
        data: [
          {
            id: 1,
            license_type_id: 1,
            name: "Example Rule",
            number_of_applications: 5,
            number_of_assessments: 10,
            standards_per_application: 3,
            available_standards: ["standard1", "standard2"],
            available_templates: ["template1", "template2"],
            created_at: "2023-10-01T00:00:00.000Z",
            updated_at: "2023-10-01T00:00:00.000Z",
          },
        ],
      },
    },
  })
  async getLicenseRules() {
    const rules: LicenseRule[] = await this.appService.getLicenseRules();
    return StandardResponse.success("Success", rules);
  }
}
