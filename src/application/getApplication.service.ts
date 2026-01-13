import { UserData } from "src/common/interfaces";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GetStandardControlV2Service } from "src/compliance/service/getStandardControlV2.service";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { UserRole, UserRoles } from "src/masterData/userRoles.entity";
import { In, IsNull, Repository } from "typeorm";
import { ControlFamilySummaryResponse, StandardSummaryResponse } from "./application.dto";
import { AppUser } from "src/entities/appUser.entity";


interface CurrentUser {
    userId: string;
    role_id: string;
    customerId?: string;
    tenant_id?: string;
}

interface FamilyResponse {
    category_name: string;
    percentage_completion: number;
    total_enhancements: number;
    controls: ControlResponse[];
}

interface ControlResponse {
    id: number;
    short_name: string;
    name: string;
    risk_level: string | null;
    enhancement_total: number;
    percentage_completion: number;
}

interface CalculationResult {
    totalCompletion: number;
    exceptionTotal: number;
    enhancementTotal: number;
}


@Injectable()
export class GetApplicationService {
    constructor(
        @InjectRepository(App) private appRepo: Repository<App>,
        @InjectRepository(AssessmentHistory) private assessmentHistoryRepo: Repository<AssessmentHistory>,
        @InjectRepository(AssessmentDetail) private assessmentRepo: Repository<AssessmentDetail>,
        @InjectRepository(SourceV1) private sourceV1Repo: Repository<SourceV1>,
        @InjectRepository(ApplicationControlMapping) private appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(AppUser) private appUserRepo: Repository<AppUser>,


    ) { }

    async applications(userInfo: CurrentUser): Promise<App[]> {
        const { userId, role_id } = userInfo;
        // Support both customerId and tenant_id (for impersonation compatibility)
        const customerId = userInfo.customerId || userInfo.tenant_id;
        
        if (!customerId) {
            throw new Error('customerId or tenant_id is required');
        }

        if (this.isOrgAdmin(role_id)) {
            return this.appRepo.createQueryBuilder("app")
                .select(["app.id", "app.name", "app.desc", "app.url", "app.tags", "app.created_at", "app.updated_at"])
                .leftJoin(AppStandard, "appStandard", "appStandard.app_id = app.id")
                .leftJoinAndMapMany("app.standards", "standard", "standard", "standard.id = appStandard.standard_id")
                .leftJoinAndMapOne("standard.framework", "standard.framework", "framework")
                .where("app.customer_id = :customerId", { customerId })
                .andWhere("app.deleted_at IS NULL")
                .getMany();
        }

        return this.appRepo.createQueryBuilder("app")
            .select(["app.id", "app.name", "app.desc", "app.url", "app.tags", "appUser.role", "app.created_at", "app.updated_at"])
            .innerJoinAndMapOne("app.appUser", "app_users", "appUser", "appUser.app_id = app.id")
            .leftJoin(AppStandard, "appStandard", "appStandard.app_id = app.id")
            .leftJoinAndMapMany("app.standards", "standard", "standard", "standard.id = appStandard.standard_id")
            .leftJoinAndMapOne("standard.framework", "standard.framework", "framework")
            .where("appUser.user_id = :userId", { userId })
            .andWhere("app.deleted_at IS NULL")
            .getMany();
    }

    async applicationDetail(userInfo: { userId: string, tenantId: string }, appId: number): Promise<App> {
        const app: App = await this.appRepo.createQueryBuilder("app")
            // join with app_users and users table to get user name, email and role
            .leftJoinAndSelect("app.appUsers", "appUser")
            .addSelect("appUser.role")
            .leftJoinAndSelect("appUser.user", "user")
            .addSelect("user.email, user.name")
    
            // JOIN with appStandard and standard tables to get standards id and name
            .leftJoin(AppStandard, "appStandard", "appStandard.app_id = app.id")
            .leftJoinAndMapMany("app.standards", "standard", "standard", "standard.id = appStandard.standard_id")
    
            // JOIN with framework table to get framework data
            .leftJoinAndMapOne("standard.framework", "standard.framework", "framework")
    
            .where("app.id = :appId", { appId })
            .andWhere("app.customer_id = :tenantId", { tenantId: userInfo.tenantId })
            .andWhere("app.deleted_at IS NULL")
            .getOne();
    
        if (!app) {
            throw new NotFoundException(`Application with ID ${appId} not found.`);
        }
    
        return app;
    }

