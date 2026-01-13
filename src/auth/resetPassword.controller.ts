import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { ChangePasswordService } from "src/user/services/changePassword.service";
import { ResetPasswordTokenService } from "src/user/services/resetPasswordToken.service";
import { ChangePasswordResetRequest, ValidateResetPasswordRequest } from "./auth.dto";

@ApiTags('Auth')
@Controller('reset-password')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class ResetPasswordController {
    constructor(
        private readonly resetPasswordTokenService: ResetPasswordTokenService,
        private readonly changePasswordService: ChangePasswordService
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'johndoe@mail.com'
                },
                token: {
                    type: 'string',
                    example: '123456'
                },
            },
            required: ['email', 'token', 'type']
        }
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        valid: { type: 'boolean' }
                    }
                }
            }
        }
    })
    @Post('/validate-token')
    async validateToken(
        @Body() body: ValidateResetPasswordRequest
    ) {
        const valid: boolean = await this.resetPasswordTokenService.validateToken(
            body.email,
            body.token,
        );
        return {
            valid
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'johndoe@mail.com'
                },
                token: {
                    type: 'string',
                    example: '123456'
                },
                new_password: {
                    type: 'string',
                    example: 'password123'
                },
            },
        }
    })
    @Post('/change-password')
    async changePassword(
        @Body() body: ChangePasswordResetRequest
    ) {
        await this.changePasswordService.changeFromResetPassword(
            body.token,
            body.email,
            body.newPassword
        );
    }
}
