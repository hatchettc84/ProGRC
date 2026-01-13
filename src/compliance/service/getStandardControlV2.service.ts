import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppStandard } from "src/entities/appStandard.entity";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { Brackets, In, Repository } from "typeorm";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { LoggerService } from "src/logger/logger.service";
import { Control } from "src/entities/compliance/control.entity";
import { AuditService } from "src/audit/audit/audit.service";
import { AuditFeedback } from "src/entities/auditFeedback.entity";
import { UserComment } from "src/entities/userComment.entity";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";

interface FamilyResponse {
    category_name: string;
    percentage_completion: number;
    total_enhancements: number;
    controls: ControlResponse[];
    short_name?: string; // Added for family matching
}

export interface ControlResponse {
    id: number;
    short_name: string;
    name: string;
    risk_level: string | null;
    enhancement_total: number;
    percentage_completion: number;
    status: string;
    // evidence_document: string | null;
    // evidence_description: string | null;
    evidences?: {
        id: number;
        description: string;
        document: string;
        created_at: Date;
        updated_at: Date;
    }[];
    updated_at?: Date;
    // isSynced: boolean;
    is_reviewed: boolean;
    source_updated_at?: Date;
    control_id?: number;
    feedback_status?: string;
    feedback_notes?: string;
}

interface CalculationResult {
    totalCompletion: number;
    exceptionTotal: number;
    enhancementTotal: number;
}

