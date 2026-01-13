import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuthGuard } from 'src/guards/authGuard';
import { Roles } from 'src/decorators/roles.decorator';

import * as metadata from "src/common/metadata";
import { CreateAuditFeedbackDto, UpdateAuditFeedbackDto } from './audit.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';

const userRoles = metadata["userRoles"];


@ApiTags('Audit')
@Controller('audit')
export class AuditController {

    constructor(private readonly auditService: AuditService) {}

     @Post("feedback")
     @UseGuards(JwtAuthGuard)
     @Roles(userRoles.auditor)
     @ApiBody({ type: CreateAuditFeedbackDto })
     @ApiResponse({ status: 201, description: 'Feedback successfully created.' })
     @ApiResponse({ status: 403, description: 'Forbidden.' })
     addFeedback(@Req() req: any, @Body() createAuditFeedbackDto: CreateAuditFeedbackDto) {
         this.auditService.addFeedback(req['user_data'], createAuditFeedbackDto);
         return { message: 'Feedback successfully created.' };
    }

    @Get("feedback")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.auditor)
    @ApiResponse({ status: 200, description: 'List of all feedbacks.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Roles(userRoles.member)
    findAll() {
        return this.auditService.findAll();
    }

    @Get('feedback/app/:app_id/control/:control_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.auditor)
    @ApiResponse({ status: 200, description: 'Feedback for the specified app and control.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Feedback not found.' })
    findOneByAppAndControl(@Req() req: any, @Param('app_id') app_id: number, @Param('control_id') control_id: number) {
        return this.auditService.findOneByAppAndControl(req['user_data'], app_id, control_id);
    }

    @Get('feedback/app/:app_id/standard/:standard_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.auditor)
    @ApiResponse({ status: 200, description: 'Feedback for the specified app and control.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Feedback not found.' })
    findByAppAndStandardl(@Req() req: any, @Param('app_id') app_id: number, @Param('standard_id') standard_id: number) {
        return this.auditService.findByAppAndStandard(req['user_data'], app_id, standard_id);
    }

    @Patch('feedback/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.auditor)
    @ApiBody({ type: UpdateAuditFeedbackDto })
    @ApiResponse({ status: 200, description: 'Feedback successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Feedback not found.' })
    updateFeedback(@Req() req:any, @Param('id') id: number, @Body() updateAuditFeedbackDto: UpdateAuditFeedbackDto) {
        return this.auditService.updateFeedback(req['user_data'], id, updateAuditFeedbackDto);
    }

    @Patch('bulkFeedback')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.auditor)
    @ApiBody({ type: UpdateAuditFeedbackDto })
    @ApiResponse({ status: 200, description: 'Feedback successfully updated.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Feedback not found.' })
    bulkUpdateFeedback(@Req() req:any, @Body() updateAuditFeedbackDto: UpdateAuditFeedbackDto) {
        return this.auditService.bulkUpdateFeedback(req['user_data'], updateAuditFeedbackDto);
    }

    @Delete('feedback/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.auditor)
    @ApiResponse({ status: 200, description: 'Feedback successfully deleted.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @ApiResponse({ status: 404, description: 'Feedback not found.' })
    removeFeedback(@Req() req: any, @Param('id') id: number) {
        return this.auditService.remove(req['user_data'], id);
    }

    @Post('feedback/:id/generate-response')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.csm)
    @ApiOperation({ summary: 'Generate AI-powered response to audit feedback' })
    @ApiParam({ name: 'id', description: 'Feedback ID', required: true })
    @ApiResponse({ status: 200, description: 'Response generated successfully' })
    async generateResponseToFeedback(@Param('id') id: number) {
        const response = await this.auditService.generateResponseToFeedback(id);
        return StandardResponse.success('Response generated successfully', response);
    }

    @Post('feedback/:id/suggest-remediation')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.csm)
    @ApiOperation({ summary: 'Suggest remediation actions from audit feedback' })
    @ApiParam({ name: 'id', description: 'Feedback ID', required: true })
    @ApiResponse({ status: 200, description: 'Remediation actions suggested successfully' })
    async suggestRemediationActions(@Param('id') id: number) {
        const actions = await this.auditService.suggestRemediationActions(id);
        return StandardResponse.success('Remediation actions suggested successfully', { actions });
    }

    @Get('feedback/app/:appId/standard/:standardId/prioritize-flagged')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.member, userRoles.csm, userRoles.auditor)
    @ApiOperation({ summary: 'Prioritize flagged controls from audit feedback using AI' })
    @ApiParam({ name: 'appId', description: 'Application ID', required: true })
    @ApiParam({ name: 'standardId', description: 'Standard ID', required: true })
    @ApiResponse({ status: 200, description: 'Controls prioritized successfully' })
    async prioritizeFlaggedControls(
        @Param('appId') appId: number,
        @Param('standardId') standardId: number
    ) {
        const priorities = await this.auditService.prioritizeFlaggedControls(appId, standardId);
        return StandardResponse.success('Controls prioritized successfully', priorities);
    }
}
