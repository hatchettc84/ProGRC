import { App } from "src/entities/app.entity";
import { AppUserRole } from "src/entities/appUser.entity";
import { Standard } from "src/entities/standard_v1.entity";

export class ListApplicationResponse {
    id: number;
    name: string;
    desc: string;
    url: string;
    tags: string[];
    role: AppUserRole;
    standards: ApplicationStandardResponse[];
    created_at: Date;
    updated_at: Date;
}

export class ApplicationDetailResponse {
    id: number;
    name: string;
    desc: string;
    url: string;
    tags: string[];
    created_at: Date;
    updated_at: Date;
    created_by_user_id: string;
    members: ApplicationMemberResponse[];
    standards: ApplicationStandardResponse[];
    is_locked: boolean;

    constructor(app: App) {
        this.id = app.id;
        this.name = app.name;
        this.desc = app.desc;
        this.url = app.url;
        this.tags = app.tags;
        this.created_at = app.created_at;
        this.updated_at = app.updated_at;
        this.created_by_user_id = app.created_by;
        this.is_locked = app.is_locked;
        this.members = app.appUsers.map(appUser => new ApplicationMemberResponse(appUser));
        this.standards = app.standards.map(standard => new ApplicationStandardResponse(standard));
        
    }
}

export class ApplicationMemberResponse {
    id: string;
    name: string;
    email: string;
    role: AppUserRole;

    constructor(appUser: any) {
        this.id = appUser.user.id;
        this.name = appUser.user.name;
        this.email = appUser.user.email;
        this.role = appUser.role;
    }
}

export class ApplicationStandardResponse {
    id: number;
    name: string;
    framework_name: string;
    framework_id: number;

    constructor(standard: Standard) {
        this.id = standard.id;
        this.name = standard.name;
        this.framework_id = standard.framework.id;
        this.framework_name = standard.framework.name;

    }
}

export class ApplicationSummaryResponse {
    id: number;
    name: string;
    desc: string;
    url: string;
    tags: string;
    created_at: Date;
    updated_at: Date;
    created_by: {
        id: string;
        name: string;
    };
    standards: StandardSummaryResponse[];
    controlFamilies: ControlFamilySummaryResponse[];
    assessment: AssessmentResponse;
    source: SourceResponse;

    constructor(app: any) {
        this.id = app.id;
        this.name = app.name;
        this.desc = app.desc;
        this.url = app.url;
        this.tags = app.tags;
        this.created_at = app.created_at;
        this.updated_at = app.updated_at;
        this.created_by = app.created_by;
        this.standards = app.standards || [];
        this.controlFamilies = app.controlFamilies || [];
        this.assessment = app.lastAssessmentChange ? new AssessmentResponse(app.lastAssessmentChange) : null;
        this.source = app.lastSourceChange ? new SourceResponse(app.lastSourceChange) : null;
    }
}

export class ComplianceResponse {
    id: number;
    name: string;
    percentage_completion: number;
    control_categories: ComplianceCategoryResponse[];

    constructor(compliance_categories: any, standard: any) {
        this.id = standard.id;
        this.name = standard.name;
        this.percentage_completion = compliance_categories.length > 0 ? Number((compliance_categories.reduce((acc: number, curr: any) => acc + curr.percentage_completion, 0) / compliance_categories.length).toFixed(2)) : 0;
        this.control_categories = compliance_categories.map((category: any) => new ComplianceCategoryResponse(category));
    }
}

export class ComplianceCategoryResponse {
    name: string;
    short_name: string;
    percentage_completion: number;

    constructor(category: any) {
        this.name = category.category_name;
        this.short_name = category.short_name;
        this.percentage_completion = category.percentage_completion;
    }
}

export class AssessmentResponse {
    last_changed_at: Date;
    last_changed_by: {
        id: string;
        name: string;
    };

    constructor(assessment: any) {
        this.last_changed_at = assessment.updated_at;
        this.last_changed_by = {
            id: assessment.updated_by.id || null,
            name: assessment.updated_by.name || null,
        };
    }
}

export class SourceResponse {
    last_changed_at: Date;
    source_total: number;
    last_changed_by: {
        id: string;
        name: string;
    };

    constructor(source: any) {
        this.last_changed_at = source.updated_at;
        this.source_total = source.source_total;
        this.last_changed_by = source.updated_by ? {
            id: source.updated_by.id,
            name: source.updated_by.name,
        } : null;
    }
    
}

export class ComplianceSummaryResponse {

    standards: StandardSummaryResponse[];
    controlFamilies: ControlFamilySummaryResponse[];
}

export class StandardSummaryResponse {
    appId: number;
    id: number;
    name: string;
    percentage_completion: number;

    constructor(standard: any) {
        this.appId = standard.app_id;
        this.id = standard.standard_id;
        this.name = standard.name;
        this.percentage_completion = Number((Number(standard.num)/(Number(standard.deno))).toFixed(2));
    }
}

export class ControlFamilySummaryResponse {
    appId: number;
    id: number;
    short_name: string;
    percentage_completion: number;

    constructor(controlFamily: any) {
        this.appId = controlFamily.app_id;
        this.id = controlFamily.id;
        this.short_name = controlFamily.tile;
        this.percentage_completion = Number((Number(controlFamily.num)/(Number(controlFamily.deno))).toFixed(2));
    }
}

export class FrameworkResponse {
    id: number;
    name: string;
  

    constructor(framework: any) {
        this.id = framework.id;
        this.name = framework.name;
    }
}