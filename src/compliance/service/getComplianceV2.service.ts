import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AsyncTask, TaskOps } from "src/entities/asyncTasks.entity";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { In, Not, Repository } from "typeorm";
import { SyncComplianceV2Service } from "./syncComplianceV2.service";
import { LoggerService } from "src/logger/logger.service";
import { UserComment } from "src/entities/userComment.entity";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";

interface StandardCompliance {
    id: string;
    framework_name: string;
    standard_name: string;
    control_total: number;
    source_total: number;
    exception_total: number;
    percentage_completion: number;
    used: boolean;
}

@Injectable()
export class GetComplianceV2Service {
    constructor(
        @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        @InjectRepository(StandardControlMapping) private readonly standardControlMapRepo: Repository<StandardControlMapping>,
        @InjectRepository(ApplicationControlMapping) private readonly applicationControlMapRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(App) private readonly appRepo: Repository<App>,
        @InjectRepository(AsyncTask) private readonly asyncTaskRepository: Repository<AsyncTask>,
        @InjectRepository(SourceV1) private readonly sourceRepo: Repository<SourceV1>,
        @InjectRepository(ApplicationControlRecommendation) private readonly recommendationRepo: Repository<ApplicationControlRecommendation>,
        private readonly getSyncedStatus: SyncComplianceV2Service,
        private readonly logger: LoggerService,
        @InjectRepository(UserComment) private readonly userCommentRepo: Repository<UserComment>,
    ) { }

    async getForApplication(userInfo: { customerId: string }, appId: number): Promise<StandardCompliance[]> {
        await this.validateValidAppId(userInfo.customerId, appId);

        const appStandards = await this.getAppStandards(appId);

        const standardCompliances = await Promise.all(
            appStandards.map(async appStandard =>
                this.buildStandardCompliance(appStandard, appId)
            )
        );

        return standardCompliances;
    }

    async getForApplicationStandard(userInfo: { customerId: string }, appId: number, standardId: number): Promise<any> {
        const standard: Standard = await this.standardRepo.findOneOrFail({
            where: {
                id: standardId,
                active: true
            }
        });

        const appStandard: AppStandard = await this.appStandardRepo.findOneOrFail({
            where: {
                app_id: appId,
                standard_id: standardId
            }
        });
        const appControls: ApplicationControlMapping[] = await this.applicationControlMapRepo.find({
            select: ['user_implementation_status', 'implementation_status', 'percentage_completion'],
            where: {
                app_id: appId,
                standard_id: standardId
            }
        })

        let totalPercentageCompletion: number = 0;
        let exceptionTotal: number = 0;

        for (const appControl of appControls) {
            totalPercentageCompletion += appControl.getPercentageStatus()
            if (appControl.isException()) {
                exceptionTotal += 1;
            }
        }

        const percentageCompletion = appControls.length > 0 ? parseFloat((totalPercentageCompletion / (appControls.length - exceptionTotal)).toFixed(2)) : 0;

        const std_comment_count = await this.userCommentRepo.count({where : {app_id : appId, standard_id : standardId, is_standard_level_comment: true, is_deleted: false}});
        
        // Get recommendation count
        const recommendation_count = await this.recommendationRepo.count({
            where: {
                application_id: appId,
                standard_id: standardId
            }
        });

        return {
            id: standard.id,
            name: standard.name,
            description: standard.long_description,
            percentage_completion: percentageCompletion,
            source_total: await this.getSourceTotal(appId, standardId),
            control_total: appControls.length,
            exception_total: exceptionTotal,
            recommendation_count: recommendation_count,
            isSynced: await this.getSyncedStatus.isSynced(appId, standardId, null),
            updated_at : appStandard.compliance_updated_at,
            comment_count: std_comment_count? std_comment_count : 0,
            is_crm_available: appStandard.is_crm_available,
            crm_file_name: appStandard.crm_file_path?.split('/').pop(),
            crm_file_uploaded_at: appStandard.crm_file_uploaded_at
        };
    }

