import { Body, Controller, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { HelpdeskContactType } from "src/entities/helpdesk.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { HelpdeskContactRequest } from "./helpdesk.dto";
import { ContactService } from "./service/contact.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags('Helpdesk')
@Controller('helpdesk')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class HelpdeskController {
    constructor(
        private readonly contactService: ContactService
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                subject: { type: 'string' },
                message: { type: 'string' },
                contact_type: { type: 'enum', enum: [HelpdeskContactType.FEATURE_REQUEST, HelpdeskContactType.SUPPORT_REQUEST] },
            },
            required: ['subject', 'message', 'contactType']
        }
    })
    @Post('contact')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgAdmin, UserRole.OrgMember)
    async sendEmail(
        @Req() req: any,
        @Body() body: HelpdeskContactRequest
    ): Promise<void> {
        await this.contactService.sendFromCustomer(
            req['user_data']['tenant_id'],
            {
                subject: body.subject,
                message: body.message,
                contactType: body.contactType
            }
        );
    }
}