@Injectable()
export class GetStandardControlV2Service {
    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        @InjectRepository(StandardControlMapping) private readonly standardControlMapRepo: Repository<StandardControlMapping>,
        @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
        @InjectRepository(ApplicationControlRecommendation) private readonly appControlRecommendationRepo: Repository<ApplicationControlRecommendation>,
        private readonly logger: LoggerService,
        private readonly auditService: AuditService,
        @InjectRepository(UserComment) private readonly userCommentRepo: Repository<UserComment>,
        @InjectRepository(ControlEvaluationResult) private readonly controlEvaluationResultRepo: Repository<ControlEvaluationResult>,
    ) { }

    async getForApplication(
        userInfo: { customerId: string },
        appId: number,
        standardId: number
    ): Promise<[FamilyResponse[], number]> {
        try {

            const categoryLevelCompliances = await this.getCategoryCompliances(appId, standardId);
            const parentControlLevelCompliances = await this.getParentCompliances(appId, standardId);
            const auditorFeedbacks: AuditFeedback[] = await this.auditService.findByAppAndStandard(userInfo, appId, standardId);

            const formattedCategoryData = categoryLevelCompliances.map((category) => {
                return {
                    category_name: category.family_name,
                    percentage_completion: Number(category.deno) ? Number((Number(category.num) / Number(category.deno)).toFixed(2)) : 0,
                    controls: parentControlLevelCompliances.filter((control) => control.family_name === category.family_name).map(control => {
                        const feedback = auditorFeedbacks.find(feedback => feedback.control_id === control.acm_id);

                        return {
                            id: control.acm_id,
                            short_name: control.control_name,
                            name: control.control_name + " " + control.control_long_name,
                            risk_level: control.risk_level || null,
                            enhancement_total: Number(control.enhancementCount),
                            percentage_completion: Number(control.deno) ? Number((Number(control.num) / Number(control.deno)).toFixed(2)) : 0,
                            status: control.implementation_status,
                            updated_at: control.updated_at,
                            source_updated_at: control.source_updated_at,
                            is_reviewed: control.is_reviewed,
                            control_id: control.id,
                            feedback_status: feedback ? feedback.feedback_status : null,
                            feedback_notes: feedback ? feedback.feedback_notes : null,
                        }
                    }),
                    short_name: parentControlLevelCompliances.filter((control) => control.family_name === category.family_name)[0].control_name.split('-')[0],
                    total_enhancements: Number(category.enhancementCount),
                }
            });

            return [formattedCategoryData, formattedCategoryData.length];


        } catch (error) {
            this.logger.error('Error in getForApplication:', error);
            throw new Error('Failed to fetch application controls');
        }
    }

    async getControlsByFamily(
        userInfo: { customerId: string },
        appId: number,
        standardId: number,
        familyName: string
    ): Promise<ControlResponse[]> {
        try {
            const [families] = await this.getForApplication(userInfo, appId, standardId);
            
            // Find the family by short_name (which matches the familyName parameter)
            const family = families.find(f => f.short_name === familyName);
            
            if (!family) {
                return [];
            }

            // Return the controls for this family
            return family.controls.map(control => ({
                id: control.id,
                short_name: control.short_name,
                name: control.name,
                risk_level: control.risk_level,
                enhancement_total: control.enhancement_total,
                percentage_completion: control.percentage_completion,
                status: control.status,
                is_reviewed: control.is_reviewed || false,
                evidences: control.evidences || [],
                control_id: control.control_id,
                feedback_status: control.feedback_status,
                feedback_notes: control.feedback_notes,
            }));
        } catch (error) {
            this.logger.error('Error in getControlsByFamily:', error);
            throw new Error('Failed to fetch controls by family');
        }
    }

    private async getParentCompliances(appId: number, standardId: number): Promise<any> {
        const query = `select c2.id,
                a.standard_id,
                acm2.implementation_status,
                acm2.updated_at,
                acm2.is_excluded,
                acm2.is_reviewed,
                c2.control_name,
                c2.family_name,
                c2.control_long_name,
                a.num,
                a.deno,
                a."enhancementCount",
                as2.source_updated_at,
                acm2.id as acm_id,
                acm2.risk_level
            from (select acm.app_id,
                        acm.standard_id,
                        cv.grouping_control_id,
                        sum(num)               as num,
                        sum(deno)              as deno,
                        sum(cv.is_enhancement) as "enhancementCount"
                FROM application_control_mapping_view acm
                        join control_view cv on
                    cv.id = acm.control_id
                where acm.app_id = $1
                    and acm.standard_id = $2
                group by acm.app_id, acm.standard_id, cv.grouping_control_id) a
                    left join control c2 on a.grouping_control_id = c2.id
                    left join application_control_mapping_view acm2 on
                acm2.control_id = c2.id and acm2.standard_id = a.standard_id and acm2.app_id = a.app_id
                left join app_standards as2 on
                    as2.app_id = a.app_id and as2.standard_id = a.standard_id
            ORDER BY c2.id;`
        return this.appControlRepo.query(query, [appId, standardId]);
    }

    private async getCategoryCompliances(appId: number, standardId: number): Promise<any> {
        const query = `select c.family_name,  num, deno, "enhancementCount", c.order_index, a.updated_at from
            (select cv.framework_id, cv.family_name, sum(num) as num, sum(deno) as deno, sum(cv.is_enhancement) as "enhancementCount", min(acm.updated_at) as updated_at 
            FROM application_control_mapping_view acm
                    join control_view cv on
                cv.id = acm.control_id
            where acm.app_id = $1 and acm.standard_id = $2
            group by cv.family_name, cv.framework_id) a
        left join control c on a.family_name = c.family_name and a.framework_id = c.framework_id
        where c.order_index is not null
        group by c.family_name, num, deno, "enhancementCount", order_index, a.updated_at
        order by c.order_index;`
        return this.appControlRepo.query(query, [appId, standardId]);
    }

    async getControlExceptionForApplication(
        userInfo: { customerId: string },
        appId: number,
        controlId: number
    ): Promise<[ApplicationControlMapping[], number]> {

        const parentControl: ApplicationControlMapping = await this.appControlRepo.findOneOrFail({
            where: {
                id: controlId,
                app_id: appId
            },
            relations: ['control']
        });

        let [enhancementExceptions, total] = await this.appControlRepo
            .createQueryBuilder("appControl")
            .leftJoinAndSelect("appControl.control", "control")
            .where("appControl.app_id = :appId", { appId })
            .andWhere("control.control_parent_id = :parentId", { parentId: parentControl.control_id })
            .andWhere(
                new Brackets(qb => {
                    qb.where("appControl.implementation_status = :status", { status: ApplicationControlMappingStatus.EXCEPTION })
                        .orWhere("appControl.user_implementation_status = :status", { status: ApplicationControlMappingStatus.EXCEPTION });
                })
            )
            .getManyAndCount();


        for (const enhancementException of enhancementExceptions) {
            enhancementException.source_total = await this.getControlSourceTotal(enhancementException.control_id, enhancementException.app_id, enhancementException.standard_id);
        }

        if(parentControl.implementation_status === ApplicationControlMappingStatus.EXCEPTION || parentControl.user_implementation_status === ApplicationControlMappingStatus.EXCEPTION){
            parentControl.source_total = await this.getControlSourceTotal(parentControl.control_id, parentControl.app_id, parentControl.standard_id);
            enhancementExceptions.push(parentControl);
            total += 1;
        }

        return [enhancementExceptions, total];
    }

    async getControlDetail(
        userInfo: { customerId: string },
        appId: number,
        controlId: number,
    ): Promise<any> {
        const query = `
        select
	acmv.*,
	cv.control_name,
	cv.control_long_name,
	cv.control_summary,
    cv.control_short_summary,
	as2.source_updated_at
from
	application_control_mapping_view acmv
join control_view cv on
	acmv.control_id = cv.id 
join app_standards as2 on
     as2.app_id = acmv.app_id and as2.standard_id = acmv.standard_id 
where
	acmv.app_id = $1
	and acmv.id = $2;`;
        const parentControls = await this.appControlRepo.query(query, [appId, controlId]);
        const parentControl = parentControls[0];
        const appStandard = await this.appStandardRepo.findOneOrFail({
            where: {
                app_id: appId,
                standard_id: parentControl.standard_id
            }
        });

        const controlEnhancements = await this.controlRepo.find({ where: { control_parent_id: parentControl.control_id } });

        const enhancements = await this.standardControlMapRepo.find({ where: { standard_id: parentControl.standard_id, control_id: In(controlEnhancements.map(c => c.id)) } });
        const evidences = await this.getEvidences(parentControl.id);
        const refrences = await this.getSourceReference([parentControl.control_id], appId)

        const additionParamUpdatedAt = parentControl.additional_param_updated_at ? parentControl.additional_param_updated_at.getTime() : 0;
        const sourceUpdatedAt = appStandard.source_updated_at ? appStandard.source_updated_at.getTime() : 0;
        const parentControlUpdatedAt = parentControl.updated_at ? parentControl.updated_at.getTime() : 0;
        const isSynced = (Math.max(additionParamUpdatedAt, sourceUpdatedAt) > parentControlUpdatedAt) ? false : true;
        const control_comment_count = await this.userCommentRepo.count({ where: { control_id: parentControl.control_id, standard_id: parentControl.standard_id, app_id: appId, is_deleted: false, is_standard_level_comment: false } });
        const control_evaluation_result_count = await this.controlEvaluationResultRepo.count({ where: { control_id: parentControl.control_id, standard_id: parentControl.standard_id, app_id: appId, } });

        return {
            id: parentControl.id,
            name: parentControl.control_name + " " + parentControl.control_long_name,
            description: parentControl.control_text,
            percentage_completion: Number(parentControl.deno) ? Number((Number(parentControl.num) / Number(parentControl.deno)).toFixed(2)) : 0,
            risk_levels: parentControl.risk_level,
            implementation: parentControl.implementation_explanation,
            is_user_implemented_status: parentControl.is_user_modified_status ? true : false,
            is_user_implemented_explanation: parentControl.is_user_modified_explanation ? true : false,
            source_total: await this.getControlsSourceTotal([parentControl.control_id], appId, parentControl.standard_id),
            exception_total: await this.getControlExceptionTotal(parentControl.control_id, appId, parentControl.standard_id),
            status: parentControl.implementation_status,
            evidences: evidences,
            updated_at: parentControl.updated_at,
            isSynced: isSynced,
            is_reviewed: parentControl.is_reviewed,
            control_count: enhancements ? enhancements.length : 0,
            reference_count: refrences.length,
            references: refrences,
            recommendation_count: await this.getControlRecommendationCount(appId, parentControl.control_id, parentControl.standard_id),
            control_id: parentControl.control_id,
            control_summary: parentControl.control_summary,
            comment_count: control_comment_count ? control_comment_count : 0,
            control_evaluation_count: control_evaluation_result_count ? control_evaluation_result_count : 0,
            short_summary: parentControl.control_short_summary,
            exception_reason: parentControl.exception_reason,
        };
    }

    private async getControlExceptionTotal(controlId: number, appId: number, standardId: number): Promise<number> {
        const result = await this.appControlRepo.query(`
            WITH relevant_controls AS (
                SELECT id
                FROM control_view
                WHERE id = $3 OR control_parent_id = $3
            )
            SELECT COUNT(*) AS count
            FROM application_control_mapping_view acmv
            WHERE acmv.app_id = $1
                AND acmv.standard_id = $2
                AND acmv.control_id IN (SELECT id FROM relevant_controls)
                AND acmv.implementation_status = $4;
        `, [appId, standardId, controlId, ApplicationControlMappingStatus.EXCEPTION]);
        return parseInt(result[0].count) || 0;
    }

    private async getEvidences(applicationControlMappingId: number): Promise<any[]> {
        const data = this.appControlRepo.query(`
            SELECT id, description, document, created_at, updated_at
            FROM application_control_evidence
            WHERE application_control_mapping_id = $1
        `, [applicationControlMappingId]);

        return data || [];
    }

    private async getControlRecommendationCount(appId: number, controlId: number, standardId: number): Promise<number> {
        this.logger.info("params: ", appId, controlId, standardId)
        const result = await this.appControlRecommendationRepo.query(`
           SELECT COUNT(*) AS count
            FROM application_control_recommendation
            WHERE control_id = $1 AND standard_id = $2 AND application_id = $3
        `, [controlId, standardId, appId]);
        return parseInt(result[0].count) || 0;
    }

    private async getControlsSourceTotal(controlIds: number[], appId: number, standardId: number): Promise<number> {
        const result = await this.standardControlMapRepo.query(`
           SELECT COUNT(DISTINCT sc.source_id) AS count
            FROM standard_control_mapping scm
            JOIN control_chunk_mapping ccm ON scm.control_id = ccm.control_id
            JOIN source_chunk_mapping sc ON sc.chunk_id = ccm.chunk_id
            WHERE ccm.app_id = $1 AND scm.standard_id = $2 and ccm.control_id = ANY($3::int[]);
        `, [appId, standardId, controlIds]);
        return parseInt(result[0].count) || 0;
    }

    private async getControlSourceTotal(controlId: number, appId: number, standardId: number): Promise<number> {
        const result = await this.standardControlMapRepo.query(`
           SELECT COUNT(DISTINCT sc.source_id) AS count
            FROM standard_control_mapping scm
            JOIN control_chunk_mapping ccm ON scm.control_id = ccm.control_id
            JOIN source_chunk_mapping sc ON sc.chunk_id = ccm.chunk_id
            WHERE ccm.control_id = $1 AND ccm.app_id = $2 AND scm.standard_id = $3;
        `, [controlId, appId, standardId]);
        return parseInt(result[0].count) || 0;
    }

    async calculateForParentControl(
        appId: number,
        standardId: number,
        parentControl: ApplicationControlMapping
    ): Promise<CalculationResult> {
        const childControls = await this.fetchChildControls(appId, standardId, parentControl.control_id);
        const stats = this.calculateControlStats(childControls);

        return {
            totalCompletion: this.calculateTotalCompletion(stats.completion, parentControl, childControls.length),
            exceptionTotal: stats.exceptions,
            enhancementTotal: childControls.length
        };
    }

    private async fetchChildControls(appId: number, standardId: number, parentId: number): Promise<ApplicationControlMapping[]> {
        return this.appControlRepo.find({
            select: { implementation_status: true },
            where: {
                app_id: appId,
                standard_id: standardId,
                control: { control_parent_id: parentId }
            },
            relations: ['control']
        });
    }

    private calculateControlStats(controls: ApplicationControlMapping[]): {
        completion: number;
        exceptions: number;
    } {
        return controls.reduce((acc, control) => ({
            completion: acc.completion + control.getPercentageStatus(),
            exceptions: acc.exceptions + (control.isException() ? 1 : 0)
        }), { completion: 0, exceptions: 0 });
    }

    private calculateTotalCompletion(
        childrenCompletion: number,
        parentControl: ApplicationControlMapping,
        childCount: number
    ): number {
        const totalCompletion = (childrenCompletion + parentControl.getPercentageStatus()) / (childCount + 1);
        return parseFloat(totalCompletion.toFixed(2)) || 0;
    }

    private async getSourceReference(controlIds: number[], appId: number): Promise<any[]> {


        const result = await this.standardControlMapRepo.query(`
           SELECT scm.chunk_text, s.name, scm.id
            FROM source_chunk_mapping scm
            JOIN control_chunk_mapping ccm ON scm.chunk_id = ccm.chunk_id
            JOIN source s on scm.source_id = s.id
            WHERE ccm.app_id = $1 AND ccm.control_id = ANY($2::int[])
            group by scm.chunk_text, s.name, scm.id;
        `, [appId, controlIds]);

        return result || [];

    }
}