import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Roles } from "src/decorators/roles.decorator";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { AuthGuard } from "src/guards/authGuard";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { HelpCenterAskAiRequest } from "../helpCenter.dto";
import { GetArticleService } from "../service/article/getArticle.service";
import { AskAiService } from "../service/askAi.service";
import { Category, GetCategoryService } from "../service/category/getCategory.service";
import { is } from "cheerio/dist/commonjs/api/traversing";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags("Help Center")
@Controller("help-center")
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class HelpCenterController {
    constructor(
        private readonly getCategoryService: GetCategoryService,
        private readonly getArticleService: GetArticleService,
        private readonly askAiService: AskAiService
    ) { }

    @ApiResponse({
        status: 200,
        description: 'Get all categories with articles',
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
                            articles: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', example: 7 },
                                        title: { type: 'string', example: 'Test abc2' },
                                        description: { type: 'string', example: 'Description' },
                                        thumbnail: { type: 'string', example: 'thumbnail_20241203T100534583Z.jpg' },
                                        slug: { type: 'string', example: 'test-abc2' },
                                        category_key: { type: 'string', example: 'source' },
                                        thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg' },
                                        updated_at: { type: 'string', example: '2024-12-03T10:14:55.796Z' },
                                        published_at: { type: 'string', example: '2024-12-03T08:24:17.132Z' },
                                    }
                                },
                            }
                        }
                    }
                }
            }
        }
    })
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.AUDITOR)
    async getCategoriesWithArticle(): Promise<any> {
        const categories: Category[] = await this.getCategoryService.getAllCategoriesWithArticles();
        return categories.map(category => ({
            name: category.name,
            description: category.description,
            key: category.key,
            articles: category.articles.map(article => ({
                id: article.id,
                title: article.published_metadata.title,
                description: article.published_metadata.description,
                thumbnail: article.published_metadata.thumbnail,
                slug: article.published_metadata.slug,
                category_key: article.category_key,
                thumbnail_url: article.thumbnail_url,
                updated_at: article.updated_at,
                published_at: article.published_at,
            })),
        }));
    }

    @ApiResponse({
        status: 200,
        description: 'Search articles',
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
                            id: { type: 'number', example: 7 },
                            title: { type: 'string', example: 'Test abc2' },
                            description: { type: 'string', example: 'Description' },
                            thumbnail: { type: 'string', example: 'thumbnail_20241203T100534583Z.jpg' },
                            slug: { type: 'string', example: 'test-abc2' },
                            category_key: { type: 'string', example: 'source' },
                            thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg' },
                            updated_at: { type: 'string', example: '2024-12-03T10:14:55.796Z' },
                            published_at: { type: 'string', example: '2024-12-03T08:24:17.132Z' },
                        }
                    }
                },
                total: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                offset: { type: 'number', example: 0 },
            }
        }
    })
    @Get('articles')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async getArticles(
        @Query('q') query: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number
    ): Promise<any> {
        if (!query) {
            throw new BadRequestException('query is required');
        }

        limit = limit || 10;
        offset = offset || 0;
        const [articles, total]: [HelpCenterArticle[], number] = await this.getArticleService.getArticleBySearchQuery(query, limit, offset);
        return StandardResponse.successWithTotal('success', articles.map(article => ({
            id: article.id,
            title: article.published_metadata.title,
            description: article.published_metadata.description,
            slug: article.published_metadata.slug,
            category_key: article.category_key,
            thumbnail_url: article.thumbnail_url,
            updated_at: article.updated_at,
            published_at: article.published_at,
        })), { total, limit, offset });
    }

    @ApiResponse({
        status: 200,
        description: 'Get article by slug',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 7 },
                title: { type: 'string', example: 'Test abc2' },
                description: { type: 'string', example: 'Description' },
                content: { type: 'string', example: '<h1>Test articles</h1>' },
                slug: { type: 'string', example: 'test-abc2' },
                category_key: { type: 'string', example: 'source' },
                thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg' },
                created_by: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '58c19340-f0a1-70f8-6881-4784f39cb0a5' },
                        name: { type: 'string', example: 'Super Admin' },
                        profile_image_url: { type: 'string', example: 'https://cdn.example.com/profile_image_20241203T100534583Z.jpg' },
                    }
                },
                updated_at: { type: 'string', example: '2024-12-03T10:14:55.796Z' },
                published_at: { type: 'string', example: '2024-12-03T08:24:17.132Z' },
            }
        }
    })
    @Get('articles/:slug')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async getArticlesBySlug(
        @Param('slug') slug: string
    ): Promise<any> {
        const article: HelpCenterArticle = await this.getArticleService.getPublishedArticleBySlug(slug);
        return {
            id: article.id,
            title: article.published_metadata.title,
            description: article.published_metadata.description,
            content: article.published_content,
            slug: article.published_metadata.slug,
            category_key: article.category_key,
            thumbnail_url: article.thumbnail_url,
            created_by: {
                id: article.created_by_user.id,
                name: article.created_by_user.name,
                profile_image_url: article.created_by_user.profile_image_key,
            },
            updated_at: article.updated_at,
            published_at: article.published_at,
        }
    }

    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                query: { type: 'string', example: 'How to create an article?' },
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Ask question to AI',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Success' },
                data: {
                    type: 'object',
                    properties: {
                        ai_response: { type: 'string', example: 'This is a placeholder response' },
                    }
                }
            }
        }
    })
    @Post('ask-question')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async askQuestion(
        @Body() body: HelpCenterAskAiRequest
    ): Promise<any> {
        const response = await this.askAiService.question(body.query);
        return {
            ai_response: response,
        };
    }

    @ApiResponse({
        status: 200,
        description: 'Search articles',
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
                            id: { type: 'number', example: 7 },
                            title: { type: 'string', example: 'Test abc2' },
                            description: { type: 'string', example: 'Description' },
                            thumbnail: { type: 'string', example: 'thumbnail_20241203T100534583Z.jpg' },
                            slug: { type: 'string', example: 'test-abc2' },
                            category_key: { type: 'string', example: 'source' },
                            thumbnail_url: { type: 'string', example: 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg' },
                            updated_at: { type: 'string', example: '2024-12-03T10:14:55.796Z' },
                            published_at: { type: 'string', example: '2024-12-03T08:24:17.132Z' },
                        }
                    }
                },
                total: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                offset: { type: 'number', example: 0 },
            }
        }
    })
    @Get('article/guide')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember)
    async getGuideArticles(
        @Query('type') type: string
    ): Promise<any> {
        if (!type) {
            throw new BadRequestException('type is required');
        }
        const [articles, total]: [HelpCenterArticle[], number] = await this.getArticleService.getArticleByCategoryType(type);
        return StandardResponse.successWithTotal('success', articles.map(article => ({
            id: article.id,
            title: article.published_metadata.title,
            description: article.published_metadata.description,
            slug: article.published_metadata.slug,
            category_key: article.category_key,
            thumbnail_url: article.thumbnail_url,
            updated_at: article.updated_at,
            published_at: article.published_at,
            is_guide: article.use_as_guide,
            publish_content: article.published_content,
            drafted_content: article.drafted_content,   
            drafted_metadata: article.drafted_metadata,
            published_metadata: article.published_metadata,
        })), { total, limit: 10, offset: 0 });
    }

}
