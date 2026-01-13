import { AuthenticatedRequest } from "src/common/interfaces";
import { Body, Controller, Get, Param, Patch, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe, BadRequestException, Delete } from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import * as metadata from '../common/metadata';
import { OnboardingService } from './onboarding.service';
import { ResendInvitationService } from './resentInvitation.service';
import { AddAuditorDto, ProfileImageUpdateRequest, ProfileImageUpdateResponse } from './user.dto';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { LoggerService } from 'src/logger/logger.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
const userRoles = metadata['userRoles'];

@ApiTags('Onboarding')
@Controller('onboarding/')
export class OnboardingController {
    constructor(
        private onboardSvc: OnboardingService,
        private readonly resentInvitationService: ResendInvitationService,
        private readonly logger: LoggerService
    ) { }

    @Put('organization')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin)
    async updateOrganization(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.updateOrganization(req.body, req['user_data']);
    }

    @Patch('/complete')//Patch means to partially update data
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin)
    async markOrganizationOnboardingComplete(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.markOrganizationOnboardingComplete(req['user_data']);
    }

    @Put('organization/team_member')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin)
    async addOrgTeamMembers(@Request() req: AuthenticatedRequest) {
        const role_id = req.body.role_id;
        if (role_id === userRoles.auditor) {
            throw new BadRequestException('Invalid role_id');
        }
        return await this.onboardSvc.addOrgTeamMembers(req.body, req['user_data']);
    }

    @Put('organization/team_member/invite')//resend invite
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin)
    async reInviteOrgTeamMembers(@Request() req: AuthenticatedRequest) {
        await this.resentInvitationService.resendInvitationForEmail(req['user_data'], req.body.email);
        return {
            message: 'Invite again sent on email!',
        }
    }

    @Get('organization')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async getOrgInfo(@Request() req: AuthenticatedRequest) {
        this.logger.log(`getOrgInfo: Received request`, {
            userId: req['user_data']?.userId,
            email: req['user_data']?.email,
            tenant_id: req['user_data']?.tenant_id,
            customerId: req['user_data']?.customerId
        });
        const result = this.onboardSvc.getOrganizationInfo(req['user_data']);
        this.logger.log(`getOrgInfo: Returning result`, {
            hasData: !!(await result)?.data,
            orgId: (await result)?.data?.id
        });
        return result;
    }

    @Get('list/organization')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.csm, userRoles.super_admin, userRoles.super_admin_readonly)
    @ApiResponse({
        status: 200, description: 'Returns list of organizations',
        schema: {
            properties: {
                data: {
                    type: 'array', description: 'List of organizations',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', description: 'Organization ID', example: 77778 },
                            organization_name: { type: 'string', description: 'Organization Name', example: 'progrc' },
                            license_type: { type: 'string', description: 'License Type', example: 'Beta' },
                            is_onboarding_complete: { type: 'boolean', description: 'Is onboarding complete', example: false },
                            created_at: { type: 'string', description: 'Created At', example: '2024-11-07T00:18:00.790Z' },
                            created_by: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', description: 'Name of the creator', example: 'Super Admin' },
                                    email: { type: 'string', description: 'Email of the creator', example: 'superadmin@progrc.com' },
                                },
                                required: ['name', 'email'],
                            }
                        },
                        required: ['id', 'organization_name', 'license_type', 'is_onboarding_complete', 'created_at'],
                    }
                }
            },
        }
    })
    async getAllOrganizations(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getAllOrganizations();
    }

    @Get('list/users')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.super_admin_readonly, userRoles.csm)
    async getAllUsers(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getAllUsers();
    }

    @Get('organization/:org_id/details')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin_readonly, userRoles.org_admin, userRoles.org_member, userRoles.csm)
    @ApiResponse({
        status: 200,
        description: 'Returns organization details with members and CSMs',
        schema: {
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '12345' },
                        logo_image_key: { type: 'string', example: 'org/logo/123.png' },
                        organization_name: { type: 'string', example: 'Acme Corp' },
                        license_type: { type: 'string', example: 'enterprise' },
                        is_onboarding_complete: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time', example: '2024-03-20T10:00:00Z' },
                        notes: { type: 'string', example: 'Organization notes' },
                        members: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '123' },
                                    invite_status: { type: 'string', example: 'joined' },
                                    user_id: { type: 'string', example: '123' },
                                    created_at: { type: 'string', format: 'date-time' },
                                    user: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: '123' },
                                            name: { type: 'string', example: 'John Doe' },
                                            email: { type: 'string', example: 'john@example.com' },
                                            profile_image_key: { type: 'string', example: 'profiles/123.jpg' },
                                            mobile: { type: 'string', example: '+1234567890' },
                                            role: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string', example: '1' },
                                                    role_name: { type: 'string', example: 'admin' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        csms: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '123' },
                                    created_at: { type: 'string', format: 'date-time' },
                                    name: { type: 'string', example: 'Jane Smith' },
                                    email: { type: 'string', example: 'jane@example.com' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getOrgDetails(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getOrgDetails(req.params.org_id);
    }

    @Get('organization/team_member')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    async getOrgTeamMembers(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getOrganizationMembers(req['user_data']);
    }

    @Put('user/profile_info')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async updateUserProfileInfo(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.updateProfileInfo(req.body, req['user_data']);
    }

    @Get('user/profile_info')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.csm, userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async getUserProfileInfo(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getProfileInfo(req['user_data']);
    }

    @Post('user/accept_tos')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_member, userRoles.auditor)
    async acceptTos(@Request() req: AuthenticatedRequest) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        return this.onboardSvc.saveAcceptedTosDate(req['user_data'], ipAddress);
    }

    @Get('organization/apps/team_members')//get team members for apps (joined members only)
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    async getJoinedTeamMembers(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getOrganizationMembers(req['user_data'], true);
    }

    // @Post('organization/apps')
    // @UseGuards(JwtAuthGuard)
    // @Roles(userRoles.org_admin, userRoles.org_member)
    // @ApiBody({
    //     schema: {
    //         type: 'array',
    //         items: {
    //             type: 'object',
    //             properties: {
    //                 name: { type: 'string', description: 'Name of the application' },
    //                 owner_id: { type: 'string', description: 'Owner ID of the application' },
    //                 desc: { type: 'string', description: 'Description of the application' },
    //                 url: { type: 'string', description: 'URL of the application' },
    //                 tags: { type: 'string', description: 'Tags of the application' },
    //             },
    //             required: ['name'],
    //         }
    //     }
    // })
    // async addOrgApps(@Request() req: AuthenticatedRequest) {
    //     return await this.createApplicationSvc.create(req.body, req['user_data']);
    // }

    @Get('organization/apps')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.auditor)
    async getOrgApps(@Request() req: AuthenticatedRequest) {
        return await this.onboardSvc.getOrgApps(req['user_data']);
    }

    @Get('organization/app/:app_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
    async getOrgAppDetail(@Request() req: AuthenticatedRequest) {
        return await this.onboardSvc.getOrgAppDetail(parseInt(req.params.app_id), req['user_data']);
    }

    @Put('organization/app/:app_id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    async updateAppData(@Request() req: AuthenticatedRequest) {
        return await this.onboardSvc.updateAppData(parseInt(req.params.app_id), req.body, req['user_data']);
    }


    @Get('organization/templates')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    async getOrganizationTemplates(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getTemplates(req['user_data']);
    }

    @Put('organization/templates')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    @ApiOperation({ summary: 'Map templates to an organization' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                templates: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    description: 'Array of template names to map to the organization'
                }
            },
            required: ['templates']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Templates successfully mapped to organization'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Invalid user or organization access'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - No templates selected'
    })
    async uploadTemplates(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.mapTemplates(req.body, req['user_data']);
    }


    @ApiOperation({ summary: 'Upload File/e to S3. It takes an array of files as input in multipart form data' })
    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    files_info: { type: 'string', description: 'A Json String of Array of files info in an predefined order.' },
                },
                required: ['files_info'],
            }

        },
    })
    @ApiResponse({ status: 200, description: 'Returns array of objects that contains S3 key for the uploaded files in the same order as requested.' })
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(FilesInterceptor(`files`, 3))
    uploadTemplate(
        @Request() req: AuthenticatedRequest,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.onboardSvc.uploadTemplatesToS3(req, files);
    }


    //---------------------------------  new standards ---------------------------------

    @Get('frameworks')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async getFramework(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.findFramework(req['user_data']);
    }

    @Get('customer/:organizationId/frameworks')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async getSelectedFrameworks(@Param('organizationId') organizationId: string, @Request() req: AuthenticatedRequest) {
        return this.onboardSvc.findSelectedFrameworks(organizationId, req['user_data']);
    }

    @Post('customer/frameworks')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async uploadSelectedFrameworks(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.uploadSelectedFrameworks(req.body, req['user_data']);
    }

    @Get('standards')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async getStandards(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.findStandards_v1(req['user_data']);
    }

    @Post('customer/standards')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member, userRoles.super_admin, userRoles.csm)
    async uploadSelectedStandards(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.uploadSelectedStandards(req.body, req['user_data']);
    }

    @Patch('user/profile_image')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_member, userRoles.csm, userRoles.org_admin, userRoles.super_admin_readonly, userRoles.super_admin)
    @ApiOperation({ summary: 'Update user profile image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                uuid: { type: 'string', description: 'UUID of the profile image' }
            },
            required: ['uuid']
        },
        description: 'Profile image update request payload'
    })
    @ApiResponse({
        status: 200,
        description: 'Profile image updated successfully',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'boolean', description: 'Update status' },
                uuid: { type: 'string', description: 'UUID of the profile image' }
            },
            required: ['updated', 'uuid']
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid input data'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Invalid user access'
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @UseInterceptors(TransformInterceptor)
    async updateUserProfileImage(@Request() req: AuthenticatedRequest, @Body() body: ProfileImageUpdateRequest) {
        try {
            let response: ProfileImageUpdateResponse = await this.onboardSvc.updateProfileImage(req['user_data'], body);
            return StandardResponse.success('Success', response);
        } catch (error) {
            this.logger.error("Error uploading the profile image:", error);
            throw error;
        }
    }




    @Put(':customerId/license')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.csm)
    async updateOrgLicense(@Request() req: AuthenticatedRequest, @Param('customerId') customerId: string) {
        return this.onboardSvc.updateOrgLicense(req.body, req['user_data'], customerId);
    }

    @Get('license')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.csm, userRoles.org_admin, userRoles.super_admin_readonly, userRoles.org_member)
    async getOrgLicense(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getOrgLicense(req['user_data']);
    }

    @Get('organization/auditor')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.super_admin_readonly, userRoles.csm, userRoles.org_admin)
    @ApiResponse({ status: 200, description: 'List of auditors retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async getOrgTeamAuditor(@Request() req: AuthenticatedRequest) {
        return this.onboardSvc.getOrganizationAuditors(req['user_data']);
    }

    @Put('organization/auditor')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.csm)
    @ApiBody({ type: AddAuditorDto })
    @ApiResponse({ status: 200, description: 'Auditor successfully added.' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async addOrgTeamAuditor(@Request() req: AuthenticatedRequest, @Body() addAuditorDto: AddAuditorDto) {
        return this.onboardSvc.addOrgAuditor(addAuditorDto, req['user_data']);
    }

    @Get('auditor/customers')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.auditor)
    @ApiResponse({ status: 200, description: 'List of auditor customers retrieved successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async getOrgAuditorCustomer(@Request() req: AuthenticatedRequest) {
        const customerData = await this.onboardSvc.getAuditorCustomers(req['user_data']);
        return customerData;
    }


    @Delete('organization/auditor')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.csm)
    @ApiBody({ type: AddAuditorDto })
    @ApiResponse({ status: 200, description: 'Auditor successfully unassigned.' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async removeOrgTeamAuditor(@Request() req: AuthenticatedRequest, @Body() removeAuditorDto: AddAuditorDto) {
        return this.onboardSvc.removeOrgAuditor(removeAuditorDto, req['user_data']);
    }

}

