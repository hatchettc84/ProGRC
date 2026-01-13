import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UploadService } from "src/app/fileUpload.service";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { TrustCenter, TrustCenterStatus } from "src/entities/trustCenter.entity";
import { DataSource, Repository } from "typeorm";
import { AssessmentToPDF } from "./assessmentToPdf.service";
import { LoggerService } from "src/logger/logger.service";

interface exportTrustCenterParams {
    appId: number;
    customerId: string;
    assessmentId: number;
    version: number;
    trustCenterId: number;
    asyncTaskId: number;
}
@Injectable()
export class ExportTrustCenterService {
    constructor(
        private readonly assessmentToPdfSrvc: AssessmentToPDF,
        private readonly uploadService: UploadService,
        private readonly dataSource: DataSource,
        @InjectRepository(TrustCenter) private readonly trustCenterRepo: Repository<TrustCenter>,
        private readonly logger: LoggerService,
    ) { }

    async handle(message: exportTrustCenterParams): Promise<void> {
        const trustCenter: TrustCenter = await this.trustCenterRepo.findOneOrFail({
            where: { id: message.trustCenterId, app_id: message.appId, customer_id: message.customerId, assessment_id: message.assessmentId },
        });

        await this.trustCenterRepo.update(trustCenter.id, { status: TrustCenterStatus.PROCESSING });

        try {
            const byteFile: Uint8Array = await this.assessmentToPdfSrvc.generatePDF(message.assessmentId, message.appId, message.version);
            this.logger.info(`trust center export - PDF generated file size: ${byteFile.byteLength} bytes for trust_center_id: ${message.trustCenterId}, app_id: ${message.appId}, assessment_id: ${message.assessmentId}`);
            const result = await this.uploadPDF(trustCenter.name, byteFile);
            this.logger.info(`trust center export - PDF uploaded for trust_center_id: ${message.trustCenterId}, app_id: ${message.appId}, assessment_id: ${message.assessmentId}`);

            await this.dataSource.transaction(async (manager) => {
                trustCenter.file_path = result.fileName;
                trustCenter.status = TrustCenterStatus.SUCCESS;
                trustCenter.updated_at = new Date();

                await manager.save(trustCenter);

                await manager.update(AsyncTask, { id: message.asyncTaskId, ops: TaskOps.EXPORT_TRUST_CENTER }, { status: TaskStatus.PROCESSED, updated_at: new Date() });
            });
        } catch (error) {
            this.logger.error(`Error in exporting to trust center, trust_center_id: ${message.trustCenterId}, app_id: ${message.appId}, assessment_id: ${message.assessmentId}, Reason - ${error.message}`);
            this.dataSource.transaction(async (manager) => {
                manager.update(TrustCenter, trustCenter.id, { status: TrustCenterStatus.FAILED });
                manager.update(AsyncTask, { id: message.asyncTaskId, ops: TaskOps.EXPORT_TRUST_CENTER }, { status: TaskStatus.FAILED, updated_at: new Date() });
            });

        }

    }

    private async uploadPDF(prefixName: string, byteFile: Uint8Array): Promise<{ fileName: string }> {
        const formattedDate = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
        const fileName = `${prefixName}-${formattedDate}.pdf`;
        return this.uploadService.uploadUseBytes(fileName, 'application/pdf', byteFile);
    }
}
