import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CloudFrontService } from 'src/app/cloudfront.service';
import { HelpCenterArticle, HelpCenterArticleStatus } from 'src/entities/helpCenterArticle.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { GetCategoryService } from './getCategory.service';

describe('GetCategoryService', () => {
    let service: GetCategoryService;
    let articleRepository: Repository<HelpCenterArticle>;
    let cloudFrontService: CloudFrontService;

    const mockArticles: HelpCenterArticle[] = [
        {
            id: 1,
            category_key: 'source',
            drafted_metadata: {
                title: 'Test Article',
                description: 'Test Description',
                thumbnail: 'thumbnail1.jpg',
                keywords: 'test,article',
            },
            published_metadata: {
                title: 'Test Article',
                description: 'Test Description',
                thumbnail: 'thumbnail1.jpg',
                keywords: 'test,article',
            },
            thumbnail_url: 'test-thumbnail-url.jpg',
            status: HelpCenterArticleStatus.DRAFT,
            drafted_content: 'Test Content',
        } as HelpCenterArticle,
        {
            id: 1,
            category_key: 'assessment',
            drafted_metadata: {
                title: 'Test Article',
                description: 'Test Description',
                thumbnail: 'thumbnail2.jpg',
                keywords: 'test,article',
            },
            published_metadata: {
                title: 'Test Article',
                description: 'Test Description',
                thumbnail: 'thumbnail2.jpg',
                keywords: 'test,article',
            },
            thumbnail_url: 'test-thumbnail-url.jpg',
            status: HelpCenterArticleStatus.DRAFT,
            drafted_content: 'Test Content',
        } as HelpCenterArticle,
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetCategoryService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: {
                        find: jest.fn().mockResolvedValue(mockArticles),
                    },
                },
                {
                    provide: CloudFrontService,
                    useValue: {
                        generateSignedUrl: jest.fn((key: string) => `https://cdn.example.com/${key}`),
                    },
                },
            ],
        }).compile();

        service = module.get<GetCategoryService>(GetCategoryService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
        cloudFrontService = module.get<CloudFrontService>(CloudFrontService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllCategoriesWithArticles', () => {
        it('should return all categories with articles', async () => {
            const result = await service.getAllCategoriesWithArticles();

            console.log(result);
            expect(result).toEqual([
                {
                    name: 'Application',
                    description: 'Application category',
                    key: 'application',
                    articles: []
                },
                {
                    name: 'Assessments',
                    description: 'Assessment category',
                    key: 'assessment',
                    articles: [mockArticles[1]]
                },
                {
                    name: 'Control & Control Enhancements',
                    description: 'Control & Control Enhancements category',
                    key: 'control_enhancement',
                    articles: []
                },
                {
                    name: 'Source',
                    description: 'Source category',
                    key: 'source',
                    articles: [mockArticles[0]]
                },
                {
                    name: 'User & permissions',
                    description: 'User & permissions category',
                    key: 'user_permissions',
                    articles: []
                }
            ]);
            expect(articleRepository.find).toHaveBeenCalledWith({
                select: ['id', 'category_key', 'published_metadata', 'updated_at', 'published_at'],
                where: { published_content: Not(IsNull()) },
                order: { order_index: 'ASC' },
            });
            expect(cloudFrontService.generateSignedUrl).toHaveBeenCalledWith('thumbnail1.jpg');
            expect(cloudFrontService.generateSignedUrl).toHaveBeenCalledWith('thumbnail2.jpg');
        });

        it('should handle errors from repository', async () => {
            jest.spyOn(articleRepository, 'find').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.getAllCategoriesWithArticles()).rejects.toThrow('Repository error');
        });
    });

    describe('getCategoryByKey', () => {
        it('should return a category by key', async () => {
            const result = await service.getCategoryByKey('source');

            expect(result).toEqual({
                name: 'Source',
                description: 'Source category',
                key: 'source',
            });
        });

        it('should throw BadRequestException for invalid key', async () => {
            await expect(service.getCategoryByKey('invalid-key')).rejects.toThrow(BadRequestException);
        });
    });
});
