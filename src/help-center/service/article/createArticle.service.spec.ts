import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { InsertResult, Repository } from 'typeorm';
import { GetCategoryService } from '../category/getCategory.service';
import { CreateArticleService, CreateDraftArticleRequest } from './createArticle.service';

describe('CreateArticleService', () => {
    let service: CreateArticleService;
    let articleRepository: Repository<HelpCenterArticle>;
    let getCategoryService: GetCategoryService;

    const mockArticleRepository = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        insert: jest.fn(),
    };

    const mockGetCategoryService = {
        getCategoryByKey: jest.fn(),
    };

    const mockCreateDraftArticleRequest: CreateDraftArticleRequest = {
        title: 'Test Article',
        description: 'Test Description',
        content: 'Test Content',
        thumbnail: 'test-thumbnail.jpg',
        keywords: 'test,article',
        categoryKey: 'test-category',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
                {
                    provide: GetCategoryService,
                    useValue: mockGetCategoryService,
                },
            ],
        }).compile();

        service = module.get<CreateArticleService>(CreateArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
        getCategoryService = module.get<GetCategoryService>(GetCategoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createDraftArticle', () => {
        it('should create a draft article successfully', async () => {
            const mockInsertResult = { identifiers: [{ id: 1 }] } as unknown as InsertResult;
            jest.spyOn(articleRepository, 'insert').mockResolvedValueOnce(mockInsertResult);
            jest.spyOn(getCategoryService, 'getCategoryByKey').mockResolvedValueOnce({ key: 'test-category' } as any);

            const result = await service.createDraftArticle({ userId: 'test-user' }, mockCreateDraftArticleRequest);

            expect(result).toBe(1);
            expect(articleRepository.insert).toHaveBeenCalled();
            expect(getCategoryService.getCategoryByKey).toHaveBeenCalledWith('test-category');
        });

        it('should throw BadRequestException if validation fails', async () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, title: '' };

            await expect(service.createDraftArticle({ userId: 'test-user' }, invalidRequest))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if duplicate title exists', async () => {
            jest.spyOn(articleRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce({ id: 1 } as any);

            await expect(service.createDraftArticle({ userId: 'test-user' }, mockCreateDraftArticleRequest))
                .rejects.toThrow('Article with the same title already exists');
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'insert').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.createDraftArticle({ userId: 'test-user' }, mockCreateDraftArticleRequest))
                .rejects.toThrow('Failed to create article');
        });
    });

    describe('validateCreateArticleData', () => {
        it('should throw BadRequestException if title is missing', () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, title: '' };

            expect(() => service['validateCreateArticleData'](invalidRequest))
                .toThrow('Title is required');
        });

        it('should throw BadRequestException if description is missing', () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, description: '' };

            expect(() => service['validateCreateArticleData'](invalidRequest))
                .toThrow('Description is required');
        });

        it('should throw BadRequestException if content is missing', () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, content: '' };

            expect(() => service['validateCreateArticleData'](invalidRequest))
                .toThrow('Content is required');
        });

        it('should throw BadRequestException if keywords are missing', () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, keywords: '' };

            expect(() => service['validateCreateArticleData'](invalidRequest))
                .toThrow('Keywords are required');
        });

        it('should throw BadRequestException if categoryKey is missing', () => {
            const invalidRequest = { ...mockCreateDraftArticleRequest, categoryKey: '' };

            expect(() => service['validateCreateArticleData'](invalidRequest))
                .toThrow('Category key is required');
        });
    });

    describe('validateDuplicateTitle', () => {
        it('should throw BadRequestException if duplicate title exists', async () => {
            jest.spyOn(articleRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce({ id: 1 } as any);

            await expect(service['validateDuplicateTitle']('Test Article'))
                .rejects.toThrow('Article with the same title already exists');
        });

        it('should not throw if no duplicate title exists', async () => {
            jest.spyOn(articleRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce(null);

            await expect(service['validateDuplicateTitle']('Test Article'))
                .resolves.not.toThrow();
        });
    });
});
