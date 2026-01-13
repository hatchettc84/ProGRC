import { BadRequestException, Controller, Delete, Get, Param, Patch, Post, Put, Req, Request, UseGuards, UseInterceptors, Body } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { AuthenticatedRequest } from "src/common/interfaces";
import { Roles } from "src/decorators/roles.decorator";
import { App } from "src/entities/app.entity";
import { AppUserRole } from "src/entities/appUser.entity";
import { AuthGuard } from "src/guards/authGuard";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import * as metadata from "../common/metadata";
import { ApplicationDetailResponse, ApplicationSummaryResponse, ListApplicationResponse } from "./application.dto";
import { CreateApplicationService } from "./createApplication.service";
import { DeleteApplicationService } from "./deleteApplication.service";
import { GetApplicationService } from "./getApplication.service";
import { GetAsyncTaskPendingService } from "./getAsyncTaskPending.service";
import { ManageMemberService } from "./manageMember.service";
import { UpdateApplicationService } from "./updateApplication.service";
import { convertToValidAppId } from "src/utils/appIdConverter";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

const userRoles = metadata["userRoles"];

@ApiTags('Applications')
@Controller("applications")
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-auth')
export class ApplicationController {
    constructor(
        private readonly getApplicationSrvc: GetApplicationService,
        private readonly createApplicationSrvc: CreateApplicationService,
        private readonly manageMemberSrvc: ManageMemberService,
        private readonly updateApplicationSrvc: UpdateApplicationService,
        private readonly deleteApplicationSrvc: DeleteApplicationService,
        private readonly getAsyncTaskPendingService: GetAsyncTaskPendingService,
        private readonly syncComplianceV2Service: SyncComplianceV2Service,
    ) { }

