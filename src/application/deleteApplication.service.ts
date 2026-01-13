import { Injectable } from "@nestjs/common";
import { App } from "src/entities/app.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Asset } from "src/entities/source/assets.entity";
import { DataSource, In } from "typeorm";
import { ApplicationPolicyService } from "./applicationPolicy.service";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { Poam } from "src/entities/poam.entity";

@Injectable()
export class DeleteApplicationService {
    constructor(
        private readonly applicationPolicyService: ApplicationPolicyService,
        private readonly dataSource: DataSource,
        private readonly s3Service: AwsS3ConfigService,
    ) { }
    async deleteApplication(userInfo: { userId: string, tenantId: string }, appId: number) {
        await this.applicationPolicyService.canDeleteApplication(userInfo, appId);

        try {
            const sourcesToDeleteFromS3 = [];
            const evidencesToDeleteFromS3 = [];
            const s3Client = this.s3Service.getS3();
            await this.dataSource.transaction(async (manager) => {
                manager.delete(AsyncTask, { app_id: appId });
                const assessmentInfos = await manager.find(AssessmentDetail, { where: { app_id: appId } });
                const appControlMapping = await manager.find(ApplicationControlMapping, { where: { app_id: appId } });
                const appControlMappingIds = appControlMapping.map(mapping => mapping.id);
                const assessmentIds = assessmentInfos.map(assessmentInfo => assessmentInfo.id);
                
                if (assessmentIds.length > 0) {
                    await Promise.all([
                        manager.delete(AssessmentSections, { assessment_id: In(assessmentIds) }),
                        manager.delete(AssessmentOutline, { assessment_id: In(assessmentIds) }),
                        manager.delete(AssessmentHistory, { assessment_id: In(assessmentIds) }),
                        manager.delete(TrustCenter, {app_id: appId}),
                        manager.delete(AssessmentDetail, { id: In(assessmentIds) }),
                    ]);
                }

                const sources = await manager.find(SourceV1, { where: { app_id: appId } });
                const sourceIds = sources.map(source => source.id);
                sourcesToDeleteFromS3.push(...sources.map(source => source.file_bucket_key));
                const evidences = await manager.find(ApplicationControlEvidence, { where: { application_control_mapping_id: In(appControlMappingIds) } });
                evidencesToDeleteFromS3.push(...evidences.map(evidence => evidence.document));
                await Promise.all([
                    manager.delete(AppUser, { app_id: appId }),
                    manager.delete(Asset, { app_id: appId }),
                    manager.delete(SourceVersion, { source_id: In(sourceIds) }),
                    manager.delete(SourceChunkMapping, { source_id: In(sourceIds) }),
                    manager.delete(SourceV1, { app_id: appId }),
                    manager.delete(ControlChunkMapping, { app_id: appId }),
                    manager.delete(AppStandard, { app_id: appId }),
                    manager.delete(ApplicationControlEvidence, { application_control_mapping_id: In(appControlMappingIds) }),
                    manager.delete(ApplicationControlMapping, { app_id: appId }),
                    manager.delete(ApplicationControlRecommendation, { application_id: appId }),
                    manager.delete(Poam, { application_id: appId }),
                    manager.delete(App, { id: appId }),
                    
                ]);
                // Delete sources from S3
                if(sourcesToDeleteFromS3.length > 0) {
                    const deleteSourcesCommand = this.s3Service.deleteMultipleObjectsCommand(sourcesToDeleteFromS3);
                    await s3Client.send(deleteSourcesCommand);
                }
                // Delete evidences from S3
                if(evidencesToDeleteFromS3.length > 0) {
                    const deleteEvidencesCommand = this.s3Service.deleteMultipleObjectsCommand(evidencesToDeleteFromS3);
                    await s3Client.send(deleteEvidencesCommand);
                }
            });


            return { message: 'Application deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete application, ${error}`);
        }
    }
}
