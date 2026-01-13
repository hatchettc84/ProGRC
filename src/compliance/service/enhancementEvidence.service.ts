import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { UploadService } from "src/app/fileUpload.service";
import { EvidenceFileUpdateRequest, EvidenceFileUpdateResponse, UploadEnhancementEvidenceRequest } from "../controlDetails.dto";
import { CompliancePolicy } from "./compliance.policy";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";
import { AppStandard } from "src/entities/appStandard.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { v4 as uuidv4 } from "uuid";
import { FileDownloadService } from "src/app/fileDownload.service";


@Injectable({ scope: Scope.REQUEST })
export class EnhancementEvidenceService {
    constructor(
        private readonly uploadService: UploadService,
        private readonly compliancePolicy: CompliancePolicy,
        private readonly logger: LoggerService,
        private readonly fileDownloadService: FileDownloadService,
        @Inject(REQUEST) private request: Request,
        @InjectRepository(ApplicationControlEvidence) private readonly evidenceRepo: Repository<ApplicationControlEvidence>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        @InjectRepository(ApplicationControlMapping) private readonly appControlMappingRepo: Repository<ApplicationControlMapping>
    ) {
    }
    async uploadEnhancementEvidenceDocument(
        appId: number,
        enchancementId: string,
        files: Array<Express.Multer.File>,
        request: UploadEnhancementEvidenceRequest
    ): Promise<{ message: string, data: any[] }> {
        await this.compliancePolicy.canSetEvidence(this.request['user_data'], appId);
        try {
            if (files.length !== request.files_info.length) {
                throw new Error("Number of files and files_info items must match.");
            }

            request.files_info.forEach((fileInfo, index) => {
                fileInfo.file_name = enchancementId + '_' + fileInfo.file_name;
                fileInfo.file_type = 'enhancement_evidence';
            });

            return await this.uploadService.uploadFiles(files, request.files_info, this.request['user_data']);
        } catch (error) {
            throw new BadRequestException({
                message: "File upload validation failed",
                error: error.message,
            });
        }
    }

    async updateEvidenceFiles(userInfo: any, appId: number, data: EvidenceFileUpdateRequest[]): Promise<EvidenceFileUpdateResponse[]> {
        await this.compliancePolicy.canSetEvidence(userInfo, appId);
        if (data.length === 0 || Object.keys(data[0]).length === 0) {
            throw new BadRequestException({
                error: `No files to update`,
                message: `No files to update`,
            });
        }
        let response: EvidenceFileUpdateResponse[] = [];
        for (const file of data) {
            const evidence = await this.evidenceRepo.findOneBy({ uuid: file.uuid });
            if (!evidence) {
                this.logger.error(`Evidence with uuid ${file.uuid} not found`);
                continue;
            }
            if(file.control_ids && file.control_ids.length === 0) {
                this.logger.error(`Control ids are required to update evidence`);
                continue;
            }
            let standardIds = [];
            const appStandards = await this.appStandardRepo.find({ where: { app_id: appId } });
            if(file.standard_ids && file.standard_ids.length === 0) {
                standardIds = appStandards.map(standard => standard.standard_id);
            } else {
                standardIds = file.standard_ids;
                standardIds = standardIds.filter(standardId => appStandards.some(appStandard => appStandard.standard_id === standardId));
                let invalidStandardIds = file.standard_ids.filter(standardId => !standardIds.includes(standardId));
                if(invalidStandardIds.length > 0) {
                    this.logger.error(`Invalid standard ids: ${invalidStandardIds.join(',')}, for app_id: ${appId}`);
                }
            }

            if(standardIds.length === 0) {
                this.logger.error(`No standard ids attached to app_id: ${appId}`);
                continue;
            }

            let appControlMappingIds = []

            for(const standard of standardIds) {
                for(const control of file.control_ids) {
                    const appControlMapping = await this.appControlMappingRepo.findOne({ where: { app_id: appId, standard_id: standard, control_id: control } });
                    if(!appControlMapping) {
                        this.logger.error(`ApplicationControlMapping not found for control_id ${control} for standard id ${standard} and app_id ${appId}`);
                        // continue;
                    }
                    appControlMappingIds.push(appControlMapping.id);
                }
            }

            if(appControlMappingIds.length === 0) {
                this.logger.error(`No applicationControlMapping found for app_id: ${appId}, control_ids: ${file.control_ids.join(',')}, standard_ids: ${standardIds.join(',')}`);
                continue;
            }

            // attach first to evidence, and create more evidence record with same document, created_at for each appControlMappingIds excluding first one.
            let first = true;
            for(const appControlMappingId of appControlMappingIds) {
                if(first) {
                    first = false;
                    evidence.application_control_mapping_id = appControlMappingId;
                    evidence.description = file.description;
                    evidence.updated_at = new Date();
                    evidence.is_available = true;
                    await this.evidenceRepo.save(evidence);
                } else {
                    const newEvidence = new ApplicationControlEvidence();
                    newEvidence.application_control_mapping_id = appControlMappingId;
                    newEvidence.description = file.description;
                    newEvidence.document = evidence.document;
                    newEvidence.created_at = evidence.created_at;
                    newEvidence.updated_at = new Date();
                    newEvidence.is_available = true;
                    newEvidence.uuid = uuidv4();
                    await this.evidenceRepo.save(newEvidence);
                }
            }
            response.push({ update: true, uuid: file.uuid });
        }

        return response;
    }

    async downloadEvidenceById(userInfo: any, appId: number, evidenceId: number): Promise<{ downloadUrl: string, evidence_name: string, evidence_id: number }> {
        await this.compliancePolicy.canDownloadEvidence(userInfo, appId);
        const evidence = await this.evidenceRepo.findOneBy({ id: evidenceId });
        if (!evidence) {
            throw new BadRequestException({
                message: `Evidence with id ${evidenceId} not found`,
                error: `Evidence with id ${evidenceId} not found`,
            });
        }
        const evidenceNameArray = evidence.document.split("/");
        const evidenceName = this.substringAfterFirstOccurrence(evidenceNameArray[evidenceNameArray.length - 1], '_');
        const downloadUrl = await this.fileDownloadService.generateSignedUrl(evidence.document);
        return { downloadUrl, evidence_name: evidenceName, evidence_id: evidenceId };
    }

    private substringAfterFirstOccurrence(input, char) {
        // Find the first occurrence of the character
        const splits = input.split(char);
        if (splits.length < 2) {
            return input;
        }
        return splits.slice(1).join(char);
    }

}
