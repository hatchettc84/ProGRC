import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HelpCenterArticle, HelpCenterArticleStatus } from "src/entities/helpCenterArticle.entity";
import { EntityNotFoundError, Repository, UpdateResult } from "typeorm";
import { GetCategoryService } from "../category/getCategory.service";

export interface UpdateArticleBody {
    title: string;
    description: string;
    content: string;
    thumbnail?: string;
    keywords: string;
    categoryKey: string;
    useAsGuide: boolean;
}

@Injectable()
export class UpdateArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly articleRepository: Repository<HelpCenterArticle>,
        private readonly getCategoryService: GetCategoryService
    ) { }

    async updateArticle(userInfo: { userId: string }, id: number, body: UpdateArticleBody): Promise<void> {
        this.validateUpdateArticleBody(body);
        await this.validateDuplicateTitle(id, body.title);
        await this.getCategoryService.getCategoryByKey(body.categoryKey);
        const isUserGuide = body.useAsGuide ? true : false;
        if (isUserGuide) {
            const existingGuides = await this.articleRepository.find({
                where: {
                    category_key: body.categoryKey,
                    use_as_guide: true,
                },
            });

            for (const guide of existingGuides) {
                if (guide.id !== id) {
                    await this.articleRepository.update({ id: guide.id }, { use_as_guide: false });
                }
            }
        }

        try {
            const result: UpdateResult = await this.articleRepository.update({ id }, {
                drafted_metadata: {
                    title: body.title,
                    description: body.description,
                    thumbnail: body.thumbnail,
                    slug: body.title.toLowerCase().replace(/ /g, '-'),
                    keywords: body.keywords,
                },
                drafted_content: body.content,
                category_key: body.categoryKey,
                status: HelpCenterArticleStatus.DRAFT,
                updated_at: new Date(),
                use_as_guide: isUserGuide,
                updated_by: userInfo.userId,
            });

            if (result.affected === 0) {
                throw new EntityNotFoundError(HelpCenterArticle, id);
            }
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error;
            }
            throw new BadRequestException('Failed to update article');
        }

    }

    private validateUpdateArticleBody(body: UpdateArticleBody): void {
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

    private async validateDuplicateTitle(id: number, title: string): Promise<void> {
        const article = await this.articleRepository.createQueryBuilder('article')
            .where('article.id != :id', { id })
            .andWhere("article.drafted_metadata->>'slug' = :slug", { slug: title.toLowerCase().replace(/ /g, '-') })
            .getOne();

        if (article) {
            throw new BadRequestException('Article with the same title already exists');
        }
    }
}
