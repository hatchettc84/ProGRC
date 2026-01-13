import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  BadRequestException,
  Delete,
  Get,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CrmService } from './service/crm.service';
import { AuthGuard } from 'src/guards/authGuard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/masterData/userRoles.entity';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { SnakeCaseInterceptor } from 'src/interceptors/snakeCase.interceptor';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { convertToValidAppId } from 'src/utils/appIdConverter';
import {
  UpdateCrmFileRequest,
  UpdateCrmFileResponse,
  ValidateCrmFileRequest,
} from './dto/crm.dto';
import { LoggerService } from 'src/logger/logger.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('CRM')
@Controller('crm')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class CrmController {
  constructor(private readonly crmService: CrmService, private readonly logger: LoggerService) {}

  // @Post('validate')
  // @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.CSM)
  // @ApiOperation({ summary: 'Validate a CRM file in S3' })
  // @ApiBody({ type: ValidateCrmFileRequest })
  // @ApiResponse({
  //   status: 200,
  //   description: 'CRM file is valid'
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid CRM file'
  // })
  // async validateCrmFile(
  //   @Req() req: any,
  //   @Body() body: ValidateCrmFileRequest
  // ) {
  //   try {
  //     await this.crmService.validateCrmFile(body.filePath, body.appId, body.standardId, body.customerId, body.saveData);
  //     return StandardResponse.success('CRM file is valid');
  //   } catch (error) {
  //     this.logger.error("Error validating CRM file:", error);
  //     throw error;
  //   }
  // }

  @Put('apps/:appId/standards/:standardId/upload')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember)
  @ApiOperation({ summary: 'Update CRM file path and trigger processing' })
  @ApiParam({ name: 'appId', description: 'Application ID', example: '123' })
  @ApiParam({ name: 'standardId', description: 'Standard ID', example: '456' })
  @ApiBody({ type: UpdateCrmFileRequest })
  @ApiResponse({
    status: 200,
    description: 'CRM file updated successfully',
    type: UpdateCrmFileResponse
  })
  async updateCrmFile(
    @Req() req: any,
    @Param('appId') strAppId: string,
    @Param('standardId') strStandardId: string,
    @Body() body: UpdateCrmFileRequest
  ) {
    const appId = convertToValidAppId(strAppId);
    if (!appId) {
      throw new BadRequestException('Invalid app ID');
    }

    const standardId = convertToValidAppId(strStandardId);
    if (!standardId) {
      throw new BadRequestException('Invalid standard ID');
    }

    const result = await this.crmService.updateCrmFile(
      req['user_data'],
      appId,
      standardId,
    );

    return StandardResponse.success('CRM file updated successfully', result);
  }

  @Delete('apps/:appId/standards/:standardId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember)
  @ApiOperation({ summary: 'Delete CRM file' })
  @ApiParam({ name: 'appId', description: 'Application ID', example: '123' })
  @ApiParam({ name: 'standardId', description: 'Standard ID', example: '456' })
  async deleteCrmFile(@Req() req: any, @Param('appId') strAppId: string, @Param('standardId') strStandardId: string) {
    const appId = convertToValidAppId(strAppId);
    if (!appId) {
      throw new BadRequestException('Invalid app ID');
    }

    const standardId = convertToValidAppId(strStandardId);
    if (!standardId) {
      throw new BadRequestException('Invalid standard ID');
    }

    await this.crmService.deleteCrmFile(req['user_data'], appId, standardId);
    return StandardResponse.success('CRM file deleted successfully');
  }

  @Get(`apps/:appId/standards/:standardId/download`)
  @UseGuards(JwtAuthGuard)
  @Roles(
    UserRole.OrgMember,
    UserRole.AUDITOR,
    UserRole.CSM_AUDITOR
  )
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: 'Download CRM file' })
  @ApiParam({ name: 'appId', description: 'Application ID', example: '123' })
  @ApiParam({ name: 'standardId', description: 'Standard ID', example: '456' })
  @ApiResponse({
    status: 200,
    description: 'CRM file download URL generated successfully',
    schema: {
      example: {
        success: true,
        message: 'Success',
        data: {
          downloadUrl: 'https://example.com/signed-url',
          fileName: 'crm_file.csv',
          crm_file_uploaded_at: '2023-01-01T00:00:00.000Z',
          is_crm_available: true
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'CRM file not found'
  })
  async generateDownloadSignedUrlForCrmFile(
    @Req() req: any,
    @Param("appId") app_id: number,
    @Param("standardId") standard_id: number
  ) {
    try {
      const response: any = await this.crmService.getCRMFile(
        req?.["user_data"],
        app_id,
        standard_id
      );
      return StandardResponse.success("Success", response);
    } catch (error) {
      this.logger.error("Error generating the signed url:", error);
      throw error;
    }
  }

} 