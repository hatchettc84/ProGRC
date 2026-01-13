import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { EntityNotFoundError, In, IsNull, Not, Repository, UpdateResult } from "typeorm";
import { CloneTemplateRequest, CreateTemplateRequest, CreateTemplateSectionRequest, PatchTemplateRequest, TemplateDetailsResponse, TemplateResponse, TemplateSectionResponse, UpdateTemplateRequest, UpdateTemplateSectionsRequest, UploadTemplateRequest } from "../template.dto";
import { EntityType, Templates, TemplateType } from "src/entities/template.entity";
import { TemplateSection, TemplateSectionType } from "src/entities/templatesSection.entity";
import { TemplateVariable } from "src/entities/templateVariable.entity";
import { TemplateVariableGroup } from "src/entities/templateVariableGroup.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { v4 as uuidv4 } from "uuid";
import { Customer } from "src/entities/customer.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LoggerService } from "src/logger/logger.service";
import { User } from "src/entities/user.entity";
import { TemplatePolicyService } from "./templatePolicy.service";
import { FileDownloadService } from "src/app/fileDownload.service";

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(OrganizationTemplate) private readonly orgTemplateRepo: Repository<OrganizationTemplate>,
        @InjectRepository(Templates) private readonly templateRepo: Repository<Templates>,
        @InjectRepository(TemplateSection) private readonly templateSectionRepo: Repository<TemplateSection>,
        @InjectRepository(TemplateVariable) private readonly templateVariableRepo: Repository<TemplateVariable>,
        @InjectRepository(TemplateVariableGroup) private readonly templateVariableGroupRepo: Repository<TemplateVariableGroup>,
        @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(LicenseType) private readonly licenseTypeRepo: Repository<LicenseType>,
        private readonly logger: LoggerService,
        private readonly templatePolicy: TemplatePolicyService,
        private readonly fileDownloadService: FileDownloadService,
    ) { }

    async updateLogoForTemplate(userInfo: { customerId: string }, templateId: number, logoPath: string) {
        const updateResult: UpdateResult = await this.orgTemplateRepo.update(
            { customer_id: userInfo.customerId, template_id: templateId },
            { logo_path: logoPath, updated_at: new Date() }
        )

        if (updateResult.affected === 0) {
            throw new EntityNotFoundError(OrganizationTemplate, 'Template not found');
        }
    }

    async listTemplates(userInfo: { customerId: string }, entityType: string): Promise<TemplateResponse[]> {
        const validEntityTypes = Object.values(EntityType);
        const whereClause = { is_available: true };
        if (entityType) {
            if (!validEntityTypes.includes(entityType as EntityType)) {
                throw new BadRequestException('Invalid entity type');
            } else {
                whereClause['entity_type'] = entityType as EntityType;
            }
        }

        const templates: Templates[] = await this.templateRepo.find({ where: whereClause, relations: ['license_type', 'createdByUser', 'updatedByUser'] });
        const templateResponses: TemplateResponse[] = [];
        for (const template of templates) {
            const standards = template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [];
            const customers = template.customer_ids && template.customer_ids.length ? await this.customerRepo.find({ where: { id: In(template.customer_ids) } }) : [];
            templateResponses.push(new TemplateResponse(
                template.id,
                template.name,
                template.license_type_id,
                template?.license_type?.name || "",
                template.is_published,
                template.is_editable,
                template.is_default,
                standards,
                customers,
                template.createdByUser?.email || "",
                template.updatedByUser?.email || "",
                template.uploadDate,
                template.updateDate,
                template.location,
                template.type,
                template.llm_enabled,
                template.entity_type
            ));
        }
        return templateResponses;
    }

    async createTemplate(userInfo: { userId: string }, template: CreateTemplateRequest): Promise<TemplateDetailsResponse> {

        const newTemplate = await this.templateRepo.manager.transaction(async transactionalEntityManager => {
            try {
                const newTemplate: Templates = await transactionalEntityManager.save(Templates, {
                    name: template.name,
                    standard_ids: template.standards || [],
                    customer_ids: template.customer_ids || [],
                    is_editable: true,
                    is_default: false,
                    is_published: false,
                    is_available: true,
                    license_type_id: template.licenseTypeId,
                    created_by: userInfo.userId,
                    updated_by: userInfo.userId,
                    uploadDate: new Date(),
                    updateDate: new Date(),
                    type: TemplateType.WORD,
                    entity_type: template.entity_type,
                });

                // Create 3 new template sections copied from the default template where template_id = 5 and parent_id != null
                const defaultSections = await this.templateSectionRepo.find({ where: { template_id: 5 }, order: { id: 'ASC' } });

                // filter all sections from defaultSections instead of first 2
                const clonableSections = defaultSections.splice(2);

                // Create a map to store the old parent_id to new parent_id mapping
                await this.cloneSectionsAndGenerateOutline(clonableSections, newTemplate, userInfo, transactionalEntityManager);

                return newTemplate;
            } catch (error) {
                this.logger.error(`Create template failed : ${JSON.stringify(template)}. Transaction failed, rolling back`, error);
                return null;
            }
        });
        if (!newTemplate) {
            throw new InternalServerErrorException('Failed to create template');
        } else {
            const license_type = await this.licenseTypeRepo.findOne({ where: { id: newTemplate.license_type_id } });
            const user = await this.userRepo.findOne({ where: { id: newTemplate.created_by } });
            return new TemplateDetailsResponse(
                newTemplate.id,
                newTemplate.name,
                newTemplate.license_type_id,
                license_type?.name || "",
                newTemplate.is_published,
                newTemplate.is_editable,
                newTemplate.is_default,
                newTemplate.standard_ids.length ? await this.standardRepo.find({ where: { id: In(newTemplate.standard_ids) } }) : [],
                user?.email || "",
                user?.email || "",
                newTemplate.uploadDate,
                newTemplate.updateDate,
                newTemplate.outline,
                newTemplate.location,
                newTemplate.type,
                newTemplate.llm_enabled,
                newTemplate.entity_type
            );
        }
    }

    private async cloneSectionsAndGenerateOutline(clonableSections: TemplateSection[], newTemplate: Templates, userInfo: { userId: string; }, transactionalEntityManager) {
        const parentIdMap = new Map<number, number>();

        // Clone the sections
        const clonedSections = [];
        for (const section of clonableSections) {
            const newSection = {
                ...section, section_id: uuidv4(),
                template_id: newTemplate.id,
                created_by: userInfo.userId,
                updated_by: userInfo.userId,
                created_at: new Date(),
                updated_at: new Date()
            };
            delete newSection.id;

            // If the section has a parent_id, update it with the new parent_id
            if (section.parent_id) {
                newSection.parent_id = parentIdMap.get(section.parent_id);
            }

            // Save the new section to the database and store the new id in the map
            const savedSection = await transactionalEntityManager.save(TemplateSection, newSection);
            parentIdMap.set(section.id, savedSection.id);

            clonedSections.push(savedSection);
        }

        // Function to build the outline recursively using reduce
        const buildOutline = (sections, parentId = null, level = 0, searchKey = '') => {
            return sections
                .filter(section => section.parent_id === parentId)
                .map((section, index) => {
                    const currentSearchKey = parentId ? `${searchKey}_${index}` : `${index}`;
                    const children = buildOutline(sections, section.id, level + 1, currentSearchKey);
                    return {
                        section_id: section.section_id,
                        children: children,
                        level: level,
                        search_key: currentSearchKey,
                        version: 0
                    };
                });
        };

        // Generate the outline for the template
        const outline = buildOutline(clonedSections);

        newTemplate.outline = outline;
        await transactionalEntityManager.save(Templates, newTemplate);

    }

    async cloneTemplate(userInfo: { userId: string }, templateId: number, templateRequest: CloneTemplateRequest): Promise<TemplateDetailsResponse> {

        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });

        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }

        if (!template.is_editable && !template.is_default) {
            throw new BadRequestException('Template is not editable');
        }

        const clonedTemplate = await this.templateRepo.manager.transaction(async transactionalEntityManager => {
            try {
                const clonedTemplate: Templates = await transactionalEntityManager.save(Templates, {
                    ...template,
                    name: templateRequest.name,
                    id: undefined,
                    created_by: userInfo.userId,
                    updated_by: userInfo.userId,
                    uploadDate: new Date(),
                    updateDate: new Date(),
                    is_editable: true,
                    is_default: false,
                    is_published: false,
                    is_available: true,
                });

                // Clone the sections
                const clonableSections = await this.templateSectionRepo.find({ where: { template_id: templateId }, order: { id: 'ASC' } });

                await this.cloneSectionsAndGenerateOutline(clonableSections, clonedTemplate, userInfo, transactionalEntityManager);

                return clonedTemplate;
            } catch (error) {
                this.logger.error(`Cloning template with id : ${templateId} failed. Transaction failed, rolling back`, error);
                return null;
            }

        });

        if (!clonedTemplate) {
            throw new InternalServerErrorException('Failed to clone template');
        }

        const license_type = await this.licenseTypeRepo.findOne({ where: { id: clonedTemplate.license_type_id } });
        const user = await this.userRepo.findOne({ where: { id: clonedTemplate.created_by } });

        return new TemplateDetailsResponse(
            clonedTemplate.id,
            clonedTemplate.name,
            clonedTemplate.license_type_id,
            license_type?.name || "",
            clonedTemplate.is_published,
            clonedTemplate.is_editable,
            clonedTemplate.is_default,
            clonedTemplate.standard_ids.length ? await this.standardRepo.find({ where: { id: In(clonedTemplate.standard_ids) } }) : [],
            user?.email || "",
            user?.email || "",
            clonedTemplate.uploadDate,
            clonedTemplate.updateDate,
            clonedTemplate.outline,
            clonedTemplate.location,
            clonedTemplate.type,
            clonedTemplate.llm_enabled,
            clonedTemplate.entity_type
        );
    }

    async getTemplateById(templateId: number): Promise<TemplateDetailsResponse> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId }, relations: ['createdByUser', 'updatedByUser'] });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        const license_type = await this.licenseTypeRepo.findOne({ where: { id: template.license_type_id } });

        return new TemplateDetailsResponse(
            template.id,
            template.name,
            template.license_type_id,
            license_type?.name || "",
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.outline,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );
    }

    async updateTemplate(userInfo: { userId: string }, templateId: number, templateRequest: UpdateTemplateRequest): Promise<TemplateDetailsResponse> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId }, relations: ['createdByUser', 'updatedByUser'] });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        if (templateRequest.standards) {
            // check standard Ids exist
            const standards = await this.standardRepo.find({ where: { id: In(templateRequest.standards) } });
            if (standards.length !== templateRequest.standards.length) {
                throw new BadRequestException('Invalid standard Ids');
            }
        }

        if (templateRequest.customer_ids) {
            // check customer Ids exist
            const customers = await this.customerRepo.find({ where: { id: In(templateRequest.customer_ids) } });
            if (customers.length !== templateRequest.customer_ids.length) {
                throw new BadRequestException('Invalid customer Ids');
            }
        }

        template.name = templateRequest.name;
        if (templateRequest.standards) {
            template.standard_ids = templateRequest.standards;
        }
        if (templateRequest.customer_ids) {
            template.customer_ids = templateRequest.customer_ids;
        }
        const license_type = await this.licenseTypeRepo.findOne({ where: { id: template.license_type_id } });
        if (!license_type) {
            throw new EntityNotFoundError(LicenseType, 'License type not found');
        }
        template.license_type_id = templateRequest.licenseTypeId;
        template.updated_by = userInfo.userId;
        template.updateDate = new Date();
        template.type = templateRequest.type;
        template.llm_enabled = templateRequest.llm_enabled;
        if (templateRequest.outline) {
            template.outline = templateRequest.outline;
        }
        template.is_published = templateRequest.isPublished;

        await this.templateRepo.save(template);

        return new TemplateDetailsResponse(
            template.id,
            template.name,
            template.license_type_id,
            license_type?.name || "",
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.outline,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );
    }

    async patchTemplate(userInfo: { userId: string }, templateId: number, templateRequest: PatchTemplateRequest): Promise<TemplateDetailsResponse> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId }, relations: ['createdByUser', 'updatedByUser'] });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        if (templateRequest.standards) {
            // check standard Ids exist
            const standards = await this.standardRepo.find({ where: { id: In(templateRequest.standards) } });
            if (standards.length !== templateRequest.standards.length) {
                throw new BadRequestException('Invalid standard Ids');
            }
        }

        if (templateRequest.customer_ids) {
            // check customer Ids exist
            const customers = await this.customerRepo.find({ where: { id: In(templateRequest.customer_ids) } });
            if (customers.length !== templateRequest.customer_ids.length) {
                throw new BadRequestException('Invalid customer Ids');
            }
        }

        if (templateRequest.name) {
            template.name = templateRequest.name;
        }

        if (templateRequest.standards) {
            template.standard_ids = templateRequest.standards;
        }
        if (templateRequest.customer_ids) {
            template.customer_ids = templateRequest.customer_ids;
        }
        const license_type = await this.licenseTypeRepo.findOne({ where: { id: (templateRequest.licenseTypeId || template.license_type_id) } });
        if (templateRequest.licenseTypeId) {
            if (!license_type) {
                throw new EntityNotFoundError(LicenseType, 'License type not found');
            }
            template.license_type_id = templateRequest.licenseTypeId;
        } else {

        }
        template.updated_by = userInfo.userId;
        template.updateDate = new Date();
        if (templateRequest.outline) {
            template.outline = templateRequest.outline;
        }
        if (templateRequest.isPublished !== undefined || templateRequest.isPublished !== null) {
            template.is_published = templateRequest.isPublished;
        }
        if (templateRequest.type) {
            template.type = templateRequest.type;
        }
        if (templateRequest.llm_enabled !== undefined || templateRequest.llm_enabled !== null) {
            template.llm_enabled = templateRequest.llm_enabled;
        }

        await this.templateSectionRepo.manager.transaction(async transactionalEntityManager => {
            try {
                // await this.templateRepo.save(template);
                await transactionalEntityManager.save(Templates, template);
                if (templateRequest.sections) {

                    for (const updatedSection of templateRequest.sections) {
                        const section = await this.templateSectionRepo.findOne({ where: { id: updatedSection.id } });
                        if (!section) {
                            this.logger.error(`Section with id ${updatedSection.id} not found`);
                            throw new EntityNotFoundError(TemplateSection, `Section with id ${updatedSection.id} not found`);
                        }

                        if (updatedSection.title) {
                            section.title = updatedSection.title;
                        }
    
                        if (updatedSection.is_active !== undefined || updatedSection.is_active !== null) {
                            section.is_active = updatedSection.is_active;
                        }
    
                        if (updatedSection.is_looped !== undefined || updatedSection.is_looped !== null) {
                            section.is_looped = updatedSection.is_looped;
                        }
    
                        if (updatedSection.type) {
                            section.type = updatedSection.type as TemplateSectionType;
                        }
    
                        if (updatedSection.html_content) {
                            section.html_content = updatedSection.html_content;
                        }
    
                        section.updated_by = userInfo.userId;
                        section.updated_at = new Date();
                        if (updatedSection.parent_id && updatedSection.parent_id !== section.parent_id) {
                            section.parent_id = updatedSection.parent_id;
                        } else if (updatedSection.parent_id === 0) {
                            section.parent_id = null;
                        }
                        if (updatedSection.type && updatedSection.type !== section.type) {
                            section.type = updatedSection.type as TemplateSectionType;
                        }

                        await transactionalEntityManager.save(TemplateSection, section);

                    }

                    template.updateDate = new Date();
                    template.updated_by = userInfo.userId;
                    await transactionalEntityManager.save(Templates, template);
                }
            } catch (error) {
                this.logger.error('Transaction failed, rolling back', error);
                throw new InternalServerErrorException('Failed to update template');
            }

        });

        return new TemplateDetailsResponse(
            template.id,
            template.name,
            template.license_type_id,
            license_type?.name || "",
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.outline,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );
    }

    async deleteTemplate(templateId: number): Promise<void> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        if (!template.is_editable) {
            throw new BadRequestException('Template cannot be deleted');
        }
        await this.templateSectionRepo.delete({ template_id: templateId });
        await this.templateRepo.delete({ id: templateId });
    }

    async createSection(userInfo: { userId: string }, templateId: number, section: CreateTemplateSectionRequest): Promise<TemplateSectionResponse> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }

        if (!template.is_editable) {
            throw new BadRequestException('Template is not editable');
        }
        const addedTemplateSection = await this.templateSectionRepo.manager.transaction(async transactionalEntityManager => {
            try {
                const parentSection = await transactionalEntityManager.findOne(TemplateSection, { where: { id: section.parent_id } });
                if (!parentSection) {
                    throw new EntityNotFoundError(TemplateSection, 'Parent section not found');
                }
                const newSection = await transactionalEntityManager.save(TemplateSection, {
                    ...section,
                    parent_id: section.parent_id,
                    section_id: uuidv4(),
                    template_id: templateId,
                    created_by: userInfo.userId,
                    updated_by: userInfo.userId,
                    created_at: new Date(),
                    updated_at: new Date()
                });

                const outline = template.outline;

                if (newSection.parent_id) {
                    const addSectionToOutline = (outline: any, parentSectionId: string, newSection: TemplateSection) => {
                        for (const section of outline) {
                            if (section.section_id === parentSectionId) {
                                section.children.push({
                                    section_id: newSection.section_id,
                                    children: [],
                                    level: section.level + 1,
                                    search_key: `${section.search_key}_${section.children.length}`,
                                    version: 0
                                });
                                return true;
                            }
                            if (section.children.length > 0) {
                                const added = addSectionToOutline(section.children, parentSectionId, newSection);
                                if (added) return true;
                            }
                        }
                        return false;
                    };

                    addSectionToOutline(outline, parentSection.section_id, newSection);
                } else {
                    outline.push({
                        section_id: newSection.section_id,
                        children: [],
                        level: 0,
                        search_key: `${outline.length}`,
                        version: 0
                    });
                }


                template.outline = outline;
                await transactionalEntityManager.save(Templates, template);

                return newSection;
            } catch (error) {
                this.logger.error(`Create section failed : ${JSON.stringify(section)}. Transaction failed, rolling back`, error);
                return null;
            }
        });

        if (!addedTemplateSection) {
            throw new InternalServerErrorException('Failed to create section');
        }

        return addedTemplateSection;
    }

    async getSections(templateId: number): Promise<TemplateSectionResponse[]> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        const templateSection: TemplateSection[] = await this.templateSectionRepo.find({ where: { template_id: templateId }, order: { id: 'ASC' } });
        return templateSection.map(section => new TemplateSectionResponse(
            section.id,
            section.title,
            section.section_id,
            section.html_content,
            section.is_active,
            section.type,
            section.parent_id,
            section.is_looped
        ));
    }

    async updateSections(userInfo: { userId: string }, templateId: number, updatedSectionsReq: UpdateTemplateSectionsRequest): Promise<TemplateSectionResponse[]> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }

        if (!template.is_editable) {
            throw new BadRequestException('Template is not editable');
        }


        const updatedSections: TemplateSectionResponse[] = await this.templateSectionRepo.manager.transaction(async transactionalEntityManager => {
            const updatedSections: TemplateSectionResponse[] = [];
            try {
                for (const updatedSection of updatedSectionsReq.sections) {
                    const section = await this.templateSectionRepo.findOne({ where: { id: updatedSection.id } });
                    if (!section) {
                        this.logger.error(`Section with id ${updatedSection.id} not found`);
                        throw new EntityNotFoundError(TemplateSection, `Section with id ${updatedSection.id} not found`);
                    }
                    section.title = updatedSection.title;

                    if (updatedSection.is_active !== undefined || updatedSection.is_active !== null) {
                        section.is_active = updatedSection.is_active;
                    }

                    if (updatedSection.is_looped !== undefined || updatedSection.is_looped !== null) {
                        section.is_looped = updatedSection.is_looped;
                    }

                    if (updatedSection.type) {
                        section.type = updatedSection.type as TemplateSectionType;
                    }

                    if (updatedSection.html_content) {
                        section.html_content = updatedSection.html_content;
                    }

                    section.updated_by = userInfo.userId;
                    section.updated_at = new Date();
                    if (updatedSection.parent_id && updatedSection.parent_id !== section.parent_id) {
                        section.parent_id = updatedSection.parent_id;
                    } else if (updatedSection.parent_id === 0) {
                        section.parent_id = null;
                    }
                    if (updatedSection.type && updatedSection.type !== section.type) {
                        section.type = updatedSection.type as TemplateSectionType;
                    }

                    await transactionalEntityManager.save(TemplateSection, section);

                    updatedSections.push(new TemplateSectionResponse(
                        section.id,
                        section.title,
                        section.section_id,
                        section.html_content,
                        section.is_active,
                        section.type,
                        section.parent_id,
                        section.is_looped
                    ));
                }

                template.updateDate = new Date();
                template.updated_by = userInfo.userId;
                await transactionalEntityManager.save(Templates, template);
            } catch (error) {
                this.logger.error('Transaction failed, rolling back', error);
                return [];
            }
            return updatedSections;
        });

        if (updatedSections.length === 0) {
            throw new InternalServerErrorException('Failed to update sections');
        }


        return updatedSections;
    }

    async getVariables(): Promise<TemplateVariable[]> {
        return this.templateVariableRepo.find();
    }

    async getVariableGroups(): Promise<TemplateVariableGroup[]> {
        return this.templateVariableGroupRepo.find();
    }

    async getStandards(): Promise<Standard[]> {
        return this.standardRepo.find({ select: ["id", "name", "created_at", "updated_at", "active"], where: { active: true } });
    }

    async deleteSection(sectionId: string): Promise<TemplateDetailsResponse> {
        const sectionTobeDeleted: TemplateSection = await this.templateSectionRepo.findOne({ where: { section_id: sectionId } });
        if (!sectionTobeDeleted) {
            throw new EntityNotFoundError(TemplateSection, 'Section not found');
        }
        await this.templatePolicy.canEditTemplate(sectionTobeDeleted.template_id);
        const template = await this.templateSectionRepo.manager.transaction(async transactionalEntityManager => {

            const template: Templates = await transactionalEntityManager.findOne(Templates, { where: { id: sectionTobeDeleted.template_id }, relations: ['license_type', 'createdByUser', 'updatedByUser'] });
            if (template.is_default) {
                throw new BadRequestException('Default template sections cannot be deleted');
            }

            // Get all sections for this template to find children recursively
            const allSections = await transactionalEntityManager.find(TemplateSection, { where: { template_id: sectionTobeDeleted.template_id } });

            // Function to recursively find all child section IDs
            const findAllChildSectionIds = (parentId: number, sections: TemplateSection[]): number[] => {
                const childSectionIds: number[] = [];
                const children = sections.filter(section => section.parent_id === parentId);

                for (const child of children) {
                    childSectionIds.push(child.id);
                    // Recursively find children of this child
                    const grandChildren = findAllChildSectionIds(child.id, sections);
                    childSectionIds.push(...grandChildren);
                }

                return childSectionIds;
            };

            // Find all section IDs to be deleted (the section itself and all its descendants)
            const sectionIdListToDelete = [sectionTobeDeleted.id];
            const childSectionIds = findAllChildSectionIds(sectionTobeDeleted.id, allSections);
            sectionIdListToDelete.push(...childSectionIds);

            const outline = template.outline;
            const updateOutline = (sections, parentId = null) => {
                return sections
                    .filter(section => section.section_id !== sectionId)
                    .map(section => {
                        const children = updateOutline(section.children, section.section_id);
                        return {
                            section_id: section.section_id,
                            children: children,
                            level: section.level,
                            search_key: section.search_key,
                            version: section.version
                        };
                    });
            }

            await transactionalEntityManager.delete(TemplateSection, { id: In(sectionIdListToDelete) });
            template.outline = updateOutline(outline);
            await transactionalEntityManager.save(Templates, template);

            return template;
        });

        if (!template) {
            throw new InternalServerErrorException('Failed to delete section');
        }

        return new TemplateDetailsResponse(
            template.id,
            template.name,
            template.license_type_id,
            template?.license_type?.name,
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.outline,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );
    }

    async uploadTemplate(userInfo: { userId: string }, templateId: number, templateRequest: UploadTemplateRequest): Promise<TemplateResponse> {
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId, is_available: false }, relations: ['license_type', 'createdByUser', 'updatedByUser'] });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        let licenseType: LicenseType;

        licenseType = await this.licenseTypeRepo.findOne({ where: { id: templateRequest.licenseTypeId } });
        if (!licenseType) {
            throw new EntityNotFoundError(LicenseType, 'License type not found');
        }
        template.license_type_id = licenseType.id;

        if (templateRequest.standards) {
            // check if all standards exist
            const standards = await this.standardRepo.find({ where: { id: In(templateRequest.standards) } });
            if (standards.length !== templateRequest.standards.length) {
                throw new EntityNotFoundError(Standard, 'Standard not found');
            }
            template.standard_ids = templateRequest.standards;
        }

        if (templateRequest.customer_ids) {
            // check if all customers exist
            const customers = await this.customerRepo.find({ where: { id: In(templateRequest.customer_ids) } });
            if (customers.length !== templateRequest.customer_ids.length) {
                throw new EntityNotFoundError(Customer, 'Customer not found');
            }
            template.customer_ids = templateRequest.customer_ids;
        }

        template.name = templateRequest.name;
        template.type = templateRequest.type.toString();
        template.llm_enabled = templateRequest.llm_enabled;
        template.location = template.temp_location;
        template.temp_location = null;
        template.is_available = true;
        template.is_default = false;
        template.is_editable = true;
        template.is_published = templateRequest.isPublished;
        template.created_by = userInfo.userId;
        template.updated_by = userInfo.userId;
        template.updateDate = new Date();

        await this.templateRepo.save(template);

        const customers = template.customer_ids && template.customer_ids.length ? await this.customerRepo.find({ where: { id: In(template.customer_ids) } }) : [];

        return new TemplateResponse(
            template.id,
            template.name,
            template.license_type_id,
            licenseType?.name,
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            customers,
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );

    }

    async downloadTemplate(templateId: number): Promise<any> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }

        const downloadUrl = await this.fileDownloadService.generateSignedUrl(
            template.location
        );
        return { downloadUrl, template_id: template.id, name: template.name };

    }

    async updateTemplateFile(userInfo: { userId: string }, templateId: number, templateRequest: any): Promise<TemplateResponse> {
        await this.templatePolicy.canEditTemplate(templateId);
        const template: Templates = await this.templateRepo.findOne({ where: { id: templateId }, relations: ['license_type', 'createdByUser', 'updatedByUser'] });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }

        template.location = template.temp_location;
        template.temp_location = null;
        template.updateDate = new Date();
        template.updated_by = userInfo.userId;
        await this.templateRepo.save(template);

        const customers = template.customer_ids && template.customer_ids.length ? await this.customerRepo.find({ where: { id: In(template.customer_ids) } }) : [];

        return new TemplateResponse(
            template.id,
            template.name,
            template.license_type_id,
            template?.license_type?.name,
            template.is_published,
            template.is_editable,
            template.is_default,
            template.standard_ids && template.standard_ids.length ? await this.standardRepo.find({ where: { id: In(template.standard_ids) } }) : [],
            customers,
            template?.createdByUser?.email || "",
            template?.updatedByUser?.email || "",
            template.uploadDate,
            template.updateDate,
            template.location,
            template.type,
            template.llm_enabled,
            template.entity_type
        );
    }


}
