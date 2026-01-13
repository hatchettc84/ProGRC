import { AuthenticatedRequest } from "src/common/interfaces";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Roles } from "src/decorators/roles.decorator";
import { SourceType } from "src/entities/source/sourceType.entity";
import { AuthGuard } from "src/guards/authGuard";
import * as metadata from "../common/metadata";
import { SourcesService } from "./sources.service";
import { Response } from "express";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { ControlEvidenceV2Service } from "src/compliance/service/controlEvidenceV2.service";
import {
  SourceFileUpdateRequest,
  SourceFileUpdateRequestArray,
  SourceFileUpdateResponse,
} from "./source.dto";
import { deprecate } from "node:util";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { LoggerService } from "src/logger/logger.service";
import { SourceTextService } from "./sourceText.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

const userRoles = metadata["userRoles"];

@ApiTags("Sources")
@Controller("app")
export class SourcesController {
  constructor(
    private sourcesSvc: SourcesService,
    private readonly controlEvidenceV2Service: ControlEvidenceV2Service,
    private readonly logger: LoggerService,
    private readonly sourceTextService: SourceTextService
  ) {}

  @Post("source_type")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.super_admin)
  async createSourceType(@Request() req: AuthenticatedRequest): Promise<SourceType> {
    const { name } = req.body;

    if (!name) {
      throw new HttpException(
        "Name and created_by are required",
        HttpStatus.BAD_REQUEST
      );
    }

    return this.sourcesSvc.createSourceType(req.body, req["user_data"]);
  }

  // Get all source types
  @Get("source_type")
  @UseGuards(JwtAuthGuard)
  @Roles(
    userRoles.super_admin,
    userRoles.org_admin,
    userRoles.org_member,
    userRoles.auditor
  )
  async getAllSourceTypes(
    @Request() req: AuthenticatedRequest,
    @Query("appId") appId: any
  ): Promise<SourceType[]> {
    return this.sourcesSvc.getAllSourceTypes(req["user_data"], appId);
  }

  // Get a source type by id
  @Get("source_type/:id")
  @UseGuards(JwtAuthGuard)
  @Roles(
    userRoles.super_admin,
    userRoles.org_admin,
    userRoles.org_member,
    userRoles.auditor
  )
  async getSourceTypeById(
    @Param("id") id: number,
    @Request() req: AuthenticatedRequest
  ): Promise<SourceType> {
    return this.sourcesSvc.getSourceTypeById(id, req["user_data"]);
  }

  @Get("source_type/:id") // changed from name to id
  @UseGuards(JwtAuthGuard)
  @Roles(
    userRoles.super_admin,
    userRoles.org_admin,
    userRoles.org_member,
    userRoles.auditor
  )
  async getSourceTypeByName(
    @Param("id") id: number,
    @Request() req: AuthenticatedRequest
  ): Promise<SourceType> {
    return this.sourcesSvc.getSourceTypeById(id, req["user_data"]);
  }

  // Update a source type by id
  @Put("source_type/:id")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.super_admin)
  async updateSourceType(
    @Param("id") id: number,
    @Request() req: AuthenticatedRequest
  ): Promise<SourceType> {
    const { name } = req.body;

    if (!name) {
      throw new HttpException(
        "Name and updated_by are required",
        HttpStatus.BAD_REQUEST
      );
    }

    return this.sourcesSvc.updateSourceType(id, req["user_data"], req.body);
  }

  // Delete a source type by id
  @Delete("source_type/:id")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.super_admin)
  async deleteSourceType(
    @Param("id") id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<void> {
    return this.sourcesSvc.deleteSourceType(id, req["user_data"]);
  }

  // To-Do: need to remove this endpoint
  @Post("sources/upload")
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
  uploadTemplate(
    @Request() req: AuthenticatedRequest,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.sourcesSvc.uploadSourceToS3(req, files);
  }

  @Get("source_details/:appId")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  @ApiParam({
    name: "appId",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns array of objects that contains the sourceType Details and source assets count",
  })
  async sourceDetails(
    @Request() req: AuthenticatedRequest,
    @Param("appId") appId: number
  ): Promise<any> {
    return this.sourcesSvc.getSourceDetails(
      req.body,
      req["user_data"],
      this.changeValidAppId(appId)
    );
  }

  private changeValidAppId(appId: number): number {
    const appIdNum = appId ? Number(appId) : undefined;
    if (appId && isNaN(appIdNum)) {
      throw new BadRequestException("Invalid appId. Must be a valid number.");
    }
    return +appId;
  }

  @Get("sources/download")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  async downloadFile(
    @Request() req: AuthenticatedRequest,
    @Query("fileKey") fileKey: string,
    @Res() res: Response
  ) {
    try {
      const fileStream = await this.sourcesSvc.downloadSourceFromS3(
        req["user_data"],
        fileKey
      );

      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileKey}"`,
      });

      fileStream.pipe(res);
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.error || "Internal Server Error",
        message: error.message || "An unexpected error occurred.",
      });
    }
  }

  //------------------ new sources flow ------------------//

  // To-Do: need to delete
  @Post("source_v2") //create new source info
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  addSourceDetail(@Request() req: AuthenticatedRequest) {
    return this.sourcesSvc.addSourceDetails_v2(req.body, req["user_data"]);
  }

  @Get("source/:id")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  async getSourceV2ById(
    @Request() req: AuthenticatedRequest,
    @Param("id") id: number
  ): Promise<SourceV1> {
    return this.sourcesSvc.getSourceV2ById(id, req["user_data"]);
  }

  @Get("source")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  @ApiQuery({ name: "limit", description: "How many to fetch at a time" })
  @ApiQuery({ name: "offset", description: "How many to skip" })
  @ApiResponse({
    status: 200,
    description: "Source Data",
    schema: {
      type: "object",
      properties: {
        code: { type: "string", example: "200" },
        message: { type: "string", example: "Success" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              source_id: {
                type: "string",
                example: "3ee5bd49-5c6e-48fa-aa09-fb8b5ca66d1d",
              },
              source_tenant_id: { type: "number", example: 50001 },
              source_source_type: {
                type: "string",
                example: "2069d7bf-244c-48c1-8f30-4a00dfd226c8",
              },
              source_current_version: {
                type: "string",
                example: "5b62b9e1-83cd-4f8a-a4b7-d549adca9ae1",
              },
              source_app_id: {
                type: "string",
                example: "64db7726-8dac-4e7e-ba3d-dec654bc178c",
              },
              source_data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", example: "Column" },
                    children: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", example: "Text" },
                          key: { type: "string", example: "accountName" },
                          label: { type: "string", example: "Name of File" },
                          placeholder: {
                            type: "string",
                            example: "Example Name",
                          },
                        },
                      },
                    },
                  },
                },
              },
              source_created_at: {
                type: "string",
                format: "date-time",
                example: "2024-10-22T05:28:37.221Z",
              },
              source_updated_at: {
                type: "string",
                format: "date-time",
                example: "2024-10-22T05:28:37.221Z",
              },
              source_type_name: { type: "string", example: "AWS" },
            },
          },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number", example: 1 },
            limit: { type: "number", example: 10 },
            offset: { type: "number", example: 0 },
          },
        },
      },
    },
  })
  async getAllSourcesV2(
    @Request() req: AuthenticatedRequest,
    @Query("appId") appId?: number,
    @Query("sourceName") sourceName?: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ): Promise<StandardResponse> {
    const limitVal = limit ? +limit : 10;
    const offsetVal = offset ? +offset : 0;

    const [sources, total] = await this.sourcesSvc.getAllSourcesV2(
      req["user_data"],
      this.changeValidAppId(appId),
      sourceName,
      limitVal,
      offsetVal
    );
    return StandardResponse.successWithTotal(
      "Success",
      sources.map((source) => {
        return {
          name: source.name,
          source_id: source.id,
          source_tenant_id: source.customer_id,
          source_source_type: source.source_type,
          source_current_version: source.current_version,
          source_app_id: source.app_id,
          source_data: source.data,
          source_created_at: source.created_at,
          source_updated_at: source.updated_at,
          source_type_name: source.source_type_name,
          file_bucket_key: source.file_bucket_key,
          is_text_available: source.is_text_available,
          text_version: source.text_version,
          text_s3_path: source.text_s3_path,
          text_config: source.text_config,
          text_created_at: source.text_created_at,
          text_updated_at: source.text_updated_at,
          tags: source.tags || [],
          control_mappings: source.control_mapping || [],
        };
      }),
      { total, limit: limitVal, offset: offsetVal }
    );
  }

  @Delete("source/:sourceId")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiParam({
    name: "sourceId",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: "appId",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns array of objects that contains the sourceType Details and source assets count",
  })
  async sourceDeleteV2(
    @Request() req: AuthenticatedRequest,
    @Param("sourceId") sourceId: number,
    @Query("appId") appId?: number
  ): Promise<any> {
    return this.sourcesSvc.deleteSourceV2(
      req["user_data"],
      this.changeValidAppId(appId),
      sourceId
    );
  }

  @Put("source/:sourceId")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiParam({
    name: "sourceId",
    description: "The ID of the source",
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: "isRetriggered",
    description: "The ID of the application",
    required: false,
    type: Boolean,
  })
  updateSourceDetail(
    @Request() req: AuthenticatedRequest,
    @Param("sourceId") sourceId: number,
    @Query("isRetriggered") isRetriggered: boolean = false
  ) {
    return this.sourcesSvc.updateSourceDetails(
      req.body,
      req["user_data"],
      sourceId,
      isRetriggered
    );
  }

  @Get("evidences/:appId")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  @ApiParam({
    name: "appId",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns array of objects that contains the sourceType Details and source assets count",
  })
  async getEvidences(
    @Request() req: AuthenticatedRequest,
    @Param("appId") appId: number
  ): Promise<any> {
    return this.controlEvidenceV2Service.getControlEvidence(
      req["user_data"],
      this.changeValidAppId(appId)
    );
  }

  @Get("tags")
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
  async getTags(
    @Request() req: AuthenticatedRequest,
    @Query("appId") appId?: number
  ): Promise<any> {
    return this.sourcesSvc.getTags(req["user_data"], appId);
  }

  @Patch(":app_id/sources")
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
  @ApiOperation({ summary: "Update source files" })
  @ApiParam({
    name: "app_id",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              uuid: {
                type: "string",
                example: "508ebe36-63e5-4c20-830c-6d0574612ad2",
              },
              control_ids: {
                type: "array",
                items: { type: "number" },
                example: [1, 2],
              },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["Tag-1", "Tag-2"],
              },
            },
            required: ["uuid"],
          },
        },
      },
      required: ["items"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns the update status and UUID for each file",
    schema: {
      type: "object",
      properties: {
        code: { type: "string", example: "200" },
        message: { type: "string", example: "Success" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              update: { type: "boolean", example: true },
              uuid: {
                type: "string",
                example: "508ebe36-63e5-4c20-830c-6d0574612ad2",
              },
            },
          },
        },
      },
    },
  })
  async updateSourceFiles(
    @Request() req: AuthenticatedRequest,
    @Param("app_id") appId: number,
    @Body() body: SourceFileUpdateRequestArray
  ) {
    try {
      let responseData: SourceFileUpdateResponse[] =
        await this.sourcesSvc.updateSourceFiles(
          req["user_data"],
          appId,
          body.items
        );
      return StandardResponse.success("Success", responseData);
    } catch (error) {
      this.logger.error("Error uploading the sources:", error);
      throw error;
    }
  }

  @Patch(":app_id/sources-internal")
  @UseInterceptors(TransformInterceptor)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    })
  )
  @ApiOperation({ summary: "Update source files" })
  @ApiParam({
    name: "app_id",
    description: "The ID of the application",
    required: true,
    type: Number,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              uuid: {
                type: "string",
                example: "508ebe36-63e5-4c20-830c-6d0574612ad2",
              },
              control_ids: {
                type: "array",
                items: { type: "number" },
                example: [1, 2],
              },
              tags: {
                type: "array",
                items: { type: "string" },
                example: ["Tag-1", "Tag-2"],
              },
            },
            required: ["uuid"],
          },
        },
      },
      required: ["items"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns the update status and UUID for each file",
    schema: {
      type: "object",
      properties: {
        code: { type: "string", example: "200" },
        message: { type: "string", example: "Success" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              update: { type: "boolean", example: true },
              uuid: {
                type: "string",
                example: "508ebe36-63e5-4c20-830c-6d0574612ad2",
              },
            },
          },
        },
      },
    },
  })
  async updateSourceFilesInternal(
    @Request() req: AuthenticatedRequest,
    @Param("app_id") appId: number,
    @Query("connection_id") connectionId: number,
    @Body() body: SourceFileUpdateRequestArray
  ) {
    try {
      let responseData: SourceFileUpdateResponse[] =
        await this.sourcesSvc.updateSourceFiles(
          req["user_data"],
          appId,
          body.items,
          true,
          connectionId
        );
      return StandardResponse.success("Success", responseData);
    } catch (error) {
      this.logger.error("Error uploading the sources:", error);
      throw error;
    }
  }

  @Get(`/:app_id/download/source/:source_id`)
  @UseGuards(JwtAuthGuard)
  @Roles(
    userRoles.org_admin,
    userRoles.org_member,
    userRoles.csm,
    userRoles.super_admin_readonly,
    userRoles.auditor
  )
  @UseInterceptors(TransformInterceptor)
  async generateDownloadSignedUrl(
    @Request() req: AuthenticatedRequest,
    @Param("app_id") app_id: number,
    @Param("source_id") source_id: number
  ) {
    try {
      const response: any = await this.sourcesSvc.downloadSourceById(
        req?.["user_data"],
        app_id,
        source_id
      );
      return StandardResponse.success("Success", response);
    } catch (error) {
      this.logger.error("Error generating the signed url:", error);
      throw error;
    }
  }

  @Get(`/:app_id/download/source-text/:source_id`)
  @UseGuards(JwtAuthGuard)
  @Roles(
    userRoles.org_admin,
    userRoles.org_member,
    userRoles.csm,
    userRoles.super_admin_readonly,
    userRoles.auditor
  )
  @UseInterceptors(TransformInterceptor)
  async generateDownloadSignedUrlForSourceText(
    @Request() req: AuthenticatedRequest,
    @Param("app_id") app_id: number,
    @Param("source_id") source_id: number
  ) {
    try {
      const response: any = await this.sourceTextService.getSourceText(
        req?.["user_data"],
        app_id,
        source_id
      );
      return StandardResponse.success("Success", response);
    } catch (error) {
      this.logger.error("Error generating the signed url:", error);
      throw error;
    }
  }
}
