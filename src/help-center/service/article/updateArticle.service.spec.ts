import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle, HelpCenterArticleStatus } from 'src/entities/helpCenterArticle.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { GetCategoryService } from '../category/getCategory.service';
import { UpdateArticleBody, UpdateArticleService } from './updateArticle.service';

describe('UpdateArticleService', () => {
    let service: UpdateArticleService;
    let articleRepository: Repository<HelpCenterArticle>;

    const mockArticleRepository = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        update: jest.fn(),
    };

    const mockUpdateArticleBody: UpdateArticleBody = {
        title: 'Updated Article',
        description: 'Updated Description',
        content: 'Updated Content',
        thumbnail: 'updated-thumbnail.jpg',
        keywords: 'updated,article',
        categoryKey: 'updated-category',
    };

    const mockUserInfo = { userId: 'test-user' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
                {
                    provide: GetCategoryService,
                    useValue: {
                        getCategoryByKey: jest.fn().mockResolvedValue({ key: 'updated-category' }),
                    },
                },
            ],
        }).compile();

        service = module.get<UpdateArticleService>(UpdateArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateArticle', () => {
        it('should update an article successfully', async () => {
            const mockUpdateResult = { affected: 1 } as any;
            jest.spyOn(articleRepository, 'update').mockResolvedValueOnce(mockUpdateResult);

            await service.updateArticle(mockUserInfo, 1, mockUpdateArticleBody);

            expect(articleRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                {
                    drafted_metadata: {
                        title: mockUpdateArticleBody.title,
                        description: mockUpdateArticleBody.description,
                        thumbnail: mockUpdateArticleBody.thumbnail,
                        slug: mockUpdateArticleBody.title.toLowerCase().replace(/ /g, '-'),
                        keywords: mockUpdateArticleBody.keywords,
                    },
                    drafted_content: mockUpdateArticleBody.content,
                    category_key: mockUpdateArticleBody.categoryKey,
                    status: HelpCenterArticleStatus.DRAFT,
                    updated_at: expect.any(Date),
                    updated_by: mockUserInfo.userId,
                }
            );
        });

        it('should throw EntityNotFoundError if article is not found', async () => {
            const mockUpdateResult = { affected: 0 } as any;
            jest.spyOn(articleRepository, 'update').mockResolvedValueOnce(mockUpdateResult);

            await expect(service.updateArticle(mockUserInfo, 1, mockUpdateArticleBody)).rejects.toThrow(EntityNotFoundError);
            expect(articleRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                expect.any(Object)
            );
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'update').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.updateArticle(mockUserInfo, 1, mockUpdateArticleBody)).rejects.toThrow('Failed to update article');
            expect(articleRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                expect.any(Object)
            );
        });
    });

    describe('validateUpdateArticleBody', () => {
        it('should throw BadRequestException if title is missing', () => {
            const invalidRequest = { ...mockUpdateArticleBody, title: '' };

            expect(() => service['validateUpdateArticleBody'](invalidRequest)).toThrow('Title is required');
        });

        it('should throw BadRequestException if description is missing', () => {
            const invalidRequest = { ...mockUpdateArticleBody, description: '' };

            expect(() => service['validateUpdateArticleBody'](invalidRequest)).toThrow('Description is required');
        });

        it('should throw BadRequestException if content is missing', () => {
            const invalidRequest = { ...mockUpdateArticleBody, content: '' };

            expect(() => service['validateUpdateArticleBody'](invalidRequest)).toThrow('Content is required');
        });

        it('should throw BadRequestException if keywords are missing', () => {
            const invalidRequest = { ...mockUpdateArticleBody, keywords: '' };

            expect(() => service['validateUpdateArticleBody'](invalidRequest)).toThrow('Keywords are required');
        });

        it('should throw BadRequestException if categoryKey is missing', () => {
            const invalidRequest = { ...mockUpdateArticleBody, categoryKey: '' };

            expect(() => service['validateUpdateArticleBody'](invalidRequest)).toThrow('Category key is required');
        });
    });

    describe('validateDuplicateTitle', () => {
        it('should throw BadRequestException if duplicate title exists', async () => {
            jest.spyOn(articleRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce({ id: 2 } as HelpCenterArticle);

            await expect(service['validateDuplicateTitle'](1, 'Updated Article')).rejects.toThrow('Article with the same title already exists');
        });

        it('should not throw if no duplicate title exists', async () => {
            jest.spyOn(articleRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce(null);

            await expect(service['validateDuplicateTitle'](1, 'Updated Article')).resolves.not.toThrow();
        });
    });
});
