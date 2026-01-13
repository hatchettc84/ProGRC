import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { UndoChangeArticleService } from './undoChangeArticle.service';

describe('UndoChangeArticleService', () => {
    let service: UndoChangeArticleService;
    let articleRepository: Repository<HelpCenterArticle>;

    const mockArticleRepository = {
        findOneOrFail: jest.fn(),
        update: jest.fn(),
    };

    const mockUserInfo = { userId: 'test-user' };
    const mockArticle = {
        id: 1,
        published_content: 'Published Content',
        published_metadata: { title: 'Published Title' },
    } as HelpCenterArticle;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UndoChangeArticleService,
                {
                    provide: getRepositoryToken(HelpCenterArticle),
                    useValue: mockArticleRepository,
                },
            ],
        }).compile();

        service = module.get<UndoChangeArticleService>(UndoChangeArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('undoChangeArticle', () => {
        it('should undo changes to an article successfully', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            jest.spyOn(articleRepository, 'update').mockResolvedValueOnce(undefined);

            await service.undoChangeArticle(mockUserInfo, 1);

            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).toHaveBeenCalledWith(
                1,
                {
                    drafted_metadata: mockArticle.published_metadata,
                    drafted_content: mockArticle.published_content,
                    updated_at: expect.any(Date),
                    updated_by: mockUserInfo.userId,
                }
            );
        });

        it('should throw EntityNotFoundError if article is not found', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockRejectedValueOnce(new EntityNotFoundError(HelpCenterArticle, 1));

            await expect(service.undoChangeArticle(mockUserInfo, 1)).rejects.toThrow(EntityNotFoundError);
            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).not.toHaveBeenCalled();
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'findOneOrFail').mockResolvedValueOnce(mockArticle);
            jest.spyOn(articleRepository, 'update').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.undoChangeArticle(mockUserInfo, 1)).rejects.toThrow('Repository error');
            expect(articleRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(articleRepository.update).toHaveBeenCalled();
        });
    });
});