    async applicationSummary(userInfo: CurrentUser): Promise<any[]> {
        // Support both customerId and tenant_id (for impersonation compatibility)
        const customerId = userInfo.customerId || userInfo.tenant_id;
        
        if (!customerId) {
            throw new Error('customerId or tenant_id is required');
        }

        const apps = await this.applications(userInfo);

        if (apps.length === 0) {
            return [];
        }

        //check if we are using assessment data
        const lastAssessmentChanges = await this.fetchLastAssessmentChanges(apps);
        const lastSourceChanges = await this.fetchLastSourceChanges(apps);
        const {standardsData, familyData} = await this.fetchComplianceData(apps, customerId);

        // Map the data to each application
        return apps.map(app => ({
            ...app,
            lastAssessmentChange: lastAssessmentChanges[app.id] || null,
            lastSourceChange: lastSourceChanges[app.id] || null,
            standards: standardsData.filter(standard => standard.appId === app.id) || [],
            controlFamilies: familyData.filter(family => family.appId === app.id) || [],
        }));
    }

    private async fetchLastAssessmentChanges(apps: App[]): Promise<Record<number, { updated_at: Date; updated_by: { id: string; name: string } | null }>> {
        const appIds = apps.map(app => app.id);

        const assessmentChanges = await this.assessmentHistoryRepo.find({
            where: { app_id: In(appIds) },
            select: ["app_id", "created_on", "created_by"],
            order: { created_on: "DESC" },
            relations: ["created_by_user"],
        });

        const assessmentMap = assessmentChanges.reduce((map, change) => {
            if (!map[change.app_id]) {
                map[change.app_id] = {
                    updated_at: change.created_on,
                    updated_by: change.created_by_user ? { id: change.created_by_user.id, name: change.created_by_user.name } : null,
                };
            }
            return map;
        }, {} as Record<number, { updated_at: Date; updated_by: { id: string; name: string } | null }>);

        // Find apps missing assessment history changes
        const missingAppIds = appIds.filter(appId => !assessmentMap[appId]);

        if (missingAppIds.length > 0) {
            // Fetch fallback data for apps missing assessment history
            const fallbackAssessments = await this.assessmentRepo.find({
                where: { app_id: In(missingAppIds) },
                select: ["id", "updated_on", "updated_by", "updated_by_user"],
                relations: ["updated_by_user"],
            });

            fallbackAssessments.forEach(fallback => {
                assessmentMap[fallback.id] = {
                    updated_at: fallback.updated_on,
                    updated_by: fallback.updated_by_user ? { id: fallback.updated_by_user.id, name: fallback.updated_by_user.name } : null,
                };
            });
        }
        return assessmentMap;
    }


    private async fetchLastSourceChanges(apps: App[]): Promise<Record<number, { updated_at: Date, source_total: number, updated_by: { id: string, name: string } }>> {
        const result: Record<number, { updated_at: Date, source_total: number, updated_by: { id: string, name: string } }> = {};
        for (const app of apps) {
            const [sources, total]: [SourceV1[], number] = await this.sourceV1Repo.findAndCount({
                where: { app_id: app.id, is_available: true },
                relations: ['updated_by_user'],
                take: 1,
                order: { updated_at: 'desc' },
            });

            if (sources.length > 0) {
                result[app.id] = {
                    updated_at: sources[0].updated_at,
                    source_total: total,
                    updated_by: sources[0].updated_by_user ? { id: sources[0].updated_by_user.id, name: sources[0].updated_by_user.name } : null,
                };
            }
        }

        return result;
    }

