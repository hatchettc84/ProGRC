import { BadRequestException, Injectable } from "@nestjs/common";
import { CloudFrontService } from "src/app/cloudfront.service";
import { UploadService } from "src/app/fileUpload.service";

@Injectable()
export class UploadThumbnailService {
    constructor(
        private readonly uploadService: UploadService,
        private readonly cloudFrontService: CloudFrontService,
    ) { }

    async uploadThumbnail(
        file: Express.Multer.File,
    ): Promise<{ fileName: string; url: string }> {
        this.validateImageFile(file);

        const uniqueFileName = this.generateUniqueFileName(file.originalname);

        const { fileName } = await this.uploadService.uploadFile(uniqueFileName, file);
        return {
            fileName,
            url: this.cloudFrontService.generateSignedUrl(fileName),
        };
    }

    private validateImageFile(file: Express.Multer.File): void {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only image files with extension jpeg, jpg and png are allowed');
        }
    }

    private generateUniqueFileName(originalName: string): string {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-:.]/g, '');
        const fileExtension = originalName.split('.').pop();
        return `thumbnail_${timestamp}.${fileExtension}`;
    }
}
