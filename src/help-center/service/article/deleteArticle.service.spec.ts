import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { DeleteResult, EntityNotFoundError, Repository } from 'typeorm';
import { DeleteArticleService } from './deleteArticle.service';
import { SearchArticleService } from './searchArticle.service';

describe('DeleteArticleService', () => {
    let service: DeleteArticleService;
    let articleRepository: Repository<HelpCenterArticle>;
    let searchArticleService: SearchArticleService;

    const mockArticleRepository = {
        delete: jest.fn(),
    };

    const mockSearchArticleService = {
        removeDocument: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteArticleService,
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

        service = module.get<DeleteArticleService>(DeleteArticleService);
        articleRepository = module.get<Repository<HelpCenterArticle>>(getRepositoryToken(HelpCenterArticle));
        searchArticleService = module.get<SearchArticleService>(SearchArticleService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('deleteArticleById', () => {
        it('should delete an article successfully', async () => {
            const mockDeleteResult: DeleteResult = { affected: 1 } as unknown as DeleteResult;
            jest.spyOn(articleRepository, 'delete').mockResolvedValueOnce(mockDeleteResult);

            await service.deleteArticleById(1);

            expect(articleRepository.delete).toHaveBeenCalledWith({ id: 1 });
            expect(searchArticleService.removeDocument).toHaveBeenCalledWith(1);
        });

        it('should throw EntityNotFoundError if article is not found', async () => {
            const mockDeleteResult: DeleteResult = { affected: 0 } as unknown as DeleteResult;
            jest.spyOn(articleRepository, 'delete').mockResolvedValueOnce(mockDeleteResult);

            await expect(service.deleteArticleById(1)).rejects.toThrow(EntityNotFoundError);
            expect(articleRepository.delete).toHaveBeenCalledWith({ id: 1 });
            expect(searchArticleService.removeDocument).not.toHaveBeenCalled();
        });

        it('should handle repository errors', async () => {
            jest.spyOn(articleRepository, 'delete').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.deleteArticleById(1)).rejects.toThrow('Repository error');
            expect(articleRepository.delete).toHaveBeenCalledWith({ id: 1 });
            expect(searchArticleService.removeDocument).not.toHaveBeenCalled();
        });
    });
});
