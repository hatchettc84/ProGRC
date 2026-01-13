import { Body, Controller, Delete, Param, Patch, Post, Put, Req, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { DeleteCustomerService } from "./service/deleteCustomer.service";

import { AuthGuard } from "src/guards/authGuard";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { AssignCustomerCsmRequest, LogoUpdateRequest, LogoUpdateResponse, UpdateCustomerMemberRequest } from "./customer.dto";
import { ResetPasswordService } from "./member/resetPassword.service";
import { UpdateMemberService } from "./member/updateMember.service";
import { AssignCustomerManagerService } from "./service/assignCsm.service";
import { UpdateCustomerService } from "./service/updateCustomer.service";
import { Standard } from "src/entities/standard_v1.entity";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { LoggerService } from "src/logger/logger.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('customers')
@ApiTags('Customer')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
@ApiBearerAuth('JWT-auth')
export class CustomerController {
    constructor(
        private readonly deleteCustomerSrvc: DeleteCustomerService,
        private readonly assignCustomerManagerSrvc: AssignCustomerManagerService,
        private readonly updateCustomerSrvc: UpdateCustomerService,
        private readonly resetPasswordSrvc: ResetPasswordService,
        private readonly updateMemberSrvc: UpdateMemberService,
        private readonly logger: LoggerService
    ) { }

    @Post(':id/customer-managers')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.SuperAdmin, UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Assign CSM to customer',
    })
    @ApiBody({
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    example: ['uuid1', 'uuid2']
                }
            }
        }
    })
    async assignCSMToCustomer(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: AssignCustomerCsmRequest,
    ): Promise<void> {
        await this.assignCustomerManagerSrvc.assignCSMToCustomer(
            { userId: req['user_data']['userId'] },
            id,
            body.ids
        );
    }

    @Delete(':id/customer-managers')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.SuperAdmin, UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Remove CSM from customer',
    })
    @ApiBody({
        description: 'unassign csm from customer',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    example: ['uuid1', 'uuid2']
                }
            }
        }
    })
    async unassignCSMFromCustomer(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: AssignCustomerCsmRequest,
    ): Promise<void> {
        await this.assignCustomerManagerSrvc.unassignCSMFromCustomer(
            { userId: req['user_data']['userId'] },
            id,
            body.ids
        );
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'update customer data',
    })
    @ApiBody({
        description: 'update customer data',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'My Organization' },
                license: { type: 'string', example: 'Beta' }
            }
        }
    })
    async updateCustomer(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { name: string, license: string }
    ): Promise<void> {
        await this.updateCustomerSrvc.updateCustomer(
            { userId: req['user_data']['userId'] },
            id,
            { name: body.name, license: body.license }
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Customer deleted successfully.',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: '200' },
                message: { type: 'string', description: 'Customer deleted successfully.' }
            }
        }
    })
    async deleteCustomer(@Param('id') id: string): Promise<void> {
        return await this.deleteCustomerSrvc.deleteCustomer(id);
    }

    @Patch(':id/notes')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Customer notes updated successfully.',
    })
    @ApiBody({
        description: 'update customer notes',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                notes: { type: 'string', example: 'Customer notes' }
            }
        }
    })
    async updateCustomerNotes(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { notes: string }
    ): Promise<void> {
        await this.updateCustomerSrvc.updateCustomerNotes(
            { userId: req['user_data']['userId'] },
            id,
            body.notes
        );
    }

    @Post(':id/members/:memberId/reset-password')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Member added to customer successfully.',
    })
    async resetPassword(
        @Req() req: any,
        @Param('id') id: string,
        @Param('memberId') memberId: string
    ): Promise<void> {
        await this.resetPasswordSrvc.resetPasswordUser(
            req['user_data'],
            { userId: memberId, customerId: id }
        );
    }

    @Delete(':id/members/:memberId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Member deleted from customer successfully.',
    })
    async deleteMember(
        @Req() req: any,
        @Param('id') id: string,
        @Param('memberId') memberId: string
    ): Promise<void> {
        await this.deleteCustomerSrvc.deleteCustomerMember(id, memberId);
    }

    @Put(':id/members/:memberId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Member data update successfully.',
    })
    @ApiBody({
        description: 'update customer data',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'johndoe@mail.com' },
                mobile: { type: 'string', example: '+12313131311' },
                role_id: { type: 'number', enum: UserRoles.getCustomerRoles(), example: 4 }
            },
            required: ['name', 'email', 'mobile', 'role_id']
        }
    })
    async updateMemberByAdmin(
        @Param('id') id: string,
        @Param('memberId') memberId: string,
        @Body() body: UpdateCustomerMemberRequest
    ): Promise<void> {
        await this.updateMemberSrvc.updateCustomerMemberByAdmin(id, memberId, body)
    }

    @Post(':id/member/create')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiResponse({
        status: 200, description: 'Member data update successfully.',
    })
    @ApiBody({
        description: 'update customer data',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'johndoe@mail.com' },
                mobile: { type: 'string', example: '+12313131311' },
                role_id: { type: 'number', enum: UserRoles.getCustomerRoles(), example: 4 }
            },
            required: ['name', 'email', 'mobile', 'role_id']
        }
    })
    async createMemberByAdmin(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: UpdateCustomerMemberRequest
    ) {
        await this.updateMemberSrvc.createCustomerMemberByAdmin(id, body, req['user_data']);
        return new StandardResponse('201', 'Member created successfully');
    }

    @Delete('members/:memberId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin)
    @ApiResponse({
        status: 200, description: 'Member deleted from current customer session',
    })
    async deleteMemberFromCurrentCustomer(
        @Req() req: any,
        @Param('memberId') memberId: string
    ): Promise<void> {
        await this.deleteCustomerSrvc.deleteCustomerMemberFromCurrentCustomer(req['user_data'], memberId);
    }

    @Put('members/:memberId')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin)
    @ApiResponse({
        status: 200, description: 'Member data update successfully.',
    })
    @ApiBody({
        description: 'update customer data',
        type: 'object',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'johndoe@mail.com' },
                mobile: { type: 'string', example: '+12313131311' },
                role_id: { type: 'number', enum: UserRoles.getCustomerRoles(), example: 4 }
            },
            required: ['name', 'email', 'mobile', 'role_id']
        }
    })
    async updateMemberByOrgAdmin(
        @Req() req: any,
        @Param('memberId') memberId: string,
        @Body() body: UpdateCustomerMemberRequest
    ): Promise<void> {
        await this.updateMemberSrvc.updateCustomerMemberByOrgAdmin(req['user_data'], memberId, body)
    }

    @Patch('update-logo')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin)
    @UsePipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          skipMissingProperties: false
        })
    )
    @UseInterceptors(TransformInterceptor)
    @ApiOperation({ summary: 'Update customer logo' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                uuid: { type: 'string', example: 'uuid-example' }
            },
            required: ['uuid']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Customer logo updated successfully.',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'boolean', example: true },
                uuid: { type: 'string', example: 'uuid-example' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request.'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized.'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal Server Error.'
    })
    async updateCustomerLogo(
        @Req() req: any,
        @Body() body: LogoUpdateRequest
    ) {
        try {
            let response: LogoUpdateResponse = await this.updateCustomerSrvc.updateCustomerLogo(req['user_data'], body);
            return StandardResponse.success('Success', response);
        } catch (error) {
            this.logger.error("Error uploading the organization logo:", error);
            throw error;
        }
    }
}
