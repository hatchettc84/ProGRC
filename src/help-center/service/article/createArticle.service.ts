import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HelpCenterArticle, HelpCenterArticleStatus } from "src/entities/helpCenterArticle.entity";
import { InsertResult, Repository } from "typeorm";
import { GetCategoryService } from "../category/getCategory.service";

export interface CreateDraftArticleRequest {
    title: string;
    description: string;
    content: string;
    thumbnail?: string;
    keywords: string;
    categoryKey: string;
}

@Injectable()
export class CreateArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly articleRepository: Repository<HelpCenterArticle>,
        private readonly getCategoryService: GetCategoryService
    ) { }

    async createDraftArticle(userInfo: { userId: string }, data: CreateDraftArticleRequest): Promise<number> {
        this.validateCreateArticleData(data);
        await this.validateDuplicateTitle(data.title);
        const category = await this.getCategoryService.getCategoryByKey(data.categoryKey);

        try {
            const insertResult: InsertResult = await this.articleRepository.insert({
                status: HelpCenterArticleStatus.DRAFT,
                drafted_content: data.content,
                drafted_metadata: {
                    title: data.title,
                    description: data.description,
                    thumbnail: data.thumbnail,
                    slug: data.title?.toLowerCase().replace(/ /g, '-'),
                    keywords: data.keywords,
                },
                category_key: category.key,
                created_at: new Date(),
                created_by: userInfo.userId,
                updated_at: new Date(),
                updated_by: userInfo.userId,
            });

            return parseInt(insertResult.identifiers[0].id, 10);
        } catch (error) {
            throw new BadRequestException('Failed to create article');
        }
    }

    private validateCreateArticleData(body: CreateDraftArticleRequest): void {
        if (!body.title) {
            throw new BadRequestException('Title is required');
        }
        if (!body.description) {
            throw new BadRequestException('Description is required');
        }
        if (!body.content) {
            throw new BadRequestException('Content is required');
        }
        if (!body.keywords) {
            throw new BadRequestException('Keywords are required');
        }
        if (!body.categoryKey) {
            throw new BadRequestException('Category key is required');
        }
    }

    private async validateDuplicateTitle(title: string): Promise<void> {
        const article = await this.articleRepository.createQueryBuilder('article')
            .select([
                'article.id',
            ])
            .where("article.drafted_metadata->>'slug' = :slug", { slug: title.toLowerCase().replace(/ /g, '-') })
            .getOne();

        if (article) {
            throw new BadRequestException('Article with the same title already exists');
        }
    }
}
