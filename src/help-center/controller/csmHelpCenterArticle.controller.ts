import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Roles } from "src/decorators/roles.decorator";
import { HelpCenterArticle, HelpCenterArticleStatus } from "src/entities/helpCenterArticle.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { CreateArticleRequest, UpdateArticleRequest } from "../helpCenter.dto";
import { CreateArticleService } from "../service/article/createArticle.service";
import { DeleteArticleService } from "../service/article/deleteArticle.service";
import { GetArticleService } from "../service/article/getArticle.service";
import { PublishArticleService } from "../service/article/publishArticle.service";
import { UndoChangeArticleService } from "../service/article/undoChangeArticle.service";
import { UpdateArticleService } from "../service/article/updateArticle.service";
import { UploadThumbnailService } from "../service/article/uploadThumbnail.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags('Help Center')
@Controller('csm/help-center/articles')
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class CsmHelpCenterArticleController {
    constructor(
        private readonly createArticleService: CreateArticleService,
        private readonly getArticleService: GetArticleService,
        private readonly deleteArticleService: DeleteArticleService,
        private readonly updateArticleService: UpdateArticleService,
        private readonly publishArticleService: PublishArticleService,
        private readonly uploadThumbnailService: UploadThumbnailService,
        private readonly undoChangeArticleService: UndoChangeArticleService,
    ) { }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                content: { type: 'string' },
                thumbnail: { type: 'string' },
                keywords: { type: 'string' },
                category_key: { type: 'string' },
            },
        }
    })
    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
            }
        }
    })
    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async createArticle(
        @Req() req: any,
        @Body() body: CreateArticleRequest,
    ): Promise<any> {
        const id: number = await this.createArticleService.createDraftArticle(req['user_data'], body);
        return {
            id,
        }
    }

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
                thumbnail: { type: 'string', example: 'thumbnail_20210901120000Z.jpg' },
                thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20210901120000Z.jpg' },
            }
        }
    })
    @Post('thumbnails')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UseInterceptors(FileInterceptor('file'))
    async uploadThumbnail(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<any> {
        const { fileName, url } = await this.uploadThumbnailService.uploadThumbnail(file);
        return {
            thumbnail: fileName,
            thumbnail_url: url,
        }
    }

    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                limit: { type: 'number' },
                offset: { type: 'number' },
                total: { type: 'number' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            status: { type: 'string' },
                            slug: { type: 'string' },
                            category_key: { type: 'string' },
                            updated_at: { type: 'string' },
                            published_at: { type: 'string' },
                        }
                    }
                }
            }
        }
    })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiQuery({ name: 'category_key', required: false })
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async getArticles(
        @Req() req: any,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('category_key') categoryKey: string,
    ): Promise<StandardResponse> {
        limit = limit || 10;
        offset = offset || 0;
        const [articles, total] = await this.getArticleService.getAllArticle(categoryKey, limit, offset);
        return StandardResponse.successWithTotal('Success', articles.map((article) => {
            return {
                id: article.id,
                title: article.drafted_metadata.title,
                description: article.drafted_metadata.description,
                slug: article.drafted_metadata.slug,
                category_key: article.category_key,
                status: article.status,
                updated_at: article.updated_at,
                published_at: article.published_at,
            }
        }), { limit, offset, total });
    }

    @ApiResponse({
        status: 200,
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Article Title' },
                description: { type: 'string', example: 'Article Description' },
                slug: { type: 'string', example: 'article-title' },
                category_key: { type: 'string', example: 'source' },
                status: { type: 'string', example: 'PUBLISHED' },
                keywords: { type: 'string', example: 'keyword1, keyword2' },
                thumbnail: { type: 'string', example: 'thumbnail_20210901120000Z.jpg' },
                thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20210901120000Z.jpg' },
                have_different: { type: 'boolean', example: false },
                content: { type: 'string', example: '<p>Article Content</p>' },
                updated_at: { type: 'string', example: '2021-09-01T12:00:00Z' },
                published_at: { type: 'string', example: '2021-09-01T12:00:00Z' },
            }
        }
    })
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async getArticle(
        @Param('id') id: number,
    ): Promise<any> {
        const article: HelpCenterArticle = await this.getArticleService.getDetailArticleById(id);
        return {
            id: article.id,
            title: article.drafted_metadata.title,
            description: article.drafted_metadata.description,
            slug: article.drafted_metadata.slug,
            category_key: article.category_key,
            status: article.status,
            keywords: article.drafted_metadata.keywords,
            thumbnail: article.drafted_metadata.thumbnail,
            thumbnail_url: article.thumbnail_url,
            have_different: !article.isDraftAndPublishedSame(),
            content: article.status === HelpCenterArticleStatus.PUBLISHED ? article.published_content : article.drafted_content,
            updated_at: article.updated_at,
            published_at: article.published_at,
            use_as_guide: article.use_as_guide,
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                content: { type: 'string' },
                thumbnail: { type: 'string' },
                keywords: { type: 'string' },
                category_key: { type: 'string' },
            },
        }
    })
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async updateArticle(
        @Req() req: any,
        @Param('id') id: number,
        @Body() body: UpdateArticleRequest,
    ): Promise<void> {
        await this.updateArticleService.updateArticle(req['user_data'], id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async deleteArticle(
        @Param('id') id: number,
    ): Promise<void> {
        await this.deleteArticleService.deleteArticleById(id);
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async publishArticle(
        @Req() req: any,
        @Param('id') id: number,
    ): Promise<void> {
        await this.publishArticleService.publishArticle(req['user_data'], id);
    }

    @Post(':id/undo-changes')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    async unpublishArticle(
        @Req() req: any,
        @Param('id') id: number,
    ): Promise<void> {
        await this.undoChangeArticleService.undoChangeArticle(req['user_data'], id);
    }
}
