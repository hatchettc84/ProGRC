import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { HelpCenterArticle, HelpCenterArticleStatus } from 'src/entities/helpCenterArticle.entity';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from 'src/guards/authGuard';
import { GetArticleService } from '../service/article/getArticle.service';
import { AskAiService } from '../service/askAi.service';
import { Category, GetCategoryService } from '../service/category/getCategory.service';
import { HelpCenterController } from './helpCenter.controller';

describe('HelpCenterController', () => {
    let controller: HelpCenterController;
    let getCategoryService: GetCategoryService;
    let getArticleService: GetArticleService;
    let askAiService: AskAiService;

    const mockCategories: Category[] = [
        {
            name: 'Source',
            description: 'Source category',
            key: 'source',
            articles: [
                {
                    id: 7,
                    published_metadata: {
                        title: 'Test abc2',
                        description: 'Description',
                        thumbnail: 'thumbnail_20241203T100534583Z.jpg',
                        slug: 'test-abc2',
                        keywords: 'test, abc',
                    },
                    published_content: 'Content',
                    status: HelpCenterArticleStatus.PUBLISHED,
                    category_key: 'source',
                    thumbnail_url: 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg',
                    updated_at: new Date('2024-12-03T10:14:55.796Z'),
                    published_at: new Date('2024-12-03T08:24:17.132Z'),
                    created_by_user: {
                        id: 1,
                        name: 'Test User',
                        profile_image_key: 'profile_image_20241203T100534583Z.jpg',
                    } as unknown as User,
                } as HelpCenterArticle,
            ],
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HelpCenterController],
            providers: [
                {
                    provide: GetCategoryService,
                    useValue: {
                        getAllCategoriesWithArticles: jest.fn().mockResolvedValue(mockCategories),
                    },
                },
                {
                    provide: GetArticleService,
                    useValue: {
                        getPublishedArticleBySlug: jest.fn(),
                        getArticleBySearchQuery: jest.fn(),
                    },
                },
                {
                    provide: AskAiService,
                    useValue: {
                        question: jest.fn(),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {},
                },
                {
                    provide: AuthGuard,
                    useValue: {},
                },
                {
                    provide: RoleHierarchyService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<HelpCenterController>(HelpCenterController);
        getCategoryService = module.get<GetCategoryService>(GetCategoryService);
        getArticleService = module.get<GetArticleService>(GetArticleService);
        askAiService = module.get<AskAiService>(AskAiService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getCategoriesWithArticle', () => {
        it('should return categories with articles', async () => {
            const result = await controller.getCategoriesWithArticle();

            expect(result[0]).toEqual({
                'articles': [
                    {
                        'category_key': 'source',
                        'description': 'Description',
                        'id': 7,
                        'published_at': new Date('2024-12-03T08:24:17.132Z'),
                        'slug': 'test-abc2',
                        'thumbnail': 'thumbnail_20241203T100534583Z.jpg',
                        'thumbnail_url': 'https://cdn.example.com/thumbnail_20241203T100534583Z.jpg',
                        'title': 'Test abc2',
                        'updated_at': new Date('2024-12-03T10:14:55.796Z')
                    }
                ],
                'description': 'Source category',
                'key': 'source',
                'name': 'Source'
            });
            expect(getCategoryService.getAllCategoriesWithArticles).toHaveBeenCalled();
        });

        it('should handle errors from category service', async () => {
            jest.spyOn(getCategoryService, 'getAllCategoriesWithArticles')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.getCategoriesWithArticle()).rejects.toThrow();
        });
    });

    describe('getPublishedArticleBySlug', () => {
        const mockArticle = mockCategories[0].articles[0];
        const mockResult = {
            id: mockArticle.id,
            title: mockArticle.published_metadata.title,
            description: mockArticle.published_metadata.description,
            content: mockArticle.published_content,
            slug: mockArticle.published_metadata.slug,
            category_key: mockArticle.category_key,
            thumbnail_url: mockArticle.thumbnail_url,
            created_by: {
                id: mockArticle.created_by_user.id,
                name: mockArticle.created_by_user.name,
                profile_image_url: mockArticle.created_by_user.profile_image_key,
            },
            updated_at: mockArticle.updated_at,
            published_at: mockArticle.published_at,
        }

        it('should return an article by slug', async () => {
            jest.spyOn(getArticleService, 'getPublishedArticleBySlug')
                .mockResolvedValueOnce(mockArticle);

            const result = await controller.getArticlesBySlug(
                'test-abc2',
            );

            expect(result).toEqual(mockResult);
        });

        it('should throw BadRequestException for invalid slug', async () => {
            jest.spyOn(getArticleService, 'getPublishedArticleBySlug')
                .mockRejectedValueOnce(new Error('Article not found'));

            await expect(controller.getArticlesBySlug(
                'invalid-slug'
            )).rejects.toThrow();
        });
    });

    describe('searchArticles', () => {
        const mockSearchResults: [HelpCenterArticle[], number] = [mockCategories[0].articles, 1];

        it('should return search results', async () => {
            jest.spyOn(getArticleService, 'getArticleBySearchQuery')
                .mockResolvedValueOnce(mockSearchResults);

            const result = await controller.getArticles('test', 10, 0);

            expect(result.code).toBe('200');
            expect(result.message).toBe('success');
            expect(result.data[0]).toEqual({
                id: mockSearchResults[0][0].id,
                title: mockSearchResults[0][0].published_metadata.title,
                description: mockSearchResults[0][0].published_metadata.description,
                slug: mockSearchResults[0][0].published_metadata.slug,
                category_key: mockSearchResults[0][0].category_key,
                thumbnail_url: mockSearchResults[0][0].thumbnail_url,
                updated_at: mockSearchResults[0][0].updated_at,
                published_at: mockSearchResults[0][0].published_at,
            });
            expect(result.meta.total).toBe(mockSearchResults[1]);
        });

        it('should throw BadRequestException for empty query', async () => {
            await expect(controller.getArticles('', 10, 0))
                .rejects.toThrow(BadRequestException);
        });
    });
});
