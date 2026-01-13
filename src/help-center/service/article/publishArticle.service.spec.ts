import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle, HelpCenterArticleStatus } from 'src/entities/helpCenterArticle.entity';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { PublishArticleService } from './publishArticle.service';
import { SearchArticleService } from './searchArticle.service';

describe('PublishArticleService', () => {
    let service: PublishArticleService;
    let articleRepository: Repository<HelpCenterArticle>;
    let searchArticleService: SearchArticleService;

    const mockArticleRepository = {
        findOneOrFail: jest.fn(),
        update: jest.fn(),
    };

    const mockSearchArticleService = {
        addOrUpdateDocument: jest.fn(),
    };

    const mockUserInfo = { userId: 'test-user' };
    const mockArticle = {
        id: 1,
        drafted_content: 'Drafted Content',
        drafted_metadata: { title: 'Drafted Title' },
    } as HelpCenterArticle;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublishArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
                {
                    provide: SearchArticleService,
                    useValue: mockSearchArticleService,
                },
            ],
        }).compile();

        service = module.get<PublishArticleService>(PublishArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
        searchArticleService = module.get<SearchArticleService>(SearchArticleService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('publishArticle', () => {
        it('should publish an article successfully', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            jest.spyOn(articleRepository, 'update').mockResolvedValueOnce(undefined);

            await service.publishArticle(mockUserInfo, 1);

            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                {
                    status: HelpCenterArticleStatus.PUBLISHED,
                    published_content: mockArticle.drafted_content,
                    published_metadata: mockArticle.drafted_metadata,
                    published_at: expect.any(Date),
                    updated_at: expect.any(Date),
                    updated_by: mockUserInfo.userId,
                    published_by: mockUserInfo.userId,
                }
            );
            expect(searchArticleService.addOrUpdateDocument).toHaveBeenCalledWith(1);
        });

        it('should throw EntityNotFoundError if article is not found', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockRejectedValueOnce(new EntityNotFoundError(HelpCenterArticle, 1));

            await expect(service.publishArticle(mockUserInfo, 1)).rejects.toThrow(EntityNotFoundError);
            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).not.toHaveBeenCalled();
            expect(searchArticleService.addOrUpdateDocument).not.toHaveBeenCalled();
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            jest.spyOn(articleRepository, 'update').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.publishArticle(mockUserInfo, 1)).rejects.toThrow('Repository error');
            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).toHaveBeenCalled();
            expect(searchArticleService.addOrUpdateDocument).not.toHaveBeenCalled();
        });
    });
});
