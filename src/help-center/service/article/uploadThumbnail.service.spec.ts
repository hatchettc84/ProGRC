import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudFrontService } from 'src/app/cloudfront.service';
import { UploadService } from 'src/app/fileUpload.service';
import { UploadThumbnailService } from './uploadThumbnail.service';

describe('UploadThumbnailService', () => {
    let service: UploadThumbnailService;
    let uploadService: UploadService;
    let cloudFrontService: CloudFrontService;

    const mockUploadService = {
        uploadFile: jest.fn(),
    };

    const mockCloudFrontService = {
        generateSignedUrl: jest.fn(),
    };

    const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadThumbnailService,
                {
                    provide: UploadService,
                    useValue: mockUploadService,
                },
                {
                    provide: CloudFrontService,
                    useValue: mockCloudFrontService,
                },
            ],
        }).compile();

        service = module.get<UploadThumbnailService>(UploadThumbnailService);
        uploadService = module.get<UploadService>(UploadService);
        cloudFrontService = module.get<CloudFrontService>(CloudFrontService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadThumbnail', () => {
        it('should upload thumbnail successfully', async () => {
            const expectedFileName = 'thumbnail_20210901120000Z.jpg';
            jest.spyOn(uploadService, 'uploadFile').mockResolvedValueOnce({ fileName: expectedFileName } as any);
            jest.spyOn(cloudFrontService, 'generateSignedUrl').mockReturnValueOnce(`https://cdn.example.com/${expectedFileName}`);

            const result = await service.uploadThumbnail(mockFile);

            expect(result).toEqual({ fileName: expectedFileName, url: `https://cdn.example.com/${expectedFileName}` });
            expect(uploadService.uploadFile).toHaveBeenCalledWith(expect.any(String), mockFile);
        });

        it('should throw BadRequestException for invalid file type', async () => {
            const invalidFile: Express.Multer.File = { ...mockFile, mimetype: 'application/pdf' };

            await expect(service.uploadThumbnail(invalidFile)).rejects.toThrow(BadRequestException);
        });

        it('should handle upload service errors', async () => {
            jest.spyOn(uploadService, 'uploadFile').mockRejectedValueOnce(new Error('Upload error'));

            await expect(service.uploadThumbnail(mockFile)).rejects.toThrow('Upload error');
        });
    });

    describe('validateImageFile', () => {
        it('should throw BadRequestException for invalid file type', () => {
            const invalidFile: Express.Multer.File = { ...mockFile, mimetype: 'application/pdf' };

            expect(() => service['validateImageFile'](invalidFile)).toThrow(BadRequestException);
        });

        it('should not throw for valid file type', () => {
            expect(() => service['validateImageFile'](mockFile)).not.toThrow();
        });
    });

    describe('generateUniqueFileName', () => {
        it('should generate a unique file name', () => {
            const uniqueFileName = service['generateUniqueFileName'](mockFile.originalname);

            expect(uniqueFileName).toMatch(/^thumbnail_\d{8}T\d{6}\d{3}Z\.jpg$/);
        });
    });
});
