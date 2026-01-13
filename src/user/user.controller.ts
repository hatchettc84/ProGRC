import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guards/authGuard";

import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { User } from "src/entities/user.entity";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import * as metadata from "../common/metadata";
import { CreateProGrcUserService } from "./services/createUser.service";
import { DeleteUserService } from "./services/deleteUser.service";
import { GetUserService } from "./services/getUser.service";
import { ResetInternalUserPassword } from "./services/resetPassword.service";
import { createUserRequest } from "./user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
const userRoles = metadata["userRoles"];

@Controller("internal-users")
@ApiTags("Internal Users")
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class UserController {
    constructor(
        private readonly createUserSrvc: CreateProGrcUserService,
        private readonly getUserSrvc: GetUserService,
        private readonly deleteUserSrvc: DeleteUserService,
        private readonly resetPasswordSrvc: ResetInternalUserPassword,
    ) { }

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
                role_id: {
                    type: "number",
                    example: 1,
                    enum: [userRoles.super_admin, userRoles.csm],
                }
            },
            required: ["name", "email"],
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
                            type: "number",
                            example: 1,
                        },
                    }
                }
            },
        },
    })
    @Post()
   @UseGuards(JwtAuthGuard)
   @Roles(userRoles.super_admin)
    async createUser(
        @Req() req: any,
        @Body() data: createUserRequest
    ): Promise<any> {
        const createdUser: User = await this.createUserSrvc.createUser(req['user_data'], data);
        return {
            id: createdUser.id,
        }
    }

    @ApiResponse({
        status: 200,
        description: "List of internal users",
        schema: {
            type: "object",
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        offset: { type: 'number', example: 0 },
                        users: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: "number",
                                        example: 1,
                                    },
                                    name: {
                                        type: "string",
                                        example: "John Doe",
                                    },
                                    email: {
                                        type: "string",
                                        example: "test@progrc.com",
                                    },
                                    mobile: {
                                        type: "string",
                                        example: "+11234567890",
                                    },
                                    role: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "number",
                                                example: 1,
                                            },
                                            name: {
                                                type: "string",
                                                example: "Super Admin",
                                            },
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
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.csm)
    async getUsers(
        @Req() req: any,
        @Query('limit') limit = 10,
        @Query('offset') offset = 0,
    ): Promise<any> {
        const userInfo: any = req['user_data'];

        const [users, total]: [User[], number] = await this.getUserSrvc.getUsers(
            { roleId: parseInt(userInfo['role_id']), email: userInfo['email'] },
            limit, offset);

        const userResponse = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: {
                id: user.role_id,
                name: user.role?.role_name || 'Unknown',
            }
        }));

        return StandardResponse.successWithTotal("success", userResponse, { total, limit, offset });
    }

    // TODO: Remove this endpoint
    @ApiBody({
        description: "Delete a user by supper admin",
    })
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin)
    async deleteUser(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<void> {
        await this.deleteUserSrvc.deleteUser(id);
    }

    @ApiBody({
        description: "Reset password for internal user",
    })
    @Post(':id/reset-password')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.csm)
    async resetPassword(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<void> {
        await this.resetPasswordSrvc.resetPasswordUser(req['user_data'], id);
    }

    // TODO: Remove this endpoint
    @ApiBody({
        description: "Create a new auditor ProGRC user",
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
                role_id: {
                    type: "number",
                    example: 1,
                    enum: [userRoles.Auditor],
                }
            },
            required: ["name", "email", "mobile"],
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
                            type: "number",
                            example: 1,
                        },
                    }
                }
            },
        },
    })
    // TODO: Remove this endpoint
    @Post("auditor")
   @UseGuards(JwtAuthGuard)
   @Roles(userRoles.super_admin)
    async createAuditor(
        @Req() req: any,
        @Body() data: createUserRequest
    ): Promise<any> {
        const createdUser: User = await this.createUserSrvc.createAuditor(req['user_data'], data);
        return {
            id: createdUser.id,
        }
    }

    @ApiResponse({
        status: 200,
        description: "List of internal users",
        schema: {
            type: "object",
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 10 },
                        offset: { type: 'number', example: 0 },
                        users: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: "number",
                                        example: 1,
                                    },
                                    name: {
                                        type: "string",
                                        example: "John Doe",
                                    },
                                    email: {
                                        type: "string",
                                        example: "test@progrc.com",
                                    },
                                    mobile: {
                                        type: "string",
                                        example: "+11234567890",
                                    },
                                    role: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "number",
                                                example: 1,
                                            },
                                            name: {
                                                type: "string",
                                                example: "Super Admin",
                                            },
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
    @Get("auditor")
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin, userRoles.csm)
    async getAuditor(
        @Req() req: any,
        @Query('limit') limit = 10,
        @Query('offset') offset = 0,
    ): Promise<any> {
        const userInfo: any = req['user_data'];

        const [users, total]: [User[], number] = await this.getUserSrvc.getAuditor(
            { roleId: parseInt(userInfo['role_id']), email: userInfo['email'] },
            limit, offset);

        const userResponse = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: {
                id: user.role_id,
                name: user.role.role_name,
            }
        }));

        return StandardResponse.successWithTotal("success", userResponse, { total, limit, offset });
    }

    // TODO: Remove this endpoint

    @ApiBody({
        description: "Delete an auditor by super admin",
    })
    @Delete('auditor/:id')
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.super_admin)
    @ApiResponse({ status: 200, description: 'Auditor successfully deleted.' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - Invalid user access' })
    async deleteAuditor(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<void> {
        await this.deleteUserSrvc.deleteAuditor(id);
    }

}
