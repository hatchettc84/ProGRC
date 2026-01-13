import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { DataSource, In, Repository } from "typeorm";
import { SyncComplianceV2Service } from "./syncComplianceV2.service";
import { SetAdditionalParamReq, SetExplationEnhancementRequest } from "../controlDetails.dto";
import { AppStandard } from "src/entities/appStandard.entity";
import { AuditService } from "src/audit/audit/audit.service";

@Injectable()
export class GetControlEnhancementV2Service {

    constructor(
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        private readonly getSyncedStatus: SyncComplianceV2Service,
        private readonly dataSource: DataSource,
       private readonly auditService: AuditService,
        
    ) { }

    async getForControl(
        userInfo: { customerId: string },
        appId: number,
        controlId: number,
        enhancementId: string | null
    ): Promise<[any[], number, any[]]> {
        const query = `select
	acmv.*,
	cv.control_name,
	cv.control_long_name,
	cv.control_summary,
	as2.source_updated_at
from
	application_control_mapping_view acmv
join control_view cv on
	acmv.control_id = cv.id 
join app_standards as2 on
     as2.app_id = acmv.app_id and as2.standard_id = acmv.standard_id 
where
	acmv.app_id = $1
	and acmv.standard_id = (select standard_id from application_control_mapping acm where acm.id = $2)
	and cv.control_parent_id = (select control_id from application_control_mapping acm where acm.id = $2);`;
    const data = await this.appControlRepo.query(query, [appId, controlId]);

    let application_control_mapping_id = data.map((d: { id: number }) => d.id).join(',') || null;

    if(!application_control_mapping_id) {
        return [data, data.length, []];
    }
    const evidenceQuery = `
                SELECT
                    *
                FROM
                    application_control_evidence ace
                    where ace.application_control_mapping_id in (${application_control_mapping_id});
            `;
            const evidenceData = await this.dataSource.query(evidenceQuery);

        return [data, data.length, evidenceData];
    }

    private async getControlSourceTotal(controlId: number, appId: number, standardId: number): Promise<number> {
        const result = await this.appControlRepo.query(`
           SELECT COUNT(DISTINCT sc.source_id) AS count
            FROM standard_control_mapping scm
            JOIN control_chunk_mapping ccm ON scm.control_id = ccm.control_id
            JOIN source_chunk_mapping sc ON sc.chunk_id = ccm.chunk_id
            WHERE ccm.control_id = $1 AND ccm.app_id = $2 AND scm.standard_id = $3;
        `, [controlId, appId, standardId])
        return parseInt(result[0].count) || 0;
    }

    async updateStatusAndExplanation(userInfo: { userId: string, customerId: string }, appId: number,  data: SetExplationEnhancementRequest) {
        const uniqueIds = Array.from(new Set(data.ids));

        const controls: ApplicationControlMapping[] = await this.appControlRepo.find({
            select: ['id'],
            where: {
                id: In(uniqueIds),
                app_id: appId,
            }
        });

        if (controls.length !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(ApplicationControlMapping, { app_id: appId, id: In(data.ids) }, {
                user_implementation_status: data.implementationStatus || null,
                user_implementation_explanation: data.implementationExplanation || null,
                updated_at: new Date(),
            });
        });
    }

    async updateUserAddtionalParameter(userInfo: { userId: string, customerId: string }, appId: number, stdId: number,  data: SetAdditionalParamReq) {
        const uniqueIds = Array.from(new Set(data.ids));

        const controls: ApplicationControlMapping[] = await this.appControlRepo.find({
            select: ['id'],
            where: {
                id: In(uniqueIds),
                app_id: appId,
            }
        });

        if (controls.length !== uniqueIds.length) {
            throw new BadRequestException("Invalid control id");
        }
        await this.dataSource.transaction(async (manager) => {
            // await manager.update(AppStandard, { app_id: appId, standard_id: stdId }, {
            //     source_updated_at: new Date(),
            //     compliance_updated_at: new Date(),
            // })
            await manager.update(ApplicationControlMapping, { app_id: appId, id: In(data.ids) }, {
                user_additional_parameter: data.params || null,
                additional_param_updated_at: new Date(),
            });
        });
    }
}