    async havePendingCompliance(
        userInfo: { userId: string, customerId: string },
        appId: number,
        standardId: number
    ): Promise<boolean> {
        const asyncTask: AsyncTask = await this.asyncTaskRepository.findOne({
            where: {
                app_id: appId,
                ops: TaskOps.UPDATE_COMPLIANCE,
                status: In(AsyncTask.pendingTaskStatus()),
            },
            order: {
                created_at: 'desc'
            },
            select: ['id']
        })

        if (asyncTask) return false;

        let havePendingCompliance = false;

        if(standardId) {
            const appStandard: AppStandard = await this.appStandardRepo.findOne({
                where: { app_id: appId, standard_id: standardId }
            });

            havePendingCompliance = appStandard.have_pending_compliance;
        } else {

            const appStandards: AppStandard[] = await this.appStandardRepo.find({
                where: { app_id: appId }
            });

            if (!appStandards) return false;

            for (const appStandard of appStandards) {
                if(appStandard.have_pending_compliance) {
                    havePendingCompliance = true;
                    break;
                }
            }
        }

        if (!havePendingCompliance) {
            const source: SourceV1 = await this.sourceRepo.findOne({
                select: ['id'],
                where: {
                    app_id: appId,
                    customer_id: userInfo.customerId,
                    is_active: true
                }
            })

            if (!source) return false;

            const appControl: ApplicationControlMapping = await this.applicationControlMapRepo.findOne({
                select: ['updated_at'],
                where: {
                    app_id: appId,
                    implementation_status: Not(ApplicationControlMappingStatus.NOT_IMPLEMENTED),
                    ...(standardId && { standard_id: standardId })
                },
                order: {
                    updated_at: 'DESC'
                }
            })

            let appControlWithLatestAdditionalParam: ApplicationControlMapping = await this.applicationControlMapRepo.createQueryBuilder('appControlMapping')
            .where('appControlMapping.app_id = :appId', { appId })
            .andWhere('appControlMapping.additional_param_updated_at > appControlMapping.updated_at')
            .orderBy('appControlMapping.additional_param_updated_at', 'DESC')
            .getOne();

            if(appControlWithLatestAdditionalParam) {
                if(appControlWithLatestAdditionalParam.updated_at > appControlWithLatestAdditionalParam.additional_param_updated_at) {
                    appControlWithLatestAdditionalParam = null;
                }
            }

            const result = await this.sourceRepo.query(`
                SELECT MAX(updated_at) as max_updated_at FROM source WHERE app_id = $1`, [appId]);

            if (result.length === 0) {
                return false;
            }

            const maxAdditionalParamUpdatedAt = appControlWithLatestAdditionalParam && appControlWithLatestAdditionalParam.additional_param_updated_at ? appControlWithLatestAdditionalParam.additional_param_updated_at.getTime() : 0;
            const maxSourceUpdatedAt = result.length > 0 && result[0].max_updated_at ? result[0].max_updated_at.getTime() : 0;
            const maxControlUpdatedAt = appControl && appControl.updated_at ? appControl.updated_at.getTime() : 0;
            return Math.max(maxSourceUpdatedAt, maxAdditionalParamUpdatedAt) > maxControlUpdatedAt;
        }

        const haveSource: boolean = await this.sourceRepo.exists({
            where: {
                app_id: appId,
                customer_id: userInfo.customerId,
                is_active: true
            }
        })

        return havePendingCompliance && haveSource;
    }

    private async validateValidAppId(customerId: string, appId: number): Promise<void> {
        await this.appRepo.findOneOrFail({
            select: ['id'],
            where: {
                id: appId,
                customer_id: customerId
            }
        })
    }

    private async getActiveStandards(): Promise<Standard[]> {
        return this.standardRepo.find({
            where: { active: true },
            relations: ['framework'],
        });
    }

    private async getAppStandards(appId: number): Promise<AppStandard[]> {
        return await this.appStandardRepo
            .createQueryBuilder('appStandard')
            .innerJoinAndMapOne('appStandard.standardV1', 'standard', 'standard', 'standard.id = appStandard.standard_id')
            .innerJoinAndMapOne('standard.framework', 'framework', 'framework', 'standard.framework_id = framework.id')
            .select([
                'appStandard.app_id',
                'appStandard.standard_id',
                'appStandard.have_pending_compliance',
                'appStandard.created_at',
                'standard.id',
                'standard.framework_id',
                'standard.name',
                'standard.short_description',
                'standard.long_description',
                'standard.path',
                'standard.labels',
                'standard.created_at',
                'standard.updated_at',
                'standard.active',
                'framework.name',
            ])
            .where('appStandard.app_id = :appId', { appId })
            .getMany();
    }

    private async buildStandardCompliance(
        appStandard: AppStandard,
        appId: number,
    ): Promise<StandardCompliance> {
        const metrics = await this.getComplianceMetrics(appStandard.standardV1.id, appId);

        return {
            id: appStandard.standardV1.id.toString(),
            framework_name: appStandard.standardV1.framework.name,
            standard_name: appStandard.standardV1.name,
            ...metrics,
        };
    }

