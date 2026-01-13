import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { TemplateService } from "./service/template.service";
import { UploadCustomerTemplateLogoService } from "./service/uploadLogo.service";
import { UpdateCustomerTemplateLogoRequest } from "./template.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('customer-templates')
@ApiTags('Customer Template')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class CustomerTemplateController {
    constructor(
        private readonly uploadLogoSrvc: UploadCustomerTemplateLogoService,
        private readonly templateSrvc: TemplateService
    ) { }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                path: { type: 'string', example: 'customer_logo_20210901120000Z.jpg' },
            }
        }
    })
    @Post('logos')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin)
    @UseInterceptors(FileInterceptor('file'))
    async uploadCustomerTemplateLogo(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const fileName: string = await this.uploadLogoSrvc.uploadLogoCustomer(req['user_data'], file);
        return {
            path: fileName
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                logo: { type: 'string', example: 'customer_logo_20210901120000Z.jpg' }
            },
        }
    })
    @Put(':templateId/logos')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin)
    async updateLogoTemplate(
        @Req() req: any,
        @Param('templateId') templateId: number,
        @Body() body: UpdateCustomerTemplateLogoRequest,
    ) {
        await this.templateSrvc .updateLogoForTemplate(req['user_data'], templateId, body.logo);
    }

}
