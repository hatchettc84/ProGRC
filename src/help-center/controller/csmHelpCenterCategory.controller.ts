import { Controller, Get, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { GetCategoryService } from "../service/category/getCategory.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags('Help Center')
@Controller('csm/help-center/categories')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class CsmHelpCenterCategoryController {
    constructor(
        private readonly getCategoryService: GetCategoryService,
    ) { }

    @ApiResponse({
        status: 200,
        description: 'Get all help center categories',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'Source' },
                            description: { type: 'string', example: 'Source category' },
                            key: { type: 'string', example: 'source' },
                        },
                    },
                }
            },
        },
    })
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async getCategories(
        @Req() req: any,
    ): Promise<any> {
        return await this.getCategoryService.getCategories();
    }
}
