import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { DeleteTrustCenterService } from "./service/deleteTrustCenter.service";
import { GetTrustCenterService } from "./service/getTrustCenter.service";
import { UpdateTrustCenterService } from "./service/updateTrustCenter.service";
import { UpdateTrustCenterRequest } from "./trustCenter.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { generateS3SignedUrl } from "src/utils/entity-transformer";

@Controller('trust-centers')
@ApiTags('Trust Center')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class TrustCenterController {
    constructor(
        private readonly getTrustCenterService: GetTrustCenterService,
        private readonly updateTrustCenterService: UpdateTrustCenterService,
        private readonly deleteTrustCenterService: DeleteTrustCenterService
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    @ApiResponse({
        status: 200,
        description: 'Get trust centers for an app',
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
                            name: { type: 'string', example: 'Trust Center 1' },
                            approval_date: { type: 'string', example: '2024-11-24T17:00:00.000Z' },
                            submission_date: { type: 'string', example: '2024-11-24T17:00:00.000Z' },
                            file_path: { type: 'string', example: 'https://example.com/file.pdf' },
                            updated_at: { type: 'string', example: '2024-11-24T17:00:00.000Z' },
                            updated_by: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: 'uuid' },
                                    name: { type: 'string', example: 'User 1' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    async getTrustCenters(
        @Req() req: any,
        @Query('appId') appId: number
    ) {
        if (!appId) {
            throw new BadRequestException('App ID is required');
        }
        const trustCenter: TrustCenter[] = await this.getTrustCenterService.getForApp(req['user_data'], appId);
        
        const trustCentersWithSignedUrls = await Promise.all(
            trustCenter.map(async (tc) => {
                const signedUrl = await generateS3SignedUrl(tc.file_path);
                return {
                    id: tc.id,
                    name: tc.name,
                    approval_date: tc.approval_date,
                    submission_date: tc.submission_date,
                    file_path: signedUrl,
                    updated_at: tc.updated_at,
                    updated_by: {
                        id: tc.updated_by_user.id,
                        name: tc.updated_by_user.name
                    },
                    is_locked: tc.status === 'success' ? false : true,
                }
            })
        );
        
        return trustCentersWithSignedUrls;
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Trust Center 1' },
                approval_date: { type: 'string', example: '2024-11-24', description: 'YYYY-MM-DD' },
                submission_date: { type: 'string', example: '2024-11-24', description: 'YYYY-MM-DD' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Update trust center',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' }
            }
        }
    })
    async updateTrustCenter(
        @Req() req: any,
        @Param('id') id: number,
        @Body() body: UpdateTrustCenterRequest
    ) {
        body.validate();
        await this.updateTrustCenterService.updateTrustCenter(req['user_data'], id, body);
        return {
            code: '200',
            message: 'success'
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    @ApiResponse({
        status: 200,
        description: 'Delete trust center',
        schema: {
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'success' }
            }
        }
    })
    async deleteTrustCenter(
        @Req() req: any,
        @Param('id') id: number
    ): Promise<void> {
        await this.deleteTrustCenterService.delete(req['user_data'], id);
    }
}
