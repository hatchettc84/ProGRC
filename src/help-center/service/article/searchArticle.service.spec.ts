import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { SearchArticleService } from './searchArticle.service';

describe('SearchArticleService', () => {
    let service: SearchArticleService;
    let articleRepository: Repository<HelpCenterArticle>;

    const mockArticleRepository = {
        find: jest.fn(),
        findOneOrFail: jest.fn(),
    };

    const mockArticles: HelpCenterArticle[] = [
        {
            id: 1,
            published_content: 'Content 1',
            published_metadata: {
                title: 'Test Article 1',
                description: 'Description 1',
                keywords: 'test, article',
                category_key: 'source',
                thumbnail: 'thumbnail1.jpg',
            },
            updated_at: new Date(),
            published_at: new Date(),
        } as unknown as HelpCenterArticle,
        {
            id: 2,
            published_content: 'Content 2',
            published_metadata: {
                title: 'Test Article 2',
                description: 'Description 2',
                keywords: 'test, article',
                category_key: 'assessment',
                thumbnail: 'thumbnail2.jpg',
            },
            updated_at: new Date(),
            published_at: new Date(),
        } as unknown as HelpCenterArticle,
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
            ],
        }).compile();

        service = module.get<SearchArticleService>(SearchArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('initializeSearchIndex', () => {
        it('should initialize the search index with articles', async () => {
            jest.spyOn(articleRepository, 'find').mockResolvedValueOnce(mockArticles);

            await service.onModuleInit();

            expect(articleRepository.find).toHaveBeenCalledWith({
                where: { published_content: Not(IsNull()) },
                select: ['id', 'published_metadata', 'published_content'],
            });

            const searchResults = service.search('Test');
            expect(searchResults.total).toBeGreaterThan(0);
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'find').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.onModuleInit()).rejects.toThrow('Repository error');
        });
    });

    describe('addOrUpdateDocument', () => {
        it('should add or update a document in the search index', async () => {
            const mockArticle = mockArticles[0];
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            await service.addOrUpdateDocument(mockArticle.id);

            const searchResults = service.search(mockArticle.published_metadata.title);
            expect(searchResults.total).toBeGreaterThan(0);
        });
    });

    describe('removeDocument', () => {
        it('should remove a document from the search index', async () => {
            const mockArticle = mockArticles[0];
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            await service.addOrUpdateDocument(mockArticle.id);

            service.removeDocument(mockArticle.id);

            const searchResults = service.search(mockArticle.published_metadata.title);
            expect(searchResults.total).toBe(0);
        });
    });

    describe('search', () => {
        it('should return search results', async () => {
            jest.spyOn(articleRepository, 'find').mockResolvedValueOnce(mockArticles);
            await service.onModuleInit();

            const searchResults = service.search('Test');
            expect(searchResults.total).toBeGreaterThan(0);
        });

        it('should return no results for non-matching query', async () => {
            jest.spyOn(articleRepository, 'find').mockResolvedValueOnce(mockArticles);
            await service.onModuleInit();

            const searchResults = service.search('Non-matching query');
            expect(searchResults.total).toBe(0);
        });
    });
});
