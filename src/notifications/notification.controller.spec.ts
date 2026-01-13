import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { AuthGuard } from 'src/guards/authGuard';

describe('NotificationsController', () => {
    let controller: NotificationsController;
    let notificationsService: jest.Mocked<NotificationsService>;

    const mockNotificationsService = {
        getAsyncTask: jest.fn(),
    };

    const mockAsyncTasksService = {};

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationsController],
            providers: [
                { provide: NotificationsService, useValue: mockNotificationsService },
                { provide: AsyncTasksService, useValue: mockAsyncTasksService },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<NotificationsController>(NotificationsController);
        notificationsService = module.get(NotificationsService);
    });

    describe('taskDetails', () => {
        it('should return a paginated list of notifications with default query params', async () => {
            const mockUserData = { userId: '123', role: 'org_admin' };
            const mockRequest = {
                query: {},
                body: {},
                user_data: mockUserData,
            };
            const mockNotifications = [
                { id: 1, message: 'Task 1' },
                { id: 2, message: 'Task 2' },
            ];
            const mockTotal = 2;

            mockNotificationsService.getAsyncTask.mockResolvedValue([mockNotifications, mockTotal]);

            const result = await controller.taskDetails(mockRequest);

            expect(notificationsService.getAsyncTask).toHaveBeenCalledWith(
                mockRequest.body,
                mockRequest.user_data,
                { limit: 5, offset: 0, limitedTime: true },
            );

            expect(result).toEqual(
                StandardResponse.successWithTotal("Success", mockNotifications, {
                    total: mockTotal,
                    limit: 5,
                    offset: 0,
                }),
            );
        });

        it('should handle custom query params', async () => {
            const mockUserData = { userId: '123', role: 'org_member' };
            const mockRequest = {
                query: { limit: '10', offset: '5', limitedTime: 'false' },
                body: {},
                user_data: mockUserData,
            };
            const mockNotifications = [
                { id: 1, message: 'Custom Task 1' },
                { id: 2, message: 'Custom Task 2' },
            ];
            const mockTotal = 10;

            mockNotificationsService.getAsyncTask.mockResolvedValue([mockNotifications, mockTotal]);

            const result = await controller.taskDetails(mockRequest);

            expect(notificationsService.getAsyncTask).toHaveBeenCalledWith(
                mockRequest.body,
                mockRequest.user_data,
                { limit: 10, offset: 5, limitedTime: false },
            );

            expect(result).toEqual(
                StandardResponse.successWithTotal("Success", mockNotifications, {
                    total: mockTotal,
                    limit: 10,
                    offset: 5,
                }),
            );
        });

        it('should throw an error if the service fails', async () => {
            const mockRequest = {
                query: {},
                body: {},
                user_data: { userId: '123', role: 'org_admin' },
            };

            mockNotificationsService.getAsyncTask.mockRejectedValue(new Error('Service error'));

            await expect(controller.taskDetails(mockRequest)).rejects.toThrow('Service error');

            expect(notificationsService.getAsyncTask).toHaveBeenCalledWith(
                mockRequest.body,
                mockRequest.user_data,
                { limit: 5, offset: 0, limitedTime: true },
            );
        });
    });
});
