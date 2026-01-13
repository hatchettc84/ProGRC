import { BadRequestException, Controller, Get, Param, Post, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { convertToValidAppId } from 'src/utils/appIdConverter';
import * as metadata from '../common/metadata';
import { PendingTasksRequest, TypeTask } from './async_tasks.dto';
import { AsyncTasksService } from './async_tasks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
const userRoles = metadata['userRoles'];

@Controller('async_task')
@ApiTags('Async Task')
export class AsyncTasksController {
    constructor(private asyncService: AsyncTasksService) { }

    @Post("")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    createTask(@Request() req: any) {
        return this.asyncService.createTask(req.body, req['user_data']);
    }

    @Get("task_details")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    taskDetails(@Request() req: any) {
        return this.asyncService.getAsyncTask(req.body, req['user_data']);
    }

    @Get("pendings")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(TransformInterceptor)
    @ApiQuery({ name: 'app_id', type: 'string', required: true })
    @ApiQuery({ name: 'type', enum: TypeTask, required: true })
    @ApiResponse({
        status: 200, description: 'Returns true if there are pending tasks',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    properties: {
                        have_pending_task: { type: 'boolean' },
                        pending_ids: {
                            type: 'array',
                            items: {
                                type: 'number',
                                example: 1
                            },
                            example: [1, 2]
                        }
                    }
                }
            }
        }
    })
    async pendingTasks(
        @Request() req: any,
        @Query() query: PendingTasksRequest
    ) {
        const tenantId = req['user_data']['tenant_id'];
        const [havePendingTask, pendingIds]: [boolean, number[]] =
            await this.asyncService.getPendingTasks(
                tenantId,
                convertToValidAppId(query.app_id),
                query.type
            );
        return {
            have_pending_task: havePendingTask,
            pending_ids: pendingIds
        };
    }



    @Post(":id/cancel")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    @UseInterceptors(TransformInterceptor)
    @ApiParam({ name: 'id', type: 'number', required: true }) // Correctly declare 'id' as a path parameter
    @ApiQuery({ name: 'type', enum: TypeTask, required: true }) // If 'type' is still expected in the query
    @ApiResponse({
        status: 200,
        description: 'Task has been cancelled.',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
            },
        },
    })
    async cancelTasks(
        @Request() req: any,
        @Param('id') id: number, 
        @Query('type') type: string, 
    ) {
        // Validate if 'id' is a number
        if (isNaN(Number(id))) {
            throw new BadRequestException('Invalid ID format');
        }

        await this.asyncService.cancelTask(id, req['user_data']);
    }

    @Post("fix-stuck-tasks")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.super_admin)
    @UseInterceptors(TransformInterceptor)
    @ApiQuery({ name: 'appId', required: false, type: Number, description: 'Optional: Fix tasks for specific app only' })
    @ApiQuery({ name: 'maxAgeHours', required: false, type: Number, description: 'Maximum age in hours (default: 1)', example: 1 })
    @ApiResponse({
        status: 200,
        description: 'Stuck tasks fixed successfully',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    properties: {
                        fixed: { type: 'number', example: 5 },
                        tasks: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        }
    })
    async fixStuckTasks(
        @Request() req: any,
        @Query('appId') appId?: string,
        @Query('maxAgeHours') maxAgeHours?: string
    ) {
        const appIdNum = appId ? parseInt(appId) : undefined;
        const maxAge = maxAgeHours ? parseInt(maxAgeHours) : 1;
        const result = await this.asyncService.fixStuckPendingTasks(appIdNum, maxAge);
        return {
            message: `Fixed ${result.fixed} stuck pending tasks`,
            fixed: result.fixed,
            tasks: result.tasks
        };
    }

}

