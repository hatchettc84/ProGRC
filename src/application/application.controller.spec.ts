import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { AuthGuard } from 'src/guards/authGuard';
import { ApplicationController } from './application.controller';
import { ApplicationSummaryResponse } from './application.dto';
import { CreateApplicationService } from './createApplication.service';
import { DeleteApplicationService } from './deleteApplication.service';
import { GetApplicationService } from './getApplication.service';
import { GetAsyncTaskPendingService } from './getAsyncTaskPending.service';
import { ManageMemberService } from './manageMember.service';
import { UpdateApplicationService } from './updateApplication.service';

describe('ApplicationController', () => {
    let controller: ApplicationController;
    let getApplicationService: jest.Mocked<GetApplicationService>;
    let getAsyncTaskPendingService: jest.Mocked<GetAsyncTaskPendingService>;

    const mockGetApplicationService = {
        applicationSummary: jest.fn(),
    };

    const mockCreateApplicationSrvc = {
        createApplicationSrvc: jest.fn(),
    };

    const mockManageMemberSrvc = {
        manageMemberSrvc: jest.fn(),
    };

    const mockUpdateApplicationSrvc = {
        updateApplicationSrvc: jest.fn(),
    };

    const mockDeleteApplicationSrvc = {
        deleteApplicationSrvc: jest.fn(),
    };
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationController],
            providers: [
                {
                    provide: GetApplicationService,
                    useValue: mockGetApplicationService,
                },
                {
                    provide: CreateApplicationService,
                    useValue: mockCreateApplicationSrvc,
                },
                {
                    provide: ManageMemberService,
                    useValue: mockManageMemberSrvc,
                },

                {
                    provide: UpdateApplicationService,
                    useValue: mockUpdateApplicationSrvc,
                },
                {
                    provide: DeleteApplicationService,
                    useValue: mockDeleteApplicationSrvc,
                },
                {
                    provide: GetAsyncTaskPendingService,
                    useValue: {
                        hasPendingTaskForApplication: jest.fn(),
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

        controller = module.get<ApplicationController>(ApplicationController);
        getApplicationService = module.get(GetApplicationService);
        getAsyncTaskPendingService = module.get(GetAsyncTaskPendingService);
    });

    describe('getApplicationSummaries', () => {
        it('should throw BadRequestException if user_data is missing', async () => {
            await expect(controller.getApplicationSummaries({})).rejects.toThrow(BadRequestException);
            await expect(controller.getApplicationSummaries({ user_data: null })).rejects.toThrow(BadRequestException);
        });

        it('should return application summaries', async () => {
            const mockApps = [
                {
                    id: 1,
                    name: 'My Application 4',
                    desc: 'This is my application',
                    url: 'https://myapplication.com',
                    tags: 'tag1',
                    created_at: '2024-10-07T10:57:16.977Z',
                    updated_at: null,
                    created_by: { id: '123', name: 'john doe' },
                    compliances: [],
                    assessment: null,
                    source: null,
                },
            ];

            mockGetApplicationService.applicationSummary.mockResolvedValue(mockApps);

            const result = await controller.getApplicationSummaries({ user_data: {} });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(new ApplicationSummaryResponse(mockApps[0]));
            expect(mockGetApplicationService.applicationSummary).toHaveBeenCalledWith({});
        });
    });

    describe('getAsyncTaskPending', () => {
        it('should return true if there is a pending task', async () => {
            getAsyncTaskPendingService.hasPendingTaskForApplication.mockResolvedValue(true);

            const result = await controller.getAsyncTaskPending({ user_data: { customerId: '123' } }, '1');

            expect(result).toEqual({ has_pending_task: true });
            expect(getAsyncTaskPendingService.hasPendingTaskForApplication).toHaveBeenCalledWith(
                { customerId: '123' },
                1,
            );
        });

        it('should return false if there is no pending task', async () => {
            getAsyncTaskPendingService.hasPendingTaskForApplication.mockResolvedValue(false);

            const result = await controller.getAsyncTaskPending({ user_data: { customerId: '123' } }, '1');

            expect(result).toEqual({ has_pending_task: false });
            expect(getAsyncTaskPendingService.hasPendingTaskForApplication).toHaveBeenCalledWith(
                { customerId: '123' },
                1,
            );
        });
    });
});