    @Get("")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
    @ApiResponse({
        status: 200,
        description: 'List of applications',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: "4e6196f9-3a3a-4d56-abdc-a855858dbc39" },
                            name: { type: 'string', example: 'My Application' },
                            desc: { type: 'string', example: 'This is my application' },
                            url: { type: 'string', example: 'https://myapplication.com' },
                            tags: { type: 'string', example: 'tag1' },
                            role: { type: 'string', example: 'admin' },
                            standards: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', example: 1 },
                                        name: { type: 'string', example: 'ISO 27001' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getApplication(@Request() req: AuthenticatedRequest): Promise<ListApplicationResponse[]> {
        const userData = req['user_data'];
        const applications: App[] = await this.getApplicationSrvc.applications({
            ...userData,
            role_id: userData.role_id?.toString() || undefined
        } as any)

        let result: ListApplicationResponse[] = [];
        applications.forEach((app: App) => {
            result.push({
                id: app.id,
                name: app.name,
                desc: app.desc,
                url: app.url,
                tags: app.tags,
                role: app.appUser?.role || AppUserRole.ADMIN,
                standards: app.standards.map(standard => ({
                    id: standard.id,
                    name: standard.name,
                    framework_name: standard.framework?.name,
                    framework_id: standard.framework?.id

                })),
                created_at: app.created_at,
                updated_at: app.updated_at
            });
        });
        return result;
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'My Application' },
                desc: { type: 'string', example: 'This is my application' },
                url: { type: 'string', example: 'https://myapplication.com' },
                tags: { type: 'string', example: 'tag1' },
                standard_ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                }
            },
            required: ['name']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Update application, need to send all fields',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
            }
        }
    })
    async updateApplication(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        const transformedBody = {
            ...req.body,
            standardIds: req.body.standard_ids?.map((id: number) => id)
        };

        await this.updateApplicationSrvc.updateApplication(
            { userId: userData['userId'], tenantId: userData['tenant_id'] },
            parseInt(req.params.id),
            transformedBody
        );

        return StandardResponse.success<any>(
            "Application updated successfully!",
            null,
            "200"
        );
    }

    @Get("summaries")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiResponse({
        status: 200,
        description: 'Application summaries',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            name: { type: 'string', example: 'My Application 4' },
                            desc: { type: 'string', example: 'This is my application' },
                            url: { type: 'string', example: 'https://myapplication.com' },
                            tags: { type: 'string', example: 'tag1' },
                            created_at: { type: 'string', format: 'date-time', example: '2024-10-07T10:57:16.977Z' },
                            updated_at: { type: 'string', format: 'date-time', nullable: true, example: null },
                            created_by: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                                    name: { type: 'string', example: 'john doe' }
                                }
                            },
                            compliances: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', example: 1 },
                                        name: { type: 'string', example: 'NIST 800-53' },
                                        percentage_completion: { type: 'string', example: '30.5' },
                                        control_categories: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { type: 'string', example: 'Access Control' },
                                                    short_name: { type: 'string', example: 'AC' },
                                                    percentage_completion: { type: 'string', example: '10.2' }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            assessment: {
                                type: 'object',
                                properties: {
                                    last_changed_at: { type: 'string', format: 'date-time', example: '2024-10-07T10:57:16.977Z' },
                                    last_changed_by: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                                            name: { type: 'string', example: 'john doe' }
                                        }
                                    }
                                }
                            },
                            source: {
                                type: 'object',
                                properties: {
                                    last_changed_at: { type: 'string', format: 'date-time', example: '2024-10-07T10:57:16.977Z' },
                                    source_total: { type: 'number', example: 10 },
                                    last_changed_by: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                                            name: { type: 'string', example: 'john doe' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getApplicationSummaries(@Request() req: AuthenticatedRequest): Promise<ApplicationSummaryResponse[]> {
        if (!req['user_data']) {

            throw new BadRequestException('user_data is missing');

        }
        const userData = req['user_data'];
        const apps: any[] = await this.getApplicationSrvc.applicationSummary({
            ...userData,
            role_id: userData.role_id?.toString() || undefined
        } as any);
        return apps.map(app => new ApplicationSummaryResponse(app));
    }

    @Post("")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'My Application' },
                desc: { type: 'string', example: 'This is my application' },
                url: { type: 'string', example: 'https://myapplication.com' },
                tags: { type: 'string', example: 'tag1' },
                standard_ids: {
                    type: 'array',
                    items: {
                        type: 'number',
                        example: 1
                    },
                    example: [1, 2]
                },
                members: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            user_id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                            role: { type: 'string', example: 'admin' }
                        },
                        required: ['user_id', 'role']
                    }
                }
            },
            required: ['name']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Create new application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: "4e6196f9-3a3a-4d56-abdc-a855858dbc39" },
                    },
                    required: ['id']
                }
            }
        }
    })
    async createApplication(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        const transformedBody = {
            ...req.body,
            members: req.body.members?.map(({ user_id, role }: any) => ({
                userId: user_id,
                role
            })),

            auditors: req.body.auditors?.map(({ user_id, role }: any) => ({
                userId: user_id,
                role
            })),
            standardIds: req.body.standard_ids?.map((id: number) => id)
        };

        const application: App = await this.createApplicationSrvc.createApplication(
            { userId: userData['userId'], tenantId: userData['tenant_id'] },
            transformedBody
        );

        await this.syncComplianceV2Service.createApplicationControls(req['user_data'], application.id);

        return StandardResponse.success<any>(
            "Application created successfully!",
            {
                id: application.id
            },
            "201"
        );
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
    @ApiResponse({
        status: 200,
        description: 'Application details',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'ee7277e0-d2cc-40ef-804c-f1e7615c44fb' },
                        name: { type: 'string', example: 'My Application 4' },
                        desc: { type: 'string', example: 'This is my application' },
                        url: { type: 'string', example: 'https://myapplication.com' },
                        tags: { type: 'string', example: 'tag1' },
                        created_at: { type: 'string', format: 'date-time', example: '2024-10-07T10:57:16.977Z' },
                        updated_at: { type: 'string', format: 'date-time', nullable: true, example: null },
                        created_by_user_id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                        members: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                                    name: { type: 'string', example: 'john doe' },
                                    email: { type: 'string', example: 'john.doe@mail.com' },
                                    role: { type: 'string', example: 'admin' }
                                }
                            }
                        },
                        standards: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    name: { type: 'string', example: 'ISO 27001' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getApplicationDetail(@Request() req: AuthenticatedRequest): Promise<ApplicationDetailResponse> {
        const userData = req['user_data'];
        const application: App = await this.getApplicationSrvc.applicationDetail({
            userId: userData['userId'],
            tenantId: userData['tenant_id']
        }, parseInt(req.params.id));

        return new ApplicationDetailResponse(application);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiResponse({
        status: 200,
        description: 'Delete application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
            }
        }
    })
    async deleteApplication(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        await this.deleteApplicationSrvc.deleteApplication({
            userId: userData['userId'],
            tenantId: userData['tenant_id']
        }, parseInt(req.params.id));

        return StandardResponse.success<any>(
            "Application deleted successfully!",
            null,
            "200"
        );
    }

    @Post(":id/members")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiBody({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    user_id: { type: 'string', example: '14780448-0091-70d7-77cb-0721f0211a0d' },
                    role: { type: 'string', example: 'admin' }
                },
                required: ['id']
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Add member to application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
            }
        }
    })
    async addMember(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];

        const memberData = req.body.map(({ user_id, role }: any) => ({
            userId: user_id,
            role,
        }));

        await this.manageMemberSrvc.addMember({
            userId: userData['userId'],
            tenantId: userData['tenant_id']
        }, parseInt(req.params.id), memberData);

        return StandardResponse.success<any>(
            "Member added successfully!",
            null,
            "201"
        );
    }

    @Patch(":id/members/:userId")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                role: { type: 'string', example: 'admin' }
            },
            required: ['role']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Update member role in application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
            }
        }
    })
    async updateMember(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        await this.manageMemberSrvc.updateMemberRole({
            userId: userData['userId'],
            tenantId: userData['tenant_id']
        }, parseInt(req.params.id), req.params.userId, req.body.role);

        return StandardResponse.success<any>(
            "Member role updated successfully!",
            null,
            "200"
        );
    }

    @Delete(":id/members/:userId")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @ApiResponse({
        status: 200,
        description: 'Remove member from application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
            }
        }
    })
    async deleteMember(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        await this.manageMemberSrvc.deleteMember({
            userId: userData['userId'],
            tenantId: userData['tenant_id']
        }, parseInt(req.params.id), req.params.userId);
        return null;
    }

    @ApiResponse({
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        has_pending_task: { type: 'boolean', example: false }
                    }
                }
            }
        }
    })
    @Get(':id/async-task-pending')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    async getAsyncTaskPending(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string
    ) {
        const hasPendingTask: boolean = await this.getAsyncTaskPendingService.hasPendingTaskForApplication(req['user_data'], parseInt(id));
        return {
            has_pending_task: hasPendingTask,
        }
    }


    @Post(':appId/controls')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
       async syncComplianceForApp(
            @Req() req: any,
            @Param('appId') strAppId: string,
        ): Promise<void> {
            const appId = convertToValidAppId(strAppId);
    
            if (!appId) {
                throw new BadRequestException('appId is required');
            }
    
            await this.syncComplianceV2Service.createApplicationControls(req['user_data'], appId);
        }


        @Put(":id/standards")
        @UseGuards(JwtAuthGuard)
        @Roles(userRoles.org_admin, userRoles.org_member)
        @ApiBody({
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'My Application' },
                    desc: { type: 'string', example: 'This is my application' },
                    url: { type: 'string', example: 'https://myapplication.com' },
                    tags: { type: 'string', example: 'tag1' },
                    standard_ids: {
                        type: 'array',
                        items: {
                            type: 'number',
                            example: 1
                        },
                    }
                },
                required: ['name']
            }
        })
        @ApiResponse({
            status: 200,
            description: 'Update application, need to send all fields',
            schema: {
                properties: {
                    code: { type: 'string', example: '200' },
                    message: { type: 'string', example: 'success' },
                }
            }
        })
        async updateApplicationStandards(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
            const userData = req['user_data'];
            const transformedBody = {
                ...req.body,
                standardIds: req.body.standard_ids?.map((id: number) => id)
            };
    
            await this.updateApplicationSrvc.updateApplicationStandard(
                { userId: userData['userId'], customerId: userData['customerId'] },
                parseInt(req.params.id),
                transformedBody
            );
    
            return StandardResponse.success<any>(
                "Application updated successfully!",
                null,
                "200"
            );
        }

        @Patch(":id/lock")
        @UseGuards(JwtAuthGuard)
        @Roles(userRoles.org_admin, userRoles.org_member, userRoles.csm)
        @ApiResponse({
            status: 200,
            description: 'Lock application',
            schema: {
                properties: {
                    code: { type: 'string', example: '200' },
                    message: { type: 'string', example: 'success' },
                }
            }
        })
        async lockApplication(@Request() req: AuthenticatedRequest, @Param('id') strAppId: string ): Promise<StandardResponse<any>> {
            const appId = convertToValidAppId(strAppId);
    
            if (!appId) {
                throw new BadRequestException('appId is required');
            }
    
            const userData = req['user_data'];
            await this.updateApplicationSrvc.lockApplication({
                userId: userData['userId'],
                tenantId: userData['tenant_id']
            }, appId, req.body);
    
            return StandardResponse.success<any>(
                "Application locked successfully!",
                null,
                "200"
            );
        }

        @Get(":id/is_locked")
        @UseGuards(JwtAuthGuard)
        @Roles(userRoles.org_admin, userRoles.org_member, userRoles.auditor)
        
        async checkIfApplicationLocked(@Request() req: AuthenticatedRequest): Promise<Boolean> {
            const userData = req['user_data'];
            const application: Boolean = await this.getApplicationSrvc.checkLockOnApp({
                userId: userData['userId'],
                tenantId: userData['tenant_id'],
                customerId: userData['customerId']
            }, parseInt(req.params.id));
    
            return application;
        }

        @Get("auditors/apps")
        @UseGuards(JwtAuthGuard)
        @Roles(userRoles.auditor)
        @ApiResponse({
            status: 200,
            description: 'List of applications for auditors',
            schema: {
                properties: {
                    code: { type: 'string', example: '200' },
                    message: { type: 'string', example: 'success' },
                    data: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: "4e6196f9-3a3a-4d56-abdc-a855858dbc39" },
                                name: { type: 'string', example: 'My Application' },
                                desc: { type: 'string', example: 'This is my application' },
                                url: { type: 'string', example: 'https://myapplication.com' },
                                tags: { type: 'string', example: 'tag1' },
                                role: { type: 'string', example: 'admin' },
                                standards: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            name: { type: 'string', example: 'ISO 27001' }}}}}}}}}})
        async getApplicationsForAuditors(@Request() req: AuthenticatedRequest): Promise<ListApplicationResponse[]> {
            const applications: App[] = await this.getApplicationSrvc.applicationsForAuditors(req['user_data'])
    
            let result: ListApplicationResponse[] = [];
            applications.forEach((app: App) => {
                result.push({
                    id: app.id,
                    name: app.name,
                    desc: app.desc,
                    url: app.url,
                    tags: app.tags,
                    role: app.appUser?.role || AppUserRole.AUDITOR,
                    standards: app.standards.map(standard => ({
                        id: standard.id,
                        name: standard.name,
                        framework_name: standard.framework?.name,
                        framework_id: standard.framework?.id
    
                    })),
                    created_at: app.created_at,
                    updated_at: app.updated_at
                });
            });
            return result;
        }

    @Delete(":id/standards/:standardId")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin)
    @ApiResponse({
        status: 200,
        description: 'Delete standard from application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Standard removed from application successfully!' },
            }
        }
    })
    async deleteStandardFromApplication(@Request() req: AuthenticatedRequest): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        const appId = parseInt(req.params.id);
        const standardId = parseInt(req.params.standardId);

        await this.updateApplicationSrvc.removeStandardFromApplication(
            { userId: userData['userId'], tenantId: userData['customerId'] },
            appId,
            standardId
        );

        return StandardResponse.success<any>(
            "Standard removed from application successfully!",
            null,
            "200"
        );
    }

    @Post(":id/clone")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member, userRoles.csm)
    @ApiResponse({
        status: 201,
        description: 'Clone application',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Application cloned successfully!' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'My Application Clone' }
                    }
                }
            }
        }
    })
    async cloneApplication(
        @Request() req: AuthenticatedRequest,
        @Param('id') appId: string,
        @Body() body: { name?: string }
    ): Promise<StandardResponse<any>> {
        const userData = req['user_data'];
        const clonedApp = await this.createApplicationSrvc.cloneApplication(
            { userId: userData['userId'], tenantId: userData['customerId'] },
            parseInt(appId),
            body.name
        );

        return StandardResponse.success<any>(
            "Application cloned successfully!",
            {
                id: clonedApp.id,
                name: clonedApp.name
            },
            "201"
        );
    }

}
