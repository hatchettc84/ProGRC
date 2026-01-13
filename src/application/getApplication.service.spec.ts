import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetApplicationService } from './getApplication.service';
import { Repository } from 'typeorm';
import { App } from 'src/entities/app.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { Source } from 'src/entities/source/source.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('GetApplicationService', () => {
  let service: GetApplicationService;
  let appRepo: MockRepository<App>;
  let sourceRepo: MockRepository<Source>;
  let assessmentHistoryRepo: MockRepository<AssessmentHistory>;
  let assessmentRepo: MockRepository<AssessmentDetail>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetApplicationService,
        { provide: getRepositoryToken(App), useValue: createMockRepository() },
        { provide: getRepositoryToken(Source), useValue: createMockRepository() },
        { provide: getRepositoryToken(AssessmentHistory), useValue: createMockRepository() },
        { provide: getRepositoryToken(AssessmentDetail), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<GetApplicationService>(GetApplicationService);
    appRepo = module.get<MockRepository<App>>(getRepositoryToken(App));
    sourceRepo = module.get<MockRepository<Source>>(getRepositoryToken(Source));
    assessmentHistoryRepo = module.get<MockRepository<AssessmentHistory>>(getRepositoryToken(AssessmentHistory));
    assessmentRepo = module.get<MockRepository<AssessmentDetail>>(getRepositoryToken(AssessmentDetail));
    complianceRepo = module.get<MockRepository<Compliance>>(getRepositoryToken(Compliance));
  });

  describe('applications', () => {
    it('should return applications for an org admin', async () => {
      const mockApps = [
        { id: 1, name: 'App 1', desc: 'Description 1', url: 'url1', tags: 'tags1' },
      ];

      appRepo.createQueryBuilder.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndMapMany: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockApps),
      }));

      const result = await service.applications({ userId: 'user1', role_id: '1', customerId: '123' });

      expect(result).toEqual(mockApps);
      expect(appRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return applications for a non-org admin', async () => {
      const mockApps = [
        { id: 2, name: 'App 2', desc: 'Description 2', url: 'url2', tags: 'tags2' },
      ];

      appRepo.createQueryBuilder.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        innerJoinAndMapOne: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndMapMany: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockApps),
      }));

      const result = await service.applications({ userId: 'user2', role_id: '2', customerId: '123' });

      expect(result).toEqual(mockApps);
      expect(appRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('applicationSummary', () => {
    it('should return application summaries', async () => {
      const mockApps = [{ id: 1, name: 'App 1', desc: 'Description 1' }];
      const mockAssessmentChanges = {
        1: { updated_at: new Date(), updated_by: { id: 'user1', name: 'User 1' } },
      };
      const mockSourceChanges = {
        1: { updated_at: new Date(), source_total: 5, updated_by: { id: 'user2', name: 'User 2' } },
      };
      const mockComplianceData = { 1: [] };

      jest.spyOn(service as any, 'fetchApplications').mockResolvedValue(mockApps as any);
      jest.spyOn(service as any, 'fetchLastAssessmentChanges').mockResolvedValue(mockAssessmentChanges);
      jest.spyOn(service as any, 'fetchLastSourceChanges').mockResolvedValue(mockSourceChanges);
      jest.spyOn(service as any, 'fetchComplianceData').mockResolvedValue(mockComplianceData);

      const result = await service.applicationSummary({ userId: 'user1', role_id: '1', customerId: '123' });

      expect(result).toEqual([
        {
          ...mockApps[0],
          lastAssessmentChange: mockAssessmentChanges[1],
          lastSourceChange: mockSourceChanges[1],
          compliances: mockComplianceData[1],
        },
      ]);
    });
  });
});
