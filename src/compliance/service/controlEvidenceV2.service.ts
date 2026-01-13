import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { DataSource, In, Not, Repository } from "typeorm";
import { SetEvidenceEnhancementRequestV2, SetEvidenceRequestV2 } from "../controlDetails.dto";
import { cp } from "fs";
import { AppStandard } from "src/entities/appStandard.entity";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class ControlEvidenceV2Service {
    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(ApplicationControlEvidence) private readonly appControlEvidenceRepo: Repository<ApplicationControlEvidence>,
        private readonly s3Service: AwsS3ConfigService,
        private readonly dataSource: DataSource
    ) { }

    async getControlEvidence(userInfo: { userId: string, customerId: string }, appId: number, controlId?: number) {
        const whereCondition = controlId ? { app_id: appId, control_id: controlId } : { app_id: appId };

        const appControls = await this.appControlRepo.find({
            where: whereCondition,
            relations: ['control', 'evidences']
        });


        const evidenceDataJson = JSON.parse(JSON.stringify(appControls));

        const evidenceData = evidenceDataJson.reduce((acc, appControl) => {
            const controlName = appControl.control.control_name;
            const controlId = appControl.control.id;
            if (!acc[controlName]) {
                acc[controlName] = {
                    control_name: controlName,
                    evidences: [],
                    control_id: controlId,
                    uniqueDocuments: new Set()

                };
            }
            const uniqueDocuments = acc[controlName].uniqueDocuments;
            appControl.evidences.forEach(evidence => {
                const fileName = evidence.document.split('/').pop();
                if (evidence.document && !uniqueDocuments.has(evidence.document)) {
                    uniqueDocuments.add(evidence.document);
                    acc[controlName].evidences.push({
                        id: evidence.id,
                        description: evidence.description,
                        document: evidence.document,
                        last_updated: evidence.updated_at,
                        fileName: this.substringAfterFirstOccurrence(fileName, '_'),
                    });
                }
            });
            return acc;
        }, {});
        return Object.values(evidenceData).map(control => ({
            control_name: control["control_name"],
            control_id: control["control_id"],
            evidences: control["evidences"]
        }));
    }


    extractFilePath(url): string | null {
        // Regular expression to extract the string between "cloudfront.net/" and "?Expires"
        const regex = /cloudfront\.net\/(.*?)\?Expires/;
        const match = url.match(regex);
        return match ? decodeURIComponent(match[1]) : null;
    }


    async setEvidenceForControl(userInfo: { userId: string; customerId: string; }, appId: number, params: SetEvidenceRequestV2) {
        await this.dataSource.transaction(async (manager) => {
            const appControls = await manager.find(ApplicationControlMapping, {
                select: ['id'],
                where: {
                    app_id: appId,
                    control_id: In(params.ids),
                },
            });

            for (const appControl of appControls) {
                for (const filePath of params.filePath) {
                    await manager.insert(ApplicationControlEvidence, {
                        application_control_mapping_id: appControl.id,
                        document: filePath,
                        description: params.description || '',
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
                await manager.update(ApplicationControlMapping, { id: appControl.id }, { updated_at: new Date() });
            }
        });
    }

    async updateEvidenceForControl(userInfo: { userId: string, customerId: string }, appId: number, controlId: number, params: SetEvidenceRequestV2, evidenceId: number) {
        await this.dataSource.transaction(async (manager) => {
            const appControlEvidence: ApplicationControlEvidence = await manager.findOneOrFail(ApplicationControlEvidence, {
                select: ['id', 'application_control_mapping_id', 'description', 'document'],
                relations: ['application_control_mapping'],
                where: {
                    id: evidenceId,
                },
            })

            if (appControlEvidence && appControlEvidence.application_control_mapping) {
                for (const filePath of params.filePath) {
                    appControlEvidence.document = filePath;
                    appControlEvidence.description = params.description || '',
                        appControlEvidence.updated_at = new Date();
                    await manager.save(appControlEvidence);

                    appControlEvidence.application_control_mapping.updated_at = new Date();
                    await manager.save(appControlEvidence.application_control_mapping);
                }

            } else {
                throw new NotFoundException('Evidence not found');
            }
        });
    }

    async removeControlEvidence(userInfo: { userId: string, customerId: string }, appId: number, controlId: number) {
        await this.dataSource.transaction(async (manager) => {

            const appControls: ApplicationControlMapping[] = await manager.find(ApplicationControlMapping, {
                select: ['id', 'evidences'],
                where: {
                    control_id: controlId,
                    app_id: appId,
                },
                relations: ['evidences']
            });

            const appControlMappingIds = appControls.map(appControl => appControl.id);

            const appControlEvidences = await this.appControlEvidenceRepo.find({
                where: {
                    application_control_mapping_id: In(appControlMappingIds),
                }
            });

            const evidenceS3Keys = new Set(appControlEvidences.map(evidence => evidence.document));

            const usedKeys = await this.appControlEvidenceRepo.find({
                where: {
                    document: In([...evidenceS3Keys]),
                    application_control_mapping_id: Not(In(appControlMappingIds)),
                }
            });

            const usedKeysSet = new Set(usedKeys.map((item) => item.document));

            const finalKeysToDelete = Array.from(evidenceS3Keys.values()).filter((key) => !usedKeysSet.has(key));

            await manager.delete(ApplicationControlEvidence, {
                application_control_mapping_id: In(appControlMappingIds),
            });

            if (finalKeysToDelete.length > 0) {
                const s3Client: S3Client = this.s3Service.getS3();
                const deleteS3FilesCommand = this.s3Service.deleteMultipleObjectsCommand(finalKeysToDelete);
                await s3Client.send(deleteS3FilesCommand);
            }

            await manager.update(ApplicationControlMapping, { id: In(appControlMappingIds) }, { updated_at: new Date() });
        });
    }

    async deleteControlEvidence(userInfo: { userId: string, customerId: string }, appId: number, evidenceId: number) {

        await this.dataSource.transaction(async (manager) => {

            const appControlEvidence = await manager.findOneOrFail(ApplicationControlEvidence, {
                where: {
                    id: evidenceId,
                }
            });

            if (!appControlEvidence) {
                throw new NotFoundException('Evidence not found');
            }

            const evidenceS3Key = appControlEvidence.document;

            const usedKeys = await manager.find(ApplicationControlEvidence, {
                where: {
                    document: evidenceS3Key,
                    application_control_mapping_id: Not(appControlEvidence.application_control_mapping_id),
                }
            });

            if (usedKeys.length === 0 && evidenceS3Key) {
                const s3Client: S3Client = this.s3Service.getS3();
                const deleteS3FilesCommand = this.s3Service.deleteObjectCommand(evidenceS3Key);
                await s3Client.send(deleteS3FilesCommand);
            }

            await manager.delete(ApplicationControlEvidence, {
                id: evidenceId,
            });
        });
    }

    async removeEvidenceForControl(userInfo: { userId: string, customerId: string }, appId: number, controlId: number, evidenceId: number) {
        await this.dataSource.transaction(async (manager) => {
            const appControl: ApplicationControlMapping = await manager.findOneOrFail(ApplicationControlMapping, {
                select: ['id', 'evidences'],
                where: {
                    id: controlId,
                    app_id: appId,
                },
                relations: ['evidences']
            })

            const appControlEvidence: ApplicationControlEvidence = appControl.evidences.find(evidence => evidence.id === evidenceId);
            if (!appControlEvidence) {
                throw new NotFoundException('Evidence not found');
            }

            await manager.delete(ApplicationControlEvidence, {
                id: appControlEvidence.id,
            });

            await manager.update(ApplicationControlMapping, { id: appControl.id }, { implementation_status: ApplicationControlMappingStatus.NOT_IMPLEMENTED, updated_at: new Date() });
        });
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
