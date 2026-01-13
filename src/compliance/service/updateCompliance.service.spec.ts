import { Test, TestingModule } from '@nestjs/testing';
import { UpdateComplianceService, TaskStatus } from './updateCompliance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { LoggerService } from 'src/logger/logger.service';

describe('UpdateComplianceService', () => {
    let service: UpdateComplianceService;
    let logger: LoggerService;

    const mockAsyncTaskRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateComplianceService,
                { provide: getRepositoryToken(AsyncTask), useValue: mockAsyncTaskRepo },
                { provide: LoggerService, useValue: mockLogger },
            ],
        }).compile();

        service = module.get<UpdateComplianceService>(UpdateComplianceService);
        logger = module.get<LoggerService>(LoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should process compliance with success status', async () => {
        const message = JSON.stringify({ taskId: 1, status: 'success' });
        const asyncTask = { id: 1, status: TaskStatus.PENDING, updated_at: new Date() };

        mockAsyncTaskRepo.findOne.mockResolvedValue(asyncTask);
        mockAsyncTaskRepo.save.mockResolvedValue(asyncTask);

        await service.processComplianceV2(message);

        expect(mockAsyncTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(asyncTask.status).toBe(TaskStatus.PROCESSED);
        expect(mockAsyncTaskRepo.save).toHaveBeenCalledWith(asyncTask);
        expect(logger.info).toHaveBeenCalledWith(`AsyncTask 1 updated with status ${TaskStatus.PROCESSED}`);
    });

    it('should process compliance with in_progress status', async () => {
        const message = JSON.stringify({ taskId: 1, status: 'in_progress' });
        const asyncTask = { id: 1, status: TaskStatus.PENDING, updated_at: new Date() };

        mockAsyncTaskRepo.findOne.mockResolvedValue(asyncTask);
        mockAsyncTaskRepo.save.mockResolvedValue(asyncTask);

        await service.processComplianceV2(message);

        expect(mockAsyncTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(asyncTask.status).toBe(TaskStatus.IN_PROCESS);
        expect(mockAsyncTaskRepo.save).toHaveBeenCalledWith(asyncTask);
        expect(logger.info).toHaveBeenCalledWith(`AsyncTask 1 updated with status ${TaskStatus.IN_PROCESS}`);
    });

    it('should process compliance with failed status', async () => {
        const message = JSON.stringify({ taskId: 1, status: 'failed' });
        const asyncTask = { id: 1, status: TaskStatus.PENDING, updated_at: new Date() };

        mockAsyncTaskRepo.findOne.mockResolvedValue(asyncTask);
        mockAsyncTaskRepo.save.mockResolvedValue(asyncTask);

        await service.processComplianceV2(message);

        expect(mockAsyncTaskRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(asyncTask.status).toBe(TaskStatus.FAILED);
        expect(mockAsyncTaskRepo.save).toHaveBeenCalledWith(asyncTask);
        expect(logger.info).toHaveBeenCalledWith(`AsyncTask 1 updated with status ${TaskStatus.FAILED}`);
    });

    it('should log error if taskId is missing', async () => {
        const message = JSON.stringify({ status: 'success' });

        await service.processComplianceV2(message);

        expect(logger.error).toHaveBeenCalledWith('Task ID is missing');
    });

    it('should throw error if asyncTask is not found', async () => {
        const message = JSON.stringify({ taskId: 1, status: 'success' });

        mockAsyncTaskRepo.findOne.mockResolvedValue(null);

        await expect(service.processComplianceV2(message)).rejects.toThrow('AsyncTask with id 1 not found');
    });
});