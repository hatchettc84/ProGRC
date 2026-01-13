// import { REQUEST } from '@nestjs/core';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { SqsService } from '@ssut/nestjs-sqs';
// import { AppStandard } from 'src/entities/appStandard.entity';
// import { AsyncTask } from 'src/entities/asyncTasks.entity';
// import { Source } from 'src/entities/source/source.entity';
// import { SourceVersion } from "src/entities/source/sourceVersion.entity";
// import { DataSource, EntityManager, Repository } from 'typeorm';
// import { CompliancePolicy } from './compliance.policy';
// import { GenerateDummyComplianceService } from './generateDummyCompliance';
// import { SyncComplianceService } from './syncCompliance.service';

// jest.mock('@ssut/nestjs-sqs');
// jest.mock('./compliance.policy');
// jest.mock('./generateDummyCompliance');

// type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// const createMockRepository = <T = any>(): MockRepository<T> => ({
//     createQueryBuilder: jest.fn(),
// });

// describe('SyncComplianceService', () => {
//     let service: SyncComplianceService;
//     let asyncTaskRepo: jest.Mocked<Repository<AsyncTask>>;
//     let sourceRepo: jest.Mocked<Repository<Source>>;
//     let sourceVersionRepo: MockRepository<SourceVersion>;
//     let dataSource: jest.Mocked<DataSource>;
//     let sqsProducerService: jest.Mocked<SqsService>;
//     let compliancePolicyService: jest.Mocked<CompliancePolicy>;
//     let generateDummyService: jest.Mocked<GenerateDummyComplianceService>;

//     beforeEach(async () => {
//         const mockRequest = { user_data: { tenant_id: 'tenant123', userId: 'user123' } };

//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 SyncComplianceService,
//                 {
//                     provide: DataSource,
//                     useValue: {
//                         transaction: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: REQUEST,
//                     useValue: mockRequest,
//                 },
//                 {
//                     provide: SqsService,
//                     useValue: {
//                         send: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: CompliancePolicy,
//                     useValue: {
//                         canSyncCompliance: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: GenerateDummyComplianceService,
//                     useValue: {
//                         generateForApplication: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: getRepositoryToken(AsyncTask),
//                     useValue: {
//                         create: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: getRepositoryToken(Source),
//                     useValue: {
//                         create: jest.fn(),
//                         findOneOrFail: jest.fn(),
//                     },
//                 },
//                 {
//                     provide: getRepositoryToken(SourceVersion),
//                     useValue: createMockRepository(),
//                 },
//             ],
//         }).compile();

//         service = await module.resolve<SyncComplianceService>(SyncComplianceService);
//         asyncTaskRepo = await module.resolve(getRepositoryToken(AsyncTask));
//         sourceRepo = await module.resolve(getRepositoryToken(Source));
//         sourceVersionRepo = await module.resolve<MockRepository<SourceVersion>>(getRepositoryToken(SourceVersion));
//         dataSource = await module.resolve(DataSource);
//         sqsProducerService = await module.resolve(SqsService);
//         compliancePolicyService = await module.resolve(CompliancePolicy);
//         generateDummyService = await module.resolve(GenerateDummyComplianceService);
//     });

//     it('should call canSyncCompliance and perform transaction', async () => {
//         process.env.POPULATE_COMPLIANCE_DUMMY_DATA = 'false';
//         const applicationId = 1;

//         compliancePolicyService.canSyncCompliance.mockResolvedValueOnce(undefined);
//         asyncTaskRepo.create.mockImplementation((entity) => entity as unknown as AsyncTask);
//         sourceRepo.findOneOrFail.mockResolvedValueOnce({ id: 1 } as Source);
//         sourceVersionRepo.createQueryBuilder.mockImplementation(() => ({
//             select: jest.fn().mockReturnThis(),
//             where: jest.fn().mockReturnThis(),
//             orderBy: jest.fn().mockReturnThis(),
//             take: jest.fn().mockReturnThis(),
//             getRawMany: jest.fn().mockResolvedValue([{
//                 sourceVersion_id: 1,
//                 sourceVersion_source_id: 1,
//                 sourceVersion_created_at: new Date(),
//                 sourceVersion_file_bucket_key: 'key',
//             }]),
//         }));
//         (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
//             const mockManager = {
//                 save: jest.fn().mockImplementation(async (entity) => {
//                     entity.id = 1;
//                     return entity;
//                 }),
//                 find: jest.fn().mockImplementation(async (entity, options) => {
//                     if (entity === AppStandard && options.where.app_id === applicationId) {
//                         return [{ standard_id: 101 }, { standard_id: 102 }];
//                     }
//                     return [];
//                 }),
//                 update: jest.fn(),
//                 getRepository: jest.fn().mockImplementation(() => {
//                     return {
//                         metadata: {
//                             tableName: 'compliances',
//                         },
//                     };
//                 }),
//                 create: jest.fn().mockImplementation((entity) => entity),
//             } as unknown as EntityManager;
//             await callback(mockManager);
//         });
//         sqsProducerService.send.mockResolvedValueOnce(undefined);
//         generateDummyService.generateForApplication.mockResolvedValueOnce(undefined);

//         await service.syncApplication(applicationId);

//         expect(compliancePolicyService.canSyncCompliance).toHaveBeenCalledWith(
//             { tenant_id: 'tenant123', userId: 'user123' },
//             applicationId
//         );
//         expect(dataSource.transaction).toHaveBeenCalledTimes(2);
//         expect(sqsProducerService.send).toHaveBeenCalled();
//     });
// });
