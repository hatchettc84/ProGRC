import { BadRequestException, Injectable } from "@nestjs/common";
import { UploadService } from "src/app/fileUpload.service";

@Injectable()
export class UploadCustomerTemplateLogoService {
    constructor(
        private readonly uploadFileService: UploadService
    ) { }

    async uploadLogoCustomer(userInfo: { customerId: string }, file: Express.Multer.File): Promise<string> {
        this.validateImageFile(file)

        const { fileName } = await this.uploadFileService.uploadFile(
            this.generateFileName(userInfo.customerId, file.originalname),
            file,
        );

        return fileName;
    }

    private validateImageFile(file: Express.Multer.File): void {
        if (!file || !file.buffer) {
            throw new BadRequestException('Invalid file');
        }

        const magicBytes = file.buffer.slice(0, 4).toString('hex').toUpperCase();

        const allowedMagicBytes = {
            'FFD8FF': 'JPEG',
            '89504E47': 'PNG',
        };

        // Check if the magic bytes match any allowed file type
        const isValidImage = Object.keys(allowedMagicBytes).some(signature =>
            magicBytes.startsWith(signature)
        );

        if (!isValidImage) {
            throw new BadRequestException('Only image files with extension jpeg, jpg, and png are allowed');
        }
    }

    private generateFileName(customerId: string, originalName: string): string {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-:.]/g, '');
        const fileExtension = originalName.split('.').pop();
        return `customer_logo_${customerId}_${timestamp}.${fileExtension}`;
    }
}
