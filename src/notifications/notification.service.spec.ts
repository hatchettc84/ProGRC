import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsyncTasksService } from 'src/async_tasks/async_tasks.service';
import { NotificationsService } from './notifications.service';
import { InviteStatus, User } from 'src/entities/user.entity';
import { TaskOps, TaskStatus } from './notifications.service';
import { NotificationAction, NotificationStatus } from './notification.interface';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let asyncTaskService: jest.Mocked<AsyncTasksService>;
    let userRepository: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: AsyncTasksService,
                    useValue: {
                        getAsyncTask: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        asyncTaskService = module.get<AsyncTasksService>(AsyncTasksService) as jest.Mocked<AsyncTasksService>;
        userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    });

    describe('getAsyncTask', () => {
        it('should return notifications and count', async () => {
            const mockTasks = [
                {
                    id: 1,
                    created_by: 'user1',
                    status: TaskStatus.PENDING,
                    created_at: new Date(),
                    updated_at: new Date(),
                    customer_id: 'customer1',
                    app_id: 101,
                    request_payload: { Source: 'file1.csv' },
                    ops: TaskOps.CREATE_ASSETS,
                    entity_id: '1',
                    entity_type: 'Asset',
                },
            ];
            const mockCount = 1;

            asyncTaskService.getAsyncTask.mockResolvedValueOnce([mockTasks, mockCount]);
            jest.spyOn(service, 'getUserName').mockResolvedValueOnce({
                id: 'user1',
                name: 'John Doe',
                email: 'john@example.com',
                role_id: 1,
                mobile: '1234567890',
                profile_image_key: null,
            });

            const [notifications, count] = await service.getAsyncTask(
                {},
                { user_data: 'user1' },
                { limit: 5, offset: 0, limitedTime: true },
            );

            expect(asyncTaskService.getAsyncTask).toHaveBeenCalledWith({}, { user_data: 'user1' }, 5, 0, true);
            expect(notifications).toEqual([
                {
                    id: '1',
                    author: {
                        id: 'user1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        role_id: 1, // Adjusted to match test expectations
                        mobile: '1234567890',
                        profile_image_key: null,
                    },
                    action: TaskStatus.PENDING,
                    time: mockTasks[0].updated_at.toISOString(),
                    applicationId: 101,
                    sourceFileName: 'file1.csv',
                    operation: NotificationAction.CREATE_ASSETS,
                    status: NotificationStatus.PENDING,
                    entityId: '1', // Adjusted to match test expectations
                    entityType: 'Asset',
                },
            ]);
            expect(count).toBe(mockCount);
        });

    });

    describe('getUserName', () => {
        it('should return a user DTO when user is found', async () => {
            const mockUser = {
                id: 'user1-uuid', 
                name: 'John Doe',
                mobile: '1234567890',
                profile_image_key: 'some-image-key',
                email: 'john@example.com',
                customer_id: 'customer1', 
                invite_status: InviteStatus.NOT_SENT, 
                role_id: 1, 
                role: {

                    id: 1, 

                    name: 'Admin', 

                    role_name: 'Admin Role', 

                    is_org_role: true, 
                },
                appUsers: [], 
                created_at: new Date('2024-11-26T10:49:22.440Z'),
                updated_at: new Date('2024-11-26T10:49:22.440Z'),
                deleted: false, 
                csms: [], 
                customer: null
            };


            userRepository.findOne.mockResolvedValueOnce(mockUser);

            const result = await service.getUserName('user1');

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'user1' },
                relations: ['role'],
            });
            expect(result).toEqual({
                id: 'user1-uuid',
                name: 'John Doe',
                mobile: '1234567890',
                profile_image_key: 'some-image-key',
                email: 'john@example.com',
                role_id: 1,
            });
        });

        it('should throw NotFoundException when user is not found', async () => {
            userRepository.findOne.mockResolvedValueOnce(null);

            await expect(service.getUserName('user1')).rejects.toThrow(NotFoundException);
        });
    });
});
