import { Test, TestingModule } from '@nestjs/testing';
import { EnhancementEvidenceService } from './enhancementEvidence.service';
import { UploadService } from 'src/app/fileUpload.service';
import { CompliancePolicy } from './compliance.policy';
import { BadRequestException } from '@nestjs/common';

describe('EnhancementEvidenceService', () => {
    let service: EnhancementEvidenceService;
    let uploadService: UploadService;
    let compliancePolicy: CompliancePolicy;

    const mockRequest = {
        user_data: { userId: 'test-user', customerId: 'test-customer' }
    };

    const mockUploadService = {
        uploadFiles: jest.fn().mockResolvedValue({ message: 'Files uploaded successfully', data: [] })
    };

    const mockCompliancePolicy = {
        canSetEvidence: jest.fn().mockResolvedValue(true)
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnhancementEvidenceService,
                { provide: UploadService, useValue: mockUploadService },
                { provide: CompliancePolicy, useValue: mockCompliancePolicy },
                { provide: 'REQUEST', useValue: mockRequest }
            ],
        }).compile();

        service = await module.resolve<EnhancementEvidenceService>(EnhancementEvidenceService);
        uploadService = module.get<UploadService>(UploadService);
        compliancePolicy = module.get<CompliancePolicy>(CompliancePolicy);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should upload enhancement evidence documents', async () => {
        const appId = 1;
        const enhancementId = 'enhancement-123';
        const files = [{ originalname: 'file1.txt' }, { originalname: 'file2.txt' }] as Array<Express.Multer.File>;
        const request = {
            files_info: [
                { file_name: 'file1.txt', file_type: 'text/plain' },
                { file_name: 'file2.txt', file_type: 'text/plain' }
            ]
        };

        const result = await service.uploadEnhancementEvidenceDocument(appId, enhancementId, files, request);

        expect(compliancePolicy.canSetEvidence).toHaveBeenCalledWith(mockRequest.user_data, appId);
        expect(uploadService.uploadFiles).toHaveBeenCalledWith(files, request.files_info, mockRequest.user_data);
        expect(result).toEqual({ message: 'Files uploaded successfully', data: [] });
    });

    it('should throw BadRequestException if number of files and files_info items do not match', async () => {
        const appId = 1;
        const enhancementId = 'enhancement-123';
        const files = [{ originalname: 'file1.txt' }] as Array<Express.Multer.File>;
        const request = {
            files_info: [
                { file_name: 'file1.txt', file_type: 'text/plain' },
                { file_name: 'file2.txt', file_type: 'text/plain' }
            ]
        };

        await expect(service.uploadEnhancementEvidenceDocument(appId, enhancementId, files, request)).rejects.toThrow(BadRequestException);
    });
});