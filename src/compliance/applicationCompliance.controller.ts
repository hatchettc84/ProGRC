import { AuthenticatedRequest } from "src/common/interfaces";
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { convertToValidAppId } from "src/utils/appIdConverter";
import * as metadata from "../common/metadata";
import {EvidenceFileUpdateRequestArray, EvidenceFileUpdateResponse, UploadEnhancementEvidenceRequest, UploadEnhancementEvidenceResponse } from "./controlDetails.dto";
import { EnhancementEvidenceService } from "./service/enhancementEvidence.service";
import { UserRole } from "src/masterData/userRoles.entity";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { LoggerService } from "src/logger/logger.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

const userRoles = metadata["userRoles"];

@Controller("applications/:appId")
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
@ApiTags('compliances')
export class ApplicationComplianceController {
    constructor(
        private readonly evidenceEnhancementSrvc: EnhancementEvidenceService,
        private readonly logger: LoggerService,

    ) { }


    // To-Do: Delete this endpoint and controller
    @Post('enhancements/:enhancementId/evidence-documents')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(FilesInterceptor('files', 3))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                    maxItems: 3,
                },
                files_info: {
                    type: 'string',
                    example: '[{"file_name": "test_data.jpg"}]',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'File Data',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            key: { type: 'string', example: '50002/enhancement_evidence/_1729951168246_test_image.jpg' },
                            file_name: { type: 'string', example: 'test_image.jpg' },
                            file_type: { type: 'string', example: 'enhancement_evidence' },
                        },
                    },
                },
            },
        },
    })

    async setEvidenceEnhancementDocument(
        @Param('appId') appId: string,
        @Param('enhancementId') enhancementId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: UploadEnhancementEvidenceRequest,
    ) {
        const { data }: { data: any[] } = await this.evidenceEnhancementSrvc.uploadEnhancementEvidenceDocument(convertToValidAppId(appId), enhancementId, files, body);

        const resposnse: UploadEnhancementEvidenceResponse[] = [];
        data.forEach((entity) => {
            resposnse.push({
                key: entity.key,
                file_name: entity.file_name,
                file_type: entity.file_type,
            });
        });
        return resposnse;
    }

    @Patch('evidences')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @UseInterceptors(TransformInterceptor)
    @UsePipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false
      })
    )
    @ApiOperation({ summary: 'Update evidence files' })
    @ApiParam({ name: 'appId', description: 'The ID of the application', required: true, type: Number })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                uuid: { type: 'string', example: '508ebe36-63e5-4c20-830c-6d0574612ad2' },
                description: { type: 'string', example: 'This is a test evidence' },
                control_ids: { type: 'array', items: { type: 'number' }, example: [1, 2] },
                standard_ids: { type: 'array', items: { type: 'number' }, example: [1, 2] },
              },
              required: ['uuid'],
            },
          },
        },
        required: ['items'],
      },
    })
    @ApiResponse({
      status: 200,
      description: 'Returns the update status and UUID for each file',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'string', example: '200' },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                update: { type: 'boolean', example: true },
                uuid: { type: 'string', example: '508ebe36-63e5-4c20-830c-6d0574612ad2' },
              },
            },
          },
        },
      },
    })
    async updateSourceFiles(@Request() req: AuthenticatedRequest, @Param('appId') appId: number, @Body() body: EvidenceFileUpdateRequestArray) {
      try {
        let responseData: EvidenceFileUpdateResponse[] = await this.evidenceEnhancementSrvc.updateEvidenceFiles(req['user_data'], appId, body.items);
        return StandardResponse.success('Success', responseData);
      } catch (error) {
        this.logger.error("Error uploading the evidences:", error);
        throw error;
      }
    }

    @Get(`download/evidence/:evidence_id`)
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @UseInterceptors(TransformInterceptor)
    @ApiOperation({ summary: 'Download evidence file' })
    @ApiParam({ name: 'appId', description: 'The ID of the application', required: true, type: Number })
    @ApiParam({ name: 'evidence_id', description: 'The ID of the evidence', required: true, type: Number })
    @ApiResponse({
      status: 200,
      description: 'Returns the signed URL for the evidence file',
      schema: {
        type: 'object',
        properties: {
          code: { type: 'string', example: '200' },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              downloadUrl: { type: 'string', example: 'https://s3.amazonaws.com/bucket/file' },
              evidence_id: { type: 'number', example: 1 },
              evidence_name: { type: 'string', example: 'test_image.jpg'},
            },
          },
        },
      },
    })
    async generateDownloadSignedUrl(@Request() req: AuthenticatedRequest, @Param('appId') app_id: number, @Param('evidence_id') evidence_id: number) {

      try {
          const response: any = await this.evidenceEnhancementSrvc.downloadEvidenceById(req?.["user_data"], app_id, evidence_id);
          return StandardResponse.success('Success', response);
      } catch (error) {
          this.logger.error("Error generating the signed url:", error);
          throw error;
      }
    }

}
