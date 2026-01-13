import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CloudFrontService } from "src/app/cloudfront.service";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { In, Repository } from "typeorm";
import { SearchArticleService, SearchResult } from "./searchArticle.service";

@Injectable()
export class GetArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly articleRepository: Repository<HelpCenterArticle>,
        private readonly cloudFrontService: CloudFrontService,
        private readonly searchArticleService: SearchArticleService,
    ) { }

    async getAllArticle(category_key: string, limit = 10, offset = 0): Promise<[HelpCenterArticle[], number]> {
        const where = {};
        if (category_key) {
            where['category_key'] = category_key;
        }
        return this.articleRepository.findAndCount({
            select: ['id', 'status', 'drafted_metadata', 'category_key', 'updated_at', 'published_at'],
            where,
            order: {
                created_at: 'DESC'
            },
            take: limit,
            skip: offset,
        });
    }

    async getDetailArticleById(id: number): Promise<HelpCenterArticle> {
        const article: HelpCenterArticle = await this.articleRepository.findOneOrFail({
            where: { id },
        });

        if (article.drafted_metadata.thumbnail) {
            article.thumbnail_url = this.cloudFrontService.generateSignedUrl(article.drafted_metadata.thumbnail);
        }
        return article;
    }

    async getPublishedArticleBySlug(slug: string): Promise<HelpCenterArticle> {
        const article = await this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.created_by_user', 'user')
            .select([
                'article.id',
                'article.published_content',
                'article.status',
                'article.category_key',
                'article.updated_at',
                'article.published_at',
                'article.published_metadata',
                'user.id',
                'user.name',
                'user.profile_image_key',
            ])
            .where("article.published_metadata->>'slug' = :slug", { slug })
            .andWhere('article.published_content IS NOT NULL')
            .getOneOrFail();

        if (article.published_metadata.thumbnail) {
            article.thumbnail_url = this.cloudFrontService.generateSignedUrl(article.published_metadata.thumbnail);
        }
        return article;
    }

    async getArticleBySearchQuery(query: string, limit = 10, offset = 0): Promise<[HelpCenterArticle[], number]> {
        const result: SearchResult = this.searchArticleService.search(query, limit, offset)

        if (result.total == 0) {
            return [[], 0]
        }
        const articles: HelpCenterArticle[] = await this.articleRepository.find({
            select: ['id', 'category_key', 'updated_at', 'published_metadata'],
            where: {
                id: In(result.results.map((value) => value.id))
            }
        })

        for (const article of articles) {
            if (article.published_metadata.thumbnail) {
                article.thumbnail_url = this.cloudFrontService.generateSignedUrl(article.published_metadata.thumbnail);
            }
        }

        return [articles, result.total];
    }

    async getArticleByCategoryType(query: string, limit = 10, offset = 0): Promise<[HelpCenterArticle[], number]> {
        // For category type searches, we directly query the database instead of using search
        const [articles, count] = await this.articleRepository.findAndCount({
            where: {
                category_key: query,
                use_as_guide: true
            },
            take: limit,
            skip: offset
        });

        for (const article of articles) {
            if (article.published_metadata?.thumbnail) {
                article.thumbnail_url = this.cloudFrontService.generateSignedUrl(article.published_metadata.thumbnail);
            }
        }

        return [articles, count];
    }
}
