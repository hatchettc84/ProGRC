import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { HelpCenterArticle, HelpCenterArticleStatus } from 'src/entities/helpCenterArticle.entity';
import { AuthGuard } from 'src/guards/authGuard';
import { CreateArticleRequest, UpdateArticleRequest } from '../helpCenter.dto';
import { CreateArticleService } from '../service/article/createArticle.service';
import { DeleteArticleService } from '../service/article/deleteArticle.service';
import { GetArticleService } from '../service/article/getArticle.service';
import { PublishArticleService } from '../service/article/publishArticle.service';
import { UndoChangeArticleService } from '../service/article/undoChangeArticle.service';
import { UpdateArticleService } from '../service/article/updateArticle.service';
import { UploadThumbnailService } from '../service/article/uploadThumbnail.service';
import { CsmHelpCenterArticleController } from './csmHelpCenterArticle.controller';

describe('CsmHelpCenterArticleController', () => {
    let controller: CsmHelpCenterArticleController;
    let createArticleService: CreateArticleService;
    let getArticleService: GetArticleService;
    let deleteArticleService: DeleteArticleService;
    let updateArticleService: UpdateArticleService;
    let publishArticleService: PublishArticleService;
    let uploadThumbnailService: UploadThumbnailService;
    let undoChangeArticleService: UndoChangeArticleService;

    const mockRequest = {
        user_data: {
            userId: 'test-user-id',
            role_id: 'CSM'
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CsmHelpCenterArticleController],
            providers: [
                {
                    provide: CreateArticleService,
                    useValue: {
                        createDraftArticle: jest.fn(),
                    },
                },
                {
                    provide: GetArticleService,
                    useValue: {
                        getDetailArticleById: jest.fn(),
                        getArticleBySearchQuery: jest.fn(),
                    },
                },
                {
                    provide: DeleteArticleService,
                    useValue: {
                        deleteArticleById: jest.fn(),
                    },
                },
                {
                    provide: UpdateArticleService,
                    useValue: {
                        updateArticle: jest.fn(),
                    },
                },
                {
                    provide: PublishArticleService,
                    useValue: {
                        publishArticle: jest.fn(),
                    },
                },
                {
                    provide: UploadThumbnailService,
                    useValue: {
                        uploadThumbnail: jest.fn(),
                    },
                },
                {
                    provide: UndoChangeArticleService,
                    useValue: {
                        undoChangeArticle: jest.fn(),
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

        controller = module.get<CsmHelpCenterArticleController>(CsmHelpCenterArticleController);
        createArticleService = module.get<CreateArticleService>(CreateArticleService);
        getArticleService = module.get<GetArticleService>(GetArticleService);
        deleteArticleService = module.get<DeleteArticleService>(DeleteArticleService);
        updateArticleService = module.get<UpdateArticleService>(UpdateArticleService);
        publishArticleService = module.get<PublishArticleService>(PublishArticleService);
        uploadThumbnailService = module.get<UploadThumbnailService>(UploadThumbnailService);
        undoChangeArticleService = module.get<UndoChangeArticleService>(UndoChangeArticleService);
    });

    describe('createArticle', () => {
        const mockCreateArticleRequest: CreateArticleRequest = {
            title: 'Test Article',
            content: 'Test Content',
            description: 'Test Description',
            thumbnail: 'test-thumbnail.jpg',
            keywords: 'test,article',
            categoryKey: 'test-category'
        };

        it('should create a draft article successfully', async () => {
            const expectedArticleId = 1;
            jest.spyOn(createArticleService, 'createDraftArticle')
                .mockResolvedValueOnce(expectedArticleId);

            const result = await controller.createArticle(mockRequest, mockCreateArticleRequest);

            expect(result).toEqual({ id: expectedArticleId });
            expect(createArticleService.createDraftArticle).toHaveBeenCalledWith(
                mockRequest.user_data,
                mockCreateArticleRequest
            );
        });

        it('should handle service errors during article creation', async () => {
            jest.spyOn(createArticleService, 'createDraftArticle')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.createArticle(mockRequest, mockCreateArticleRequest))
                .rejects.toThrow('Service error');
        });
    });

    describe('uploadThumbnail', () => {
        const mockFile: Express.Multer.File = {
            fieldname: 'file',
            originalname: 'test.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
            size: 4,
            destination: '',
            filename: 'test.jpg',
            path: '',
            stream: null
        };

        it('should upload thumbnail successfully', async () => {
            const expectedFileName = 'thumbnail_20210901120000Z.jpg';
            const expectedUrl = 'http://cdn/' + expectedFileName;
            jest.spyOn(uploadThumbnailService, 'uploadThumbnail')
                .mockResolvedValueOnce({ fileName: expectedFileName, url: expectedUrl });

            const result = await controller.uploadThumbnail(mockFile);

            expect(result).toEqual({ thumbnail: expectedFileName, thumbnail_url: expectedUrl });
            expect(uploadThumbnailService.uploadThumbnail)
                .toHaveBeenCalledWith(mockFile);
        });

        it('should handle service errors during thumbnail upload', async () => {
            jest.spyOn(uploadThumbnailService, 'uploadThumbnail')
                .mockRejectedValueOnce(new Error('Upload error'));

            await expect(controller.uploadThumbnail(mockFile))
                .rejects.toThrow('Upload error');
        });
    });

    describe('getPublishedArticle', () => {
        const mockArticle = new HelpCenterArticle();
        mockArticle.id = 1;
        mockArticle.category_key = 'test-category';
        mockArticle.drafted_metadata = {
            title: 'Test Article',
            description: 'Test Description',
            thumbnail: 'test-thumbnail.jpg',
            slug: 'test-article',
            keywords: 'test,article',
        };
        mockArticle.drafted_content = 'Test Content';
        mockArticle.published_content = 'Published Content';
        mockArticle.published_metadata = {
            title: 'Test Article',
            description: 'Test Description',
            thumbnail: 'test-thumbnail.jpg',
            slug: 'test-article',
            keywords: 'test,article',
        };
        mockArticle.thumbnail_url = 'test-thumbnail-url.jpg';
        mockArticle.status = HelpCenterArticleStatus.DRAFT;

        it('should return an article by slug', async () => {
            jest.spyOn(getArticleService, 'getDetailArticleById')
                .mockResolvedValueOnce(mockArticle);

            const result = await controller.getArticle(1);

            expect(result).toEqual({
                id: mockArticle.id,
                title: mockArticle.drafted_metadata.title,
                description: mockArticle.drafted_metadata.description,
                slug: mockArticle.drafted_metadata.slug,
                category_key: mockArticle.category_key,
                status: mockArticle.status,
                keywords: mockArticle.drafted_metadata.keywords,
                thumbnail: mockArticle.drafted_metadata.thumbnail,
                thumbnail_url: mockArticle.thumbnail_url,
                have_different: true,
                content: mockArticle.status === HelpCenterArticleStatus.PUBLISHED ? mockArticle.published_content : mockArticle.drafted_content,
                updated_at: mockArticle.updated_at,
                published_at: mockArticle.published_at
            });
        });

        it('should throw BadRequestException for invalid slug', async () => {
            jest.spyOn(getArticleService, 'getDetailArticleById')
                .mockRejectedValueOnce(new Error('Article not found'));

            await expect(controller.getArticle(1))
                .rejects.toThrow('Article not found');
        });
    });

    describe('updateArticle', () => {
        const mockUpdateArticleRequest: UpdateArticleRequest = {
            title: 'Updated Article',
            content: 'Updated Content',
            description: 'Updated Description',
            thumbnail: 'updated-thumbnail.jpg',
            keywords: 'updated,article',
            categoryKey: 'updated-category'
        };

        it('should update an article successfully', async () => {
            jest.spyOn(updateArticleService, 'updateArticle')
                .mockResolvedValueOnce(undefined);

            await controller.updateArticle(mockRequest, 1, mockUpdateArticleRequest);

            expect(updateArticleService.updateArticle).toHaveBeenCalledWith(
                mockRequest.user_data,
                1,
                mockUpdateArticleRequest
            );
        });

        it('should handle service errors during article update', async () => {
            jest.spyOn(updateArticleService, 'updateArticle')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.updateArticle(mockRequest, 1, mockUpdateArticleRequest))
                .rejects.toThrow('Service error');
        });
    });

    describe('deleteArticle', () => {
        it('should delete an article successfully', async () => {
            jest.spyOn(deleteArticleService, 'deleteArticleById')
                .mockResolvedValueOnce(undefined);

            await controller.deleteArticle(1);

            expect(deleteArticleService.deleteArticleById).toHaveBeenCalledWith(1);
        });

        it('should handle service errors during article deletion', async () => {
            jest.spyOn(deleteArticleService, 'deleteArticleById')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.deleteArticle(1))
                .rejects.toThrow('Service error');
        });
    });

    describe('publishArticle', () => {
        it('should publish an article successfully', async () => {
            jest.spyOn(publishArticleService, 'publishArticle')
                .mockResolvedValueOnce(undefined);

            await controller.publishArticle(mockRequest, 1);

            expect(publishArticleService.publishArticle).toHaveBeenCalledWith(mockRequest.user_data, 1);
        });

        it('should handle service errors during article publication', async () => {
            jest.spyOn(publishArticleService, 'publishArticle')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.publishArticle(mockRequest, 1))
                .rejects.toThrow('Service error');
        });
    });

    describe('undoChangeArticle', () => {
        it('should undo changes to an article successfully', async () => {
            jest.spyOn(undoChangeArticleService, 'undoChangeArticle')
                .mockResolvedValueOnce(undefined);

            await controller.unpublishArticle(mockRequest, 1);

            expect(undoChangeArticleService.undoChangeArticle).toHaveBeenCalledWith(mockRequest.user_data, 1);
        });

        it('should handle service errors during undo changes', async () => {
            jest.spyOn(undoChangeArticleService, 'undoChangeArticle')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.unpublishArticle(mockRequest, 1))
                .rejects.toThrow('Service error');
        });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
