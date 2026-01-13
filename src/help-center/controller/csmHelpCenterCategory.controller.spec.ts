import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { AuthGuard } from 'src/guards/authGuard';
import { Category, GetCategoryService } from '../service/category/getCategory.service';
import { CsmHelpCenterCategoryController } from './csmHelpCenterCategory.controller';

describe('CsmHelpCenterCategoryController', () => {
    let controller: CsmHelpCenterCategoryController;
    let getCategoryService: GetCategoryService;

    const mockCategories: Category[] = [
        {
            name: 'Source',
            description: 'Source category',
            key: 'source',
        },
        {
            name: 'Assessment',
            description: 'Assessment category',
            key: 'assessment',
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CsmHelpCenterCategoryController],
            providers: [
                {
                    provide: GetCategoryService,
                    useValue: {
                        getCategories: jest.fn().mockResolvedValue({
                            code: '200',
                            message: 'Success',
                            data: mockCategories,
                        }),
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

        controller = module.get<CsmHelpCenterCategoryController>(CsmHelpCenterCategoryController);
        getCategoryService = module.get<GetCategoryService>(GetCategoryService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getCategories', () => {
        it('should return categories successfully', async () => {
            const mockRequest = {
                user_data: {
                    role_id: 'CSM',
                },
            };

            const result = await controller.getCategories(mockRequest);

            expect(result).toEqual({
                code: '200',
                message: 'Success',
                data: mockCategories,
            });
            expect(getCategoryService.getCategories).toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const mockRequest = {
                user_data: {
                    role_id: 'CSM',
                },
            };

            jest.spyOn(getCategoryService, 'getCategories')
                .mockRejectedValueOnce(new Error('Service error'));

            await expect(controller.getCategories(mockRequest))
                .rejects.toThrow('Service error');
        });
    });
});
