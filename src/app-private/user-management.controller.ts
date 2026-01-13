import { Controller, Post, Delete, Body, Param } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateProGrcUserService } from "src/user/services/createUser.service";
import { DeleteUserService } from "src/user/services/deleteUser.service";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { createUserRequest } from "src/user/user.dto";
import { User } from "src/entities/user.entity";

@ApiTags('User Management')
@Controller('internal-users')
export class UserManagementController {
    constructor(
        private readonly createUserService: CreateProGrcUserService,
        private readonly deleteUserService: DeleteUserService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create Internal User (No Auth Required)' })
    @ApiBody({
        description: "Create a new internal ProGRC user",
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    example: "John Doe",
                },
                email: {
                    type: "string",
                    example: "john.doe@progrc.com",
                },
                mobile: {
                    type: "string",
                    example: "+11234567890",
                },
                roleId: {
                    type: "number",
                    example: 1,
                }
            },
            required: ["name", "email", "mobile", "roleId"],
        },
    })
    @ApiResponse({
        status: 201,
        description: "User created successfully",
        schema: {
            type: "object",
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: "string",
                            example: "uuid-here",
                        },
                    }
                }
            },
        },
    })
    async createUser(@Body() data: createUserRequest): Promise<StandardResponse<any>> {
        const createdUser: User = await this.createUserService.createUser({ userId: 'system' }, data);
        return StandardResponse.success('User created successfully', { id: createdUser.id });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Internal User (No Auth Required)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Param('id') id: string): Promise<StandardResponse<void>> {
        await this.deleteUserService.deleteUser(id);
        return StandardResponse.success('User deleted successfully');
    }

    @Post('auditor')
    @ApiOperation({ summary: 'Create Auditor User (No Auth Required)' })
    @ApiBody({
        description: "Create a new auditor kovr user",
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    example: "John Doe",
                },
                email: {
                    type: "string",
                    example: "john.doe@progrc.com",
                },
                mobile: {
                    type: "string",
                    example: "+11234567890",
                },
                roleId: {
                    type: "number",
                    example: 7,
                }
            },
            required: ["name", "email", "mobile", "roleId"],
        },
    })
    @ApiResponse({
        status: 201,
        description: "Auditor created successfully",
        schema: {
            type: "object",
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        id: {
                            type: "string",
                            example: "uuid-here",
                        },
                    }
                }
            },
        },
    })
    async createAuditor(@Body() data: createUserRequest): Promise<StandardResponse<any>> {
        const createdUser: User = await this.createUserService.createAuditor({ userId: 'system' }, data);
        return StandardResponse.success('Auditor created successfully', { id: createdUser.id });
    }

    @Delete('auditor/:id')
    @ApiOperation({ summary: 'Delete Auditor User (No Auth Required)' })
    @ApiResponse({ status: 200, description: 'Auditor deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 404, description: 'Auditor not found' })
    async deleteAuditor(@Param('id') id: string): Promise<StandardResponse<void>> {
        await this.deleteUserService.deleteAuditor(id);
        return StandardResponse.success('Auditor deleted successfully');
    }
} 