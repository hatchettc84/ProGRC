import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UploadService } from "src/app/fileUpload.service";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { TrustCenter, TrustCenterStatus } from "src/entities/trustCenter.entity";
import { DataSource, Repository } from "typeorm";
import { AssessmentToPDF } from "./assessmentToPdf.service";
import { ExportTrustCenterService } from "./exportTrustCenter.service";

describe('exportTrustCenterPDF', () => {
    let service: ExportTrustCenterService;
    let trustCenterRepo: jest.Mocked<Repository<TrustCenter>>;
    let assessmentToPdfSrvc: jest.Mocked<AssessmentToPDF>;
    let uploadService: jest.Mocked<UploadService>;
    let dataSource: jest.Mocked<DataSource>;

    const userInfo = { userId: 'user123', customerId: 'customer123' };
    const message = {
        appId: 1,
        customerId: userInfo.customerId,
        assessmentId: 1,
        version: 1,
        trustCenterId: 1,
        asyncTaskId: 1,
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ExportTrustCenterService,
                {
                    provide: AssessmentToPDF,
                    useValue: {
                        generatePDF: jest.fn(),
                    },
                },
                {
                    provide: UploadService,
                    useValue: {
                        uploadUseBytes: jest.fn(),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(TrustCenter),
                    useValue: {
                        findOneOrFail: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ExportTrustCenterService>(ExportTrustCenterService);
        trustCenterRepo = module.get(getRepositoryToken(TrustCenter));
        assessmentToPdfSrvc = module.get(AssessmentToPDF);
        uploadService = module.get(UploadService);
        dataSource = module.get(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        it('should throw an error if trustCenter is not found', async () => {
            trustCenterRepo.findOneOrFail.mockRejectedValueOnce(new Error('Not found'));
            await expect(service.handle(message)).rejects.toThrow('Not found');
        });

        it('should update trustCenter status to FAILED if an error occurs', async () => {
            const mockTrustCenter = {
                id: 123,
                name: 'Trust Center 1',
                app_id: 1,
                customer_id: 'customer-123',
                assessment_id: 10,
            } as TrustCenter;

            trustCenterRepo.findOneOrFail.mockResolvedValue(mockTrustCenter);
            trustCenterRepo.update.mockResolvedValue(undefined);

            assessmentToPdfSrvc.generatePDF.mockRejectedValue(new Error('PDF generation failed'));

            const transactionSpy = jest.fn();
            (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                await callback({ update: transactionSpy });
            });

            await service.handle(message);

            expect(trustCenterRepo.update).toHaveBeenCalledWith(mockTrustCenter.id, { status: TrustCenterStatus.PROCESSING });
            expect(dataSource.transaction).toHaveBeenCalledTimes(1);

            expect(transactionSpy).toHaveBeenCalledWith(TrustCenter, mockTrustCenter.id, { status: TrustCenterStatus.FAILED });
            expect(transactionSpy).toHaveBeenCalledWith(
                AsyncTask,
                { id: message.asyncTaskId, ops: TaskOps.EXPORT_TRUST_CENTER },
                { status: TaskStatus.FAILED },
            );
        });

        it('should update trustCenter status to SUCCESS if PDF is generated successfully', async () => {
            const mockTrustCenter = {
                id: 123,
                name: 'Trust Center 1',
                app_id: 1,
                customer_id: 'customer-123',
                assessment_id: 10,
            } as TrustCenter;

            trustCenterRepo.findOneOrFail.mockResolvedValue(mockTrustCenter);
            trustCenterRepo.update.mockResolvedValue(undefined);

            const byteFile = new Uint8Array([1, 2, 3, 4]);
            assessmentToPdfSrvc.generatePDF.mockResolvedValue(byteFile);

            uploadService.uploadUseBytes.mockResolvedValue({ s3Response: null, fileName: 'trust-center-1.pdf' });

            const transactionSpy = jest.fn();
            (dataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
                await callback({
                    save: transactionSpy,
                    update: transactionSpy,
                });
            });

            await service.handle(message);

            expect(trustCenterRepo.update).toHaveBeenCalledWith(mockTrustCenter.id, { status: TrustCenterStatus.PROCESSING });
            expect(dataSource.transaction).toHaveBeenCalledTimes(1);

            expect(transactionSpy).toHaveBeenCalledWith(mockTrustCenter);
            expect(transactionSpy).toHaveBeenCalledWith(
                AsyncTask,
                { id: message.asyncTaskId, ops: TaskOps.EXPORT_TRUST_CENTER },
                { status: TaskStatus.PROCESSED },
            );
        });
    });
});
