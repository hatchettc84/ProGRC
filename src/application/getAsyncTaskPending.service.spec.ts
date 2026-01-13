import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { In, Repository } from 'typeorm';
import { GetAsyncTaskPendingService } from './getAsyncTaskPending.service';

describe('GetAsyncTaskPendingService', () => {
    let service: GetAsyncTaskPendingService;
    let asyncTaskRepository: Repository<AsyncTask>;

    const mockAsyncTaskRepository = {
        findOne: jest.fn(),
    };

    const mockUserInfo = { customerId: 'test-customer' };
    const mockAppId = 1;
    const mockPendingTask = { id: 1 } as AsyncTask;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAsyncTaskPendingService,
                {
                    provide: getRepositoryToken(AsyncTask),
                    useValue: mockAsyncTaskRepository,
                },
            ],
        }).compile();

        service = module.get<GetAsyncTaskPendingService>(GetAsyncTaskPendingService);
        asyncTaskRepository = module.get<Repository<AsyncTask>>(getRepositoryToken(AsyncTask));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hasPendingTaskForApplication', () => {
        it('should return true when there are pending tasks', async () => {
            jest.spyOn(asyncTaskRepository, 'findOne').mockResolvedValueOnce(mockPendingTask);

            const result = await service.hasPendingTaskForApplication(mockUserInfo, mockAppId);

            expect(result).toBe(true);
            expect(asyncTaskRepository.findOne).toHaveBeenCalledWith({
                select: ['id'],
                where: {
                    app_id: mockAppId,
                    customer_id: mockUserInfo.customerId,
                    status: In(AsyncTask.pendingTaskStatus()),
                },
                order: {
                    created_at: 'DESC',
                },
            });
        });

        it('should return false when there are no pending tasks', async () => {
            jest.spyOn(asyncTaskRepository, 'findOne').mockResolvedValueOnce(null);

            const result = await service.hasPendingTaskForApplication(mockUserInfo, mockAppId);

            expect(result).toBe(false);
            expect(asyncTaskRepository.findOne).toHaveBeenCalledWith({
                select: ['id'],
                where: {
                    app_id: mockAppId,
                    customer_id: mockUserInfo.customerId,
                    status: In(AsyncTask.pendingTaskStatus()),
                },
                order: {
                    created_at: 'DESC',
                },
            });
        });

        it('should handle repository errors', async () => {
            jest.spyOn(asyncTaskRepository, 'findOne').mockRejectedValueOnce(new Error('Repository error'));

            await expect(service.hasPendingTaskForApplication(mockUserInfo, mockAppId)).rejects.toThrow('Repository error');
            expect(asyncTaskRepository.findOne).toHaveBeenCalledWith({
                select: ['id'],
                where: {
                    app_id: mockAppId,
                    customer_id: mockUserInfo.customerId,
                    status: In(AsyncTask.pendingTaskStatus()),
                },
                order: {
                    created_at: 'DESC',
                },
            });
        });
    });
});
