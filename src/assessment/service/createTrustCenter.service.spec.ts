import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SqsService } from "@ssut/nestjs-sqs";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { DataSource, EntityManager, Repository } from "typeorm";
import { AssessmentPolicyService } from "./assessmentPolicy.service";
import { CreateTrusCenter } from "./createTrustCenter.service";

describe('CreateTrustCenterService', () => {
    let service: CreateTrusCenter;
    let assessmentDetailRepo: jest.Mocked<Repository<AssessmentDetail>>;
    let sqsProducerService: jest.Mocked<SqsService>;
    let dataSource: jest.Mocked<DataSource>;
    let assessmentPolicyService: jest.Mocked<AssessmentPolicyService>;

    const userInfo = { userId: 'user123', customerId: 'customer123' };
    const mockAssessment: AssessmentDetail =
        {
            id: 1,
            title: 'Assessment 1',
            app_id: 1,
            customer_id: userInfo.customerId,
            frameworks: [1],
            template_id: 1,
            is_locked: false,
            outline: {
                version: 1,
            } as AssessmentOutline
        } as AssessmentDetail;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTrusCenter,
                {
                    provide: getRepositoryToken(AssessmentDetail),
                    useValue: {
                        findOneOrFail: jest.fn(),
                    },
                },
                {
                    provide: SqsService,
                    useValue: {
                        send: jest.fn(),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn(),
                    },
                },
                {
                    provide: AssessmentPolicyService,
                    useValue: {
                        canExportAssessment: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CreateTrusCenter>(CreateTrusCenter);
        assessmentDetailRepo = module.get(getRepositoryToken(AssessmentDetail));
        sqsProducerService = module.get(SqsService);
        dataSource = module.get(DataSource);
        assessmentPolicyService = module.get<jest.Mocked<AssessmentPolicyService>>(AssessmentPolicyService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    describe('createTrustCenterPDF', () => {
        it('should throw an error if not found assessment', async () => {
            const assessmentId = 1;

            assessmentDetailRepo.findOneOrFail.mockRejectedValue(new Error());

            await expect(service.createTrustCenterPDF(userInfo, assessmentId)).rejects.toThrow();
        });

        it('should throw an error if assessment is locked', async () => {
            const assessmentId = 1;

            const mockAssessment: AssessmentDetail =
                {
                    id: 1,
                    title: 'Assessment 1',
                    app_id: 1,
                    customer_id: userInfo.customerId,
                    frameworks: [1],
                    template_id: 1,
                    is_locked: true,
                } as AssessmentDetail;

            assessmentDetailRepo.findOneOrFail.mockResolvedValue(mockAssessment);

            await expect(service.createTrustCenterPDF(userInfo, assessmentId)).rejects.toThrow(
                BadRequestException
            );
        });

        it('should create trust center and send message to queue', async () => {
            const assessmentId = 1;

            assessmentDetailRepo.findOneOrFail.mockResolvedValue(mockAssessment);

            const mockManager = {
                findOne: jest.fn().mockResolvedValue(null),
                save: jest.fn().mockImplementation(async (entity) => {
                    entity.id = 1;
                    return entity;
                }),
                create: jest.fn().mockImplementation((entity) => entity),
                getRepository: jest.fn().mockImplementation(() => {
                    return {
                        metadata: {
                            tableName: 'trust_centers',
                        },
                    };
                }),
            } as unknown as EntityManager;
            (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                await callback(mockManager);
            });

            await service.createTrustCenterPDF(userInfo, assessmentId);

            expect(assessmentDetailRepo.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    id: assessmentId,
                    customer_id: userInfo.customerId,
                    is_deleted: false,
                },
                relations: ['outline'],
            });

            expect(assessmentPolicyService.canExportAssessment).toHaveBeenCalled();
            expect(dataSource.transaction).toHaveBeenCalled();
            expect(sqsProducerService.send).toHaveBeenCalled();
        });

        it('should update trust center and send message to queue', async () => {
            const assessmentId = 1;

            assessmentDetailRepo.findOneOrFail.mockResolvedValue(mockAssessment);

            const trustCenter = {
                id: 123,
            } as TrustCenter

            const mockManager = {
                findOne: jest.fn().mockResolvedValue(trustCenter),
                save: jest.fn().mockImplementation(async (entity) => {
                    entity.id = 1;
                    return entity;
                }),
                create: jest.fn().mockImplementation((entity) => {
                    if (entity.name === 'AsyncTask') {
                        return entity;
                    }
                    throw new Error('Unsupported entity type');
                }),
                getRepository: jest.fn().mockImplementation(() => {
                    return {
                        metadata: {
                            tableName: 'trust_centers',
                        },
                    };
                }),
            } as unknown as EntityManager;
            (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                await callback(mockManager);
            });

            await service.createTrustCenterPDF(userInfo, assessmentId);

            expect(assessmentDetailRepo.findOneOrFail).toHaveBeenCalledWith({
                where: {
                    id: assessmentId,
                    customer_id: userInfo.customerId,
                    is_deleted: false,
                },
                relations: ['outline'],
            });

            expect(assessmentPolicyService.canExportAssessment).toHaveBeenCalled();
            expect(dataSource.transaction).toHaveBeenCalled();
            expect(sqsProducerService.send).toHaveBeenCalled();
        });
    });
});