    private async getComplianceMetrics(
        standardId: number,
        appId: number,
    ): Promise<Omit<StandardCompliance, 'id' | 'framework_name' | 'standard_name'>> {
        const [controlTotal, exceptionTotal, sourceTotal, percentageCompletion] = await Promise.all([
            this.getControlTotal(appId, standardId),
            this.getControlExceptionTotal(appId, standardId),
            this.getSourceTotal(appId, standardId),
            this.calculatePercentageCompletion(appId, standardId),
        ]);

        return {
            control_total: controlTotal,
            source_total: sourceTotal,
            exception_total: exceptionTotal,
            percentage_completion: percentageCompletion,
            used: controlTotal > 0,
        };
    }

    private async getControlTotal(appId: number, standardId: number): Promise<number> {
        return this.applicationControlMapRepo.count({
            where: {
                app_id: appId,
                standard_id: standardId
            }
        });
    }

    private async getControlExceptionTotal(appId: number, standardId: number): Promise<number> {

        const result = await this.applicationControlMapRepo.query(`
            SELECT COUNT(*) AS count
             FROM application_control_mapping_view
             WHERE app_id = $1 AND standard_id = $2 AND implementation_status = $3

            `, [appId, standardId, ApplicationControlMappingStatus.EXCEPTION])
        return parseInt(result[0].count) || 0;
    }

    private async getSourceTotal(appId: number, standardId: number): Promise<number> {
        const result = await this.standardControlMapRepo.query(`
           SELECT COUNT(DISTINCT sc.source_id) AS count
            FROM standard_control_mapping scm
            JOIN control_chunk_mapping ccm ON scm.control_id = ccm.control_id
            JOIN source_chunk_mapping sc ON sc.chunk_id = ccm.chunk_id
            JOIN source s ON s.id = sc.source_id
            WHERE ccm.app_id = $1 
            AND scm.standard_id = $2
            AND s.app_id = $1;
        `, [appId, standardId])
        return parseInt(result[0].count) || 0;
    }

    private async calculatePercentageCompletion(appId: number, standardId: number): Promise<number> {
        const appControls: ApplicationControlMapping[] = await this.applicationControlMapRepo.find({
            select: ['implementation_status', 'percentage_completion', 'user_implementation_status', 'user_implementation_explanation'],
            where: {
                app_id: appId,
                standard_id: standardId,
            }
        });
        if (appControls.length === 0) {
            return 0;
        }

        const { totalCompletion, exceptionCount } = appControls.reduce(
            (acc, appControl) => {
                const status = appControl.user_implementation_status? appControl.user_implementation_status : appControl.implementation_status;
                acc.totalCompletion += ApplicationControlMapping.getPercentageCompletion(status, appControl.percentage_completion) ?? 0;
                if (status === 'exception') {
                    acc.exceptionCount += 1;
                }
                return acc;
            },
            { totalCompletion: Number(0), exceptionCount: Number(0) }
        );

        const percentageCompletion = parseFloat((Number(totalCompletion) / Number(appControls.length - exceptionCount)).toFixed(2));
        return percentageCompletion;
    }

    async getControlsByStandard(standardId: number) {
        const controls = await this.standardControlMapRepo.find({
            where: { standard_id: standardId },
            relations: ['control'],
            select: {
                id: true,
                standard_id: true,
                control_id: true,
                additional_selection_parameters: true,
                additional_guidance: true,
                created_at: true,
                updated_at: true,
                control: {
                    id: true,
                    control_name: true,
                    control_summary: true,
                    family_name: true,
                    control_long_name: true,
                    control_text: true,
                    control_discussion: true,
                    control_eval_criteria: true,
                    control_short_summary: true
                }
            },
            order: {
                control: {
                    family_name: 'ASC',
                    order_index: 'ASC'
                }
            }
        });

        // Group controls by family for better organization
        const familyMap = new Map<string, any[]>();
        
        controls.forEach(controlMapping => {
            const familyName = controlMapping.control.family_name;
            if (!familyMap.has(familyName)) {
                familyMap.set(familyName, []);
            }
            familyMap.get(familyName)!.push({
                id: controlMapping.control.id,
                name: controlMapping.control.control_name + ' ' + controlMapping.control.control_long_name,
                summary: controlMapping.control.control_summary,
                family: controlMapping.control.family_name,
                long_name: controlMapping.control.control_long_name,
                text: controlMapping.control.control_text,
                discussion: controlMapping.control.control_discussion,
                eval_criteria: controlMapping.control.control_eval_criteria,
                short_summary: controlMapping.control.control_short_summary,
                standard_control_mapping_id: controlMapping.id,
                control_id: controlMapping.control_id
            });
        });

        // Convert to flat array sorted by family, then by order
        const result: any[] = [];
        const sortedFamilies = Array.from(familyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        sortedFamilies.forEach(([familyName, familyControls]) => {
            result.push(...familyControls);
        });

        return result;
    }
}