    private async fetchComplianceData(apps: App[], customer_id: string): Promise<{ standardsData: StandardSummaryResponse[], familyData: ControlFamilySummaryResponse[] }> {

        const standardsData: StandardSummaryResponse[] = await this.getStandardData(apps.map(app => app.id));
        const familyData: ControlFamilySummaryResponse[] = await this.getFamilyData(apps.map(app => app.id));


        return {
            standardsData,  familyData
        };
    }


    private isOrgAdmin(role_id: string): boolean {
        return UserRoles.getInternalRoles().concat(UserRole.OrgAdmin).includes(parseInt(role_id))
    }

    async getFamilyData(appIds: number[]): Promise<ControlFamilySummaryResponse[]> {
        const ids = appIds.join(',');
        const query = `
            SELECT app_id, tile, SUM(num) AS num, SUM(deno) AS deno
            FROM (
                SELECT 
                    acmv.num,
                    acmv.deno,
                    acmv.app_id,
                    SPLIT_PART(c2.control_name, '-', 1) AS tile
                FROM application_control_mapping_view acmv
                JOIN control c1 ON acmv.control_id = c1.id
                LEFT JOIN control c2 ON c1.family_name = c2.family_name
                WHERE acmv.app_id IN (${ids}) AND c2.order_index IS NOT NULL
            ) x
            WHERE deno > 0
            GROUP BY app_id, tile;
        `;
    
        // Use parameterized query with the array of IDs
        const result = await this.appControlRepo.query(query);
    
        const familyData = result.map((r: any) => {
            return new ControlFamilySummaryResponse(r);
        });
    
        return familyData;
    }
    
    async getStandardData(appIds: number[]): Promise<StandardSummaryResponse[]> {
        const ids = appIds.join(',');
        const query = `
            SELECT app_id, standard_id, SUM(num) AS num, SUM(deno) AS deno, st.name 
            FROM (
                SELECT 
                    num,
                    deno,
                    acmv.standard_id, acmv.app_id
                FROM application_control_mapping_view acmv
                WHERE acmv.app_id IN (${ids})
            ) x
            LEFT JOIN standard st ON x.standard_id = st.id
            WHERE deno > 0 AND x.standard_id IS NOT NULL
            GROUP BY app_id, standard_id, st.name;
        `;
    
        // Use parameterized query with the array of IDs
        const result = await this.appControlRepo.query(query);
    
        const standardData = result.map((r: any) => {
            return new StandardSummaryResponse(r);
        });
    
        return standardData;
    }

    async checkLockOnApp(userData: UserData, appId: number): Promise<boolean> {

        const customerId = userData['customerId'];

        const app = await this.appRepo.findOne({ where: { id: appId, customer_id: customerId} });

        if (!app) {
            throw new NotFoundException(`Application with ID ${appId} not found.`);
        }

        return app.is_locked
    }

   async applicationsForAuditors(userInfo: any): Promise<App[]> {
        const { userId, role_id } = userInfo;
        const appUsers = await this.appUserRepo.find({ where: { user_id: userId, role: role_id } });

        const appIds = appUsers.map(appUser => appUser.app_id)? appUsers.map(appUser => appUser.app_id): [];

        if (appIds.length === 0) {
            return [];
        }

        const appData = this.appRepo.createQueryBuilder("app")
            .select(["app.id", "app.name", "app.desc", "app.url", "app.tags", "app.created_at", "app.updated_at"])
            .leftJoin(AppStandard, "appStandard", "appStandard.app_id = app.id")
            .leftJoinAndMapMany("app.standards", "standard", "standard", "standard.id = appStandard.standard_id")
            .leftJoinAndMapOne("standard.framework", "standard.framework", "framework")
            .where("app.id IN (:...appIds)", { appIds })
            .andWhere("app.deleted_at IS NULL")
            .getMany();

            return appData? appData: [];
    }
}
