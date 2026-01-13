import { is } from "cheerio/dist/commonjs/api/traversing";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Customer } from "src/entities/customer.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { EntityType, TemplateType } from "src/entities/template.entity";

export class UpdateCustomerTemplateLogoRequest {
    @IsString()
    @IsNotEmpty()
    logo: string;
}

export class TemplateResponse {
    id: number;
    name: string;
    licenseTypeId: number;
    licenseType: string;
    isPublished: boolean;
    isEditable: boolean;
    isDefault: boolean;
    standards: StandardDto[];
    customers: CustomerDto[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    location: string;
    type: string;
    llm_enabled: boolean;
    entity_type: EntityType;

    constructor(id: number, name: string, license_type_id: number, license_type: string, is_published: boolean, is_editable: boolean, is_default: boolean, standards: Standard[], customers: Customer[], created_by: string, updated_by: string, uploadDate: Date, updateDate: Date, location: string, type: string, llm_enabled: boolean, entity_type: EntityType) {
        this.id = id;
        this.name = name;
        this.licenseTypeId = license_type_id;
        this.licenseType = license_type;
        this.isPublished = is_published;
        this.isEditable = is_editable;
        this.isDefault = is_default;
        this.standards = standards.map(standard => new StandardDto(standard.name, standard.id));
        this.customers = customers.map(customer => new CustomerDto(customer.organization_name, customer.id));
        this.createdBy = created_by;
        this.updatedBy = updated_by;
        this.createdAt = uploadDate;
        this.updatedAt = updateDate;
        this.location = location;
        this.type = type;
        this.llm_enabled = llm_enabled;
        this.entity_type = entity_type;
    }
}

export class StandardDto {
    name: string;
    id: number;

    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }
}

export class CustomerDto {
    organization_name: string;
    id: string;

    constructor(name: string, id: string) {
        this.organization_name = name;
        this.id = id;
    }
}

export class TemplateDetailsResponse {
    id: number;
    name: string;
    licenseTypeId: number;
    licenseType: string;
    isPublished: boolean;
    isEditable: boolean;
    isDefault: boolean;
    standards: StandardDto[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    outline: any;
    location: string;
    type: string;
    llm_enabled: boolean;
    entity_type: EntityType;

    constructor(id: number, name: string, license_type_id: number, license_type: string, is_published: boolean, is_editable: boolean, is_default: boolean, standards: Standard[], created_by: string, updated_by: string, uploadDate: Date, updateDate: Date, outline: any, location: string, type: string, llm_enabled: boolean, entity_type: EntityType) {
        this.id = id;
        this.name = name;
        this.licenseTypeId = license_type_id;
        this.licenseType = license_type;
        this.isPublished = is_published;
        this.isEditable = is_editable;
        this.isDefault = is_default;
        this.standards = standards.map(standard => new StandardDto(standard.name, standard.id));
        this.createdBy = created_by;
        this.updatedBy = updated_by;
        this.createdAt = uploadDate;
        this.updatedAt = updateDate;
        this.outline = outline;
        this.location = location;
        this.type = type;
        this.llm_enabled = llm_enabled;
        this.entity_type = entity_type;
    }
}

export class CreateTemplateRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsNotEmpty()
    standards: number[];

    @IsNotEmpty()
    licenseTypeId: number;

    @IsOptional()
    @IsArray()
    customer_ids: string[];

    @IsNotEmpty()
    @IsBoolean()
    llm_enabled: boolean;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    entity_type: EntityType;
}

export class CloneTemplateRequest {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class UpdateTemplateRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsOptional()
    standards: number[];

    @IsArray()
    @IsOptional()
    customer_ids: string[];

    @IsNotEmpty()
    @IsNumber()
    licenseTypeId: number;

    @IsOptional()
    outline: any;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;

    @IsString()
    @IsOptional()
    @IsIn([TemplateType.EXCEL, TemplateType.WORD, TemplateType.CSV])
    type: TemplateType;

    @IsBoolean()
    @IsNotEmpty()
    llm_enabled: boolean;

    @IsNotEmpty()
    @IsString()
    entity_type: EntityType;
}

export class UploadTemplateRequest {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsOptional()
    standards: number[];

    @IsArray()
    @IsOptional()
    customer_ids: string[];

    @IsNotEmpty()
    @IsNumber()
    licenseTypeId: number;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;

    @IsString()
    @IsNotEmpty()
    @IsIn([TemplateType.EXCEL, TemplateType.WORD, TemplateType.CSV])
    type: TemplateType;

    @IsBoolean()
    @IsNotEmpty()
    llm_enabled: boolean;

    @IsNotEmpty()
    @IsString()
    entity_type: EntityType;
}

export class PatchTemplateRequest {
    @IsString()
    @IsOptional()
    name: string;

    @IsArray()
    @IsOptional()
    standards: number[];

    @IsArray()
    @IsOptional()
    customer_ids: string[];

    @IsOptional()
    @IsNumber()
    licenseTypeId: number;

    @IsOptional()
    outline: any;

    @IsBoolean()
    @IsOptional()
    isPublished: boolean;

    @IsString()
    @IsOptional()
    @IsIn([TemplateType.EXCEL, TemplateType.WORD, TemplateType.CSV])
    type: TemplateType;

    @IsBoolean()
    @IsOptional()
    llm_enabled: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PatchTemplateSectionsRequest)
    sections: PatchTemplateSectionsRequest[];

    @IsOptional()
    @IsString()
    entity_type: EntityType;

}

export class PatchTemplateSectionsRequest {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    html_content: string;
    
    @IsNumber()
    @IsOptional()
    parent_id: number;

    @IsString()
    @IsOptional()
    type: string;

    @IsBoolean()
    @IsOptional()
    is_looped: boolean;

    @IsBoolean()
    @IsOptional()
    is_active: boolean;
}

export class UpdateTemplateSectionRequest {

    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    section_id: string;

    @IsString()
    @IsOptional()
    html_content: string;

    @IsNumber()
    @IsOptional()
    parent_id: number;

    @IsString()
    @IsOptional()
    type: string;

    @IsBoolean()
    @IsOptional()
    is_looped: boolean;

    @IsBoolean()
    @IsOptional()
    is_active: boolean;
    
}

export class CreateTemplateSectionRequest {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsOptional()
    parent_id: number;
}

export class UpdateTemplateSectionsRequest {
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => UpdateTemplateSectionRequest)
    sections: UpdateTemplateSectionRequest[];
}

export class TemplateSectionResponse {
    id: number;
    title: string;
    section_id: string;
    html_content: string;
    is_active: boolean;
    type: string;
    parent_id: number;
    is_looped: boolean;

    constructor(id: number, title: string, section_id: string, html_content: string, is_active: boolean, type: string, parent_id: number, is_looped: boolean) {
        this.id = id;
        this.title = title;
        this.section_id = section_id;
        this.html_content = html_content;
        this.is_active = is_active;
        this.type = type;
        this.parent_id = parent_id;
        this.is_looped = is_looped;
    }

}



