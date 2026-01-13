import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CloudFrontService } from 'src/app/cloudfront.service';
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { In, Repository } from 'typeorm';
import { GetArticleService } from './getArticle.service';
import { SearchArticleService, SearchResult } from './searchArticle.service';

describe('GetArticleService', () => {
    let service: GetArticleService;
    let articleRepository: Repository<HelpCenterArticle>;
    let searchArticleService: SearchArticleService;
    let cloudFrontService: CloudFrontService;

    const mockArticleRepository = {
        find: jest.fn(),
    };

    const mockSearchArticleService = {
        search: jest.fn(),
    };

    const mockCloudFrontService = {
        generateSignedUrl: jest.fn(),
    };

    const mockArticles: HelpCenterArticle[] = [
        {
            id: 1,
            category_key: 'source',
            updated_at: new Date(),
            published_metadata: {
                title: 'Test Article 1',
                description: 'Description 1',
                thumbnail: 'thumbnail1.jpg',
            },
            thumbnail_url: '',
        } as HelpCenterArticle,
        {
            id: 2,
            category_key: 'assessment',
            updated_at: new Date(),
            published_metadata: {
                title: 'Test Article 2',
                description: 'Description 2',
                thumbnail: 'thumbnail2.jpg',
            },
            thumbnail_url: '',
        } as HelpCenterArticle,
    ];

    const mockSearchResult: SearchResult = {
        total: 2,
        results: [
            { ref: '1', score: 1 },
            { ref: '2', score: 1 },
        ] as any,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
                {
                    provide: SearchArticleService,
                    useValue: mockSearchArticleService,
                },
                {
                    provide: CloudFrontService,
                    useValue: mockCloudFrontService,
                },
            ],
        }).compile();

        service = module.get<GetArticleService>(GetArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
        searchArticleService = module.get<SearchArticleService>(SearchArticleService);
        cloudFrontService = module.get<CloudFrontService>(CloudFrontService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getArticleBySearchQuery', () => {
        it('should return articles and total count for a successful search', async () => {
            jest.spyOn(searchArticleService, 'search').mockReturnValueOnce(mockSearchResult);
            jest.spyOn(articleRepository, 'find').mockResolvedValueOnce(mockArticles);
            jest.spyOn(cloudFrontService, 'generateSignedUrl').mockImplementation((key: string) => `https://cdn.example.com/${key}`);

            const result = await service.getArticleBySearchQuery('Test', 10, 0);

            expect(result).toEqual([mockArticles, mockSearchResult.total]);
            expect(searchArticleService.search).toHaveBeenCalledWith('Test', 10, 0);
            expect(articleRepository.find).toHaveBeenCalledWith({
                select: ['id', 'category_key', 'updated_at', 'published_metadata'],
                where: { id: In(['1', '2']) },
            });
            expect(cloudFrontService.generateSignedUrl).toHaveBeenCalledWith('thumbnail1.jpg');
            expect(cloudFrontService.generateSignedUrl).toHaveBeenCalledWith('thumbnail2.jpg');
        });

        it('should return empty array and zero total count for no results', async () => {
            const emptySearchResult: SearchResult = { total: 0, results: [] };
            jest.spyOn(searchArticleService, 'search').mockReturnValueOnce(emptySearchResult);

            const result = await service.getArticleBySearchQuery('Non-matching query', 10, 0);

            expect(result).toEqual([[], 0]);
            expect(searchArticleService.search).toHaveBeenCalledWith('Non-matching query', 10, 0);
            expect(articleRepository.find).not.toHaveBeenCalled();
            expect(cloudFrontService.generateSignedUrl).not.toHaveBeenCalled();
        });

        it('should handle repository errors', async () => {
            jest.spyOn(searchArticleService, 'search').mockReturnValueOnce(mockSearchResult);
            jest.spyOn(articleRepository, 'find').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.getArticleBySearchQuery('Test', 10, 0)).rejects.toThrow('Repository error');
            expect(searchArticleService.search).toHaveBeenCalledWith('Test', 10, 0);
            expect(articleRepository.find).toHaveBeenCalled();
            expect(cloudFrontService.generateSignedUrl).not.toHaveBeenCalled();
        });
    });
});
