import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CloudFrontService } from "src/app/cloudfront.service";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { IsNull, Not, Repository } from "typeorm";

export class Category {
    name: string;
    description: string;
    key: string;
    articles?: HelpCenterArticle[];
}

const CATEGORIES: Category[] = [
    {
        name: 'Source',
        description: 'Source category',
        key: 'source',
    },
    {
        name: 'Assessments',
        description: 'Assessment category',
        key: 'assessment',
    },
    {
        name: 'Control & Control Enhancements',
        description: 'Control & Control Enhancements category',
        key: 'control_enhancement',
    },
    {
        name: 'User & permissions',
        description: 'User & permissions category',
        key: 'user_permissions',
    },
    {
        name: 'Application',
        description: 'Application category',
        key: 'application',
    },
];

const CATEGORY_MAP: Record<string, Category> = CATEGORIES.reduce((map, category) => {
    map[category.key] = category;
    return map;
}, {});

@Injectable()
export class GetCategoryService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly helpCenterArticleRepository: Repository<HelpCenterArticle>,
        private readonly cloudFrontService: CloudFrontService
    ) { }
    async getCategories(): Promise<Category[]> {
        return [
            {
                name: 'Source',
                description: 'Source category',
                key: 'source',
            },
            {
                name: 'Assessments',
                description: 'Assessment category',
                key: 'assessment',
            },
            {
                name: 'Control & Control Enhancements',
                description: 'Control & Control Enhancements category',
                key: 'control_enhancement',
            },
            {
                name: 'User & Permissions',
                description: 'User & permissions category',
                key: 'user_permissions',
            },
            {
                name: 'Application',
                description: 'Application category',
                key: 'application',
            },
        ];
    }

    async getCategoryByKey(key: string): Promise<Category> {
        const category = CATEGORY_MAP[key];
        if (!category) {
            throw new BadRequestException('Category not found');
        }
        return category;
    }

    async getAllCategoriesWithArticles(): Promise<Category[]> {
        const categories = CATEGORIES
            .map(category => ({ ...category }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const articles = await this.helpCenterArticleRepository.find({
            select: ['id', 'category_key', 'published_metadata', 'updated_at', 'published_at'],
            where: {
                published_content: Not(IsNull()),
            },
            order: {
                order_index: 'ASC',
            },
        });

        const articlesByCategory = articles.reduce((acc, article) => {
            if (!acc[article.category_key]) {
                acc[article.category_key] = [];
            }
            acc[article.category_key].push(article);
            return acc;
        }, {});

        for (const category of categories) {
            category.articles = articlesByCategory[category.key] || [];
            for (const article of category.articles) {
                article.thumbnail_url = article.published_metadata.thumbnail ? this.cloudFrontService.generateSignedUrl(article.published_metadata.thumbnail) : null;
            }
        }

        return categories;
    }
}
