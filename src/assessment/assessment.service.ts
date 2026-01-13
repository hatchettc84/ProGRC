import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { version } from 'os';
import { App } from 'src/entities/app.entity';
import { AssessmentDetail } from 'src/entities/assessments/assessmentDetails.entity';
import { AssessmentHistory } from 'src/entities/assessments/assessmentHistory.entity';
import { AssessmentOutline } from 'src/entities/assessments/assessmentOutline.entity';
import { AssessmentSections } from 'src/entities/assessments/assessmentSections.entity';
import { AssessmentSectionsHistory } from 'src/entities/assessments/assessmentSectionsHistory.entity';
import { Customer } from 'src/entities/customer.entity';
import { OrganizationTemplate } from 'src/entities/organizationTemplate.entity';
import { OrganizationStandards } from 'src/entities/orgnizationStandards.entity';
import { EntityType, Templates } from 'src/entities/template.entity';
import { TemplateSection } from 'src/entities/templatesSection.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { AssessmentPolicyService } from './service/assessmentPolicy.service';
import { Standard } from 'src/entities/standard_v1.entity';
import { LoggerService } from 'src/logger/logger.service';
import { FileDownloadService } from 'src/app/fileDownload.service';

@Injectable()
export class AssessmentService {


    constructor(
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(App) private appsRepo: Repository<App>,
        @InjectRepository(OrganizationTemplate) private orgTemplateRepo: Repository<OrganizationTemplate>,
        @InjectRepository(OrganizationStandards) private organizationStandardRepo: Repository<OrganizationStandards>,
        @InjectRepository(Templates) private templateRepo: Repository<Templates>,
        @InjectRepository(AssessmentDetail) private readonly assessmentDetailsRepo: Repository<AssessmentDetail>,
        @InjectRepository(AssessmentOutline) private readonly assessmentOutlineRepo: Repository<AssessmentOutline>,
        @InjectRepository(AssessmentHistory) private readonly assessmentHistoryRepo: Repository<AssessmentHistory>,
        @InjectRepository(AssessmentSections) private readonly assessmentSectionRepo: Repository<AssessmentSections>,
        @InjectRepository(AssessmentSectionsHistory) private readonly assessmentSectionHistoryRepo: Repository<AssessmentSectionsHistory>,
        @InjectRepository(TemplateSection) private readonly templateSectionRepo: Repository<TemplateSection>,
        @InjectRepository(Standard) private standardRepo: Repository<Standard>,



        private readonly dataSource: DataSource,
        private readonly assessmentPolicyService: AssessmentPolicyService,
        private readonly logger: LoggerService,
        private readonly fileDownloadService: FileDownloadService,

    ) { }


    async fetchAssessments(
        userInfo: any,
        queryParam: { assessment_id: number; application_id: number; limit: number; offset: number }
    ): Promise<{
        assessments: Array<AssessmentDetail & { application_name: string; created_by_name: string }>;
        totalCount: number;
    }> {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch user data
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'name'],
        });

        // Fetch app data based on provided application_id
        const app = await this.appsRepo.findOne({
            where: { id: queryParam.application_id },
            select: ['id', 'name'],
        });

        // Fetch assessments data
        const queryBuilder = this.assessmentDetailsRepo
            .createQueryBuilder('assessment')
            .leftJoinAndSelect('assessment.template', 'template')
            .where('assessment.customer_id = :orgId', { orgId })
            .andWhere('assessment.is_deleted = false')
            .select([
                'assessment.id',
                'assessment.title',
                'assessment.app_id',
                'assessment.frameworks',
                'assessment.template_id',
                'assessment.updated_on',
                'assessment.updated_by',
                'assessment.created_on',
                'assessment.created_by',
                'assessment.is_locked',
                'assessment.type',
                'template.id',
                'template.name',
            ])
            .orderBy('assessment.created_on', 'DESC')
            .limit(queryParam.limit)
            .offset(queryParam.offset);

        if (queryParam.assessment_id) {
            queryBuilder.andWhere('assessment.id = :assessment_id', {
                assessment_id: queryParam.assessment_id,
            });
        }

        if (queryParam.application_id) {
            queryBuilder.andWhere('assessment.app_id = :application_id', {
                application_id: queryParam.application_id,
            });
        }

        const [assessments, totalCount] = await queryBuilder.getManyAndCount();

        // Fetch additional data for `application_name` and `created_by_name`
        const applicationIds = assessments.map(a => a.app_id);
        const userIds = assessments.map(a => a.created_by);

        // Fetch app names
        const apps = await this.appsRepo.find({
            where: { id: In(applicationIds) },
            select: ['id', 'name']
        });
        const appMap = new Map(apps.map(a => [a.id, a.name]));

        // Fetch user names
        const users = await this.userRepo.find({
            where: { id: In(userIds) },
            select: ['id', 'name']
        });
        const userMap = new Map(users.map(u => [u.id, u.name]));


        // Map `application_name`, `created_by_name`, and `template_name` to each assessment
        const assessmentsWithNames = assessments.map(assessment => ({
            ...assessment,
            application_name: appMap.get(assessment.app_id) || '',
            created_by_name: userMap.get(assessment.created_by) || '',
            template_name: assessment.template?.name || '',
            status: assessment.is_locked ? 'pending' : 'processed'
        }));

        return {
            assessments: assessmentsWithNames,
            totalCount,
        };
    }

    async getAssessmentDetail(userInfo: any, assessment_id: number): Promise<AssessmentDetail> {
        const orgId = userInfo['tenant_id'];
        const assessment = await this.assessmentDetailsRepo.findOne({ where: { id: assessment_id, customer_id: orgId } });
        if (!assessment) {
            throw new NotFoundException(`Assessment not found for id: ${assessment_id}`);
        }
        
        return assessment;
    }

    async fetchAssessmentsStatusById(
        userInfo: any,
        queryParam: { assessment_id: number; }
    ): Promise<string> {
        const orgId = userInfo['tenant_id'];

        // Verify if the organization exists
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch the `is_locked` status of the assessment
        const assessment = await this.assessmentDetailsRepo
            .createQueryBuilder('assessment')
            .where('assessment.customer_id = :orgId', { orgId })
            .andWhere('assessment.id = :assessment_id', { assessment_id: queryParam.assessment_id })
            .andWhere('assessment.is_deleted = false')
            .select(['assessment.is_locked'])
            .getOne();

        // Determine the status based on `is_locked`
        if (assessment?.is_locked) {
            return 'PENDING';
        }
        return 'PROCESSED';
    }

    async fetchAssessmentsStatus(userInfo: any, queryParam: { assessment_id?: number, limit: number, offset: number }): Promise<[{ id: number; status: string }[], number]> {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Build the query to fetch assessment data
        const queryBuilder = this.assessmentDetailsRepo
            .createQueryBuilder('assessment')
            .where('assessment.customer_id = :orgId', { orgId })
            .andWhere('assessment.is_deleted = false')
            .select([
                'assessment.id',
                'assessment.is_locked',
            ])
            .orderBy('assessment.created_on', 'DESC')
            .limit(queryParam.limit)
            .offset(queryParam.offset);

        if (queryParam.assessment_id) {
            queryBuilder.andWhere('assessment.id = :assessment_id', { assessment_id: queryParam.assessment_id });
        }

        // Execute the query and map results to include only id and status
        const [assessments, total] = await queryBuilder.getManyAndCount();

        const formattedAssessments = assessments.map(assessment => ({
            id: assessment.id,
            status: assessment.is_locked ? "PENDING" : "PROCESSED"
        }));

        return [formattedAssessments, total];
    }


    async getStandardByOrgId(userInfo: any): Promise<Standard[]> {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }


        const orgStandards = await this.organizationStandardRepo
            .createQueryBuilder('organization_standards')
            .select('organization_standards.standard_id', 'standard_id')  // Alias the field to match entity
            .where('organization_standards.customer_id = :orgId', { orgId })
            .getRawMany();

        if (!orgStandards || orgStandards.length === 0) {
            throw new NotFoundException(`No standard found for organization ID: ${orgId}`);
        }

        // Extract the standards_id from the raw result
        const standardIds = orgStandards.map((orgStandard) => orgStandard.standard_id);  // Access using the alias 'standards_id'

        // Fetch all standards matching the extracted IDs
        const standards = await this.standardRepo.findByIds(standardIds);
        return standards;

    }

    async getTemplateByOrgId(userInfo: any, standardId: string, entityType: string): Promise<Templates[]> {
        const orgId = userInfo['tenant_id'];
        const stdId = + standardId;
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const orgTemplates = await this.orgTemplateRepo
            .createQueryBuilder('organization_template')
            .select([
                'organization_template.template_id AS templates_id',
                'organization_template.logo_path',
            ])
            .where('organization_template.customer_id = :orgId', { orgId })
            .distinct(true) // Apply DISTINCT to the entire result set
            .getRawMany();

        if (!orgTemplates || orgTemplates.length === 0) {
            return [];
        }

        // Extract template IDs
        const templateIds = orgTemplates.map((orgTemplate) => orgTemplate.templates_id);

        const whereClause = {
            id: In(templateIds),
            is_published: true,
        };
        if(entityType) {
            whereClause['entity_type'] = entityType as EntityType;
        }

        // Fetch templates by templateIds and the provided standardId
        let templates = await this.templateRepo.find({
            select: ['id', 'name', 'standard_id', 'uploadDate', 'updateDate', 'customer_ids', 'standard_ids'],
            where: whereClause,
        });

        if (stdId) {
            templates = templates.filter(template => {
                if (template.standard_ids && template.standard_ids.length > 0) {
                    return template.standard_ids.includes(stdId);
                }
                return true;
            });
        }

        if (orgId) {
            templates = templates.filter(template => {
                if (template.customer_ids && template.customer_ids.length > 0) {
                    return template.customer_ids.includes(orgId);
                }
                return true;
            });
        }

        if (templates.length === 0) {
            return [];
        }

        const orgTemplateMap = new Map(
            orgTemplates.map(orgTemplate => [orgTemplate.templates_id, orgTemplate.organization_template_logo_path])
        );

        templates.forEach(template => {
            if (orgTemplateMap.has(template.id)) {
                template.customer_logo = orgTemplateMap.get(template.id);
            }
        });

        return templates;
    }



    async delete(userInfo: any, assessmentId: number) {
        const orgId = userInfo['tenant_id'];
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }
        if (!assessmentId) {
            throw new ForbiddenException({
                error: `Invalid assessmentId!`,
                message: `Invalid assessmentId!`,
            });
        }

        await this.assessmentPolicyService.canDeleteAssessment(userInfo, assessmentId);

        const assessmentDtlResult = await this.assessmentDetailsRepo.update({
            id: assessmentId,
            customer_id: orgId,
        }, {
            is_deleted: true,
            updated_on: new Date()
        });

        if (!assessmentDtlResult.affected) {
            throw new NotFoundException({
                error: 'Assessment not found',
                message: 'Assessment not found'
            });
        }

        const assessmentOutlineResult = await this.assessmentOutlineRepo.update({
            id: assessmentId,
            customer_id: orgId,
        }, {
            is_deleted: true,
        });

        const assessmentHistoryResult = await this.assessmentHistoryRepo.update({
            id: assessmentId,
            customer_id: orgId,
        }, {
            is_deleted: true,
        });

        const assessmentSectionResult = await this.assessmentSectionRepo.update({
            id: assessmentId,
            customer_id: orgId,
        }, {
            is_deleted: true,
        });

        const assessmentSectionHistoryResult = await this.assessmentSectionHistoryRepo.update({
            id: assessmentId,
            customer_id: orgId,
        }, {
            is_deleted: true,
        });

    }


    async assessmentOutline(
        userInfo: any,
        data: any
    ) {
        const orgId = userInfo.tenant_id;
        const userId = userInfo.userId;
        const date = new Date();

        const orgExists = await this.customerRepo.exists({ where: { id: orgId } });
        if (!orgExists) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        let { application_id, assessment_id } = data;
        await this.assessmentPolicyService.canCreateOutline(userInfo, application_id);

        const assessmentExists: boolean = await this.assessmentDetailsRepo.exists({
            where: {

                id: assessment_id,
                is_deleted: false,
            }
        })

        if (assessmentExists) {
            throw new BadRequestException({
                error: 'Assessment for this app and template already exists!',
                message: 'Please create a new assessment with a different app and template.',
            });
        }

        try {
            const assessmentInfo = await this.dataSource.transaction(async (manager) => {
                const assessmentOutlineToCreate = this.assessmentOutlineRepo.create({
                    customer_id: orgId,
                    app_id: application_id,
                    assessment_id: application_id,
                    version: 0,
                    created_by: userId,
                    created_on: new Date(),
                });
                const savedAssessmentOutline = await manager.save(assessmentOutlineToCreate);
            });

            return { message: `Assessment created successfully!` };
        } catch (error) {
            this.logger.error('Error when creating assessment:', error);
            this.logger.info(error.body)
            throw new BadRequestException({
                error: error.message,
                message: error.message,
            });
        }
    }

    async fetchAssessmentsOutline(userInfo: any, queryParam: { assessment_id: number, limit: number, offset: number }): Promise<[AssessmentOutline[], number]> {
        const orgId = userInfo['tenant_id'];
        let count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Build query to fetch assessment data
        const queryBuilder = this.assessmentOutlineRepo
            .createQueryBuilder('assessmenOutl')
            .where('assessmenOutl.customer_id = :orgId', { orgId })
            .where('assessmenOutl.assessment_id = :assessment_id', { assessment_id: queryParam.assessment_id })
            .andWhere('assessmenOutl.is_deleted = false')
            .select([
                'assessmenOutl.id',
                'assessmenOutl.application_id',
                'assessmenOutl.assessment_id',
                'assessmenOutl.customer_id',
                'assessmenOutl.updated_on',
                'assessmenOutl.updated_by',
                'assessmenOutl.created_on',
                'assessmenOutl.created_by',
            ])
            .orderBy('assessmenOutl.created_on', 'DESC')
            .limit(queryParam.limit)
            .offset(queryParam.offset);

        // Execute the query and return the results
        return await queryBuilder.getManyAndCount();
    }

    async fetchAssessmentsHistory(userInfo: any, queryParam: { assessment_id: number, limit: number, offset: number }): Promise<[AssessmentHistory[], number]> {
        const orgId = userInfo['tenant_id'];
        let count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Build query to fetch assessment data
        const queryBuilder = this.assessmentHistoryRepo
            .createQueryBuilder('assessmenHistory')
            .where('assessmenHistory.customer_id = :orgId', { orgId })
            .where('assessmenHistory.assessment_id = :assessment_id', { assessment_id: queryParam.assessment_id })
            .andWhere('assessmenHistory.is_deleted = false')
            .select([
                'assessmenHistory.id',
                'assessmenHistory.application_id',
                'assessmenHistory.assessment_id',
                'assessmenHistory.customer_id',
                'assessmenHistory.created_on',
                'assessmenHistory.created_by',
                'assessmenHistory.outline',
                'assessmenHistory.outline_hash'
            ])
            .orderBy('assessmenHistory.created_on', 'DESC')
            .limit(queryParam.limit)
            .offset(queryParam.offset);

        // Execute the query and return the results
        return await queryBuilder.getManyAndCount();
    }

    async fetchAssessmentsSectionHistory(userInfo: any, queryParam: { assessment_id: number, section_id: number, limit: number, offset: number }): Promise<[AssessmentSectionsHistory[], number]> {
        const orgId = userInfo['tenant_id'];
        let count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Build query to fetch assessment data
        const queryBuilder = this.assessmentSectionHistoryRepo
            .createQueryBuilder('assessmenSetionHistory')
            .where('assessmenSetionHistory.customer_id = :orgId', { orgId })
            .where('assessmenSetionHistory.assessment_id = :assessment_id', { assessment_id: queryParam.assessment_id })
            .where('assessmenSetionHistory.section_id = :section_id', { section_id: queryParam.section_id })
            .andWhere('assessmenSetionHistory.is_deleted = false')
            .select([
                'assessmenSetionHistory.id',
                'assessmenSetionHistory.application_id',
                'assessmenSetionHistory.assessment_id',
                'assessmenSetionHistory.customer_id',
                'assessmenSetionHistory.section_id',
                'assessmenSetionHistory.created_on',
                'assessmenSetionHistory.created_by',
                'assessmenSetionHistory.assmntHistoryId'
            ])
            .orderBy('assessmenSetionHistory.created_on', 'DESC')
            .limit(queryParam.limit)
            .offset(queryParam.offset);
        return await queryBuilder.getManyAndCount();
    }


    async fetchAssessmentsSectionHistoryDetails(
        userInfo: any,
        queryParam: { assessment_id: number; limit: number; offset: number }
    ): Promise<{ combinedData: any[], totalCount: number }> {
        const orgId = userInfo['tenant_id'];

        // Verify the organization ID is valid
        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch current assessment details
        const assessmentDetails = await this.assessmentOutlineRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                is_deleted: false
            },
            select: ['id', 'version', 'created_on', 'created_by']
        });

        // Fetch assessment history details
        const assessmentDetailsHistory = await this.assessmentHistoryRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                is_deleted: false
            },
            select: ['id', 'version', 'created_on', 'created_by']
        });

        // Handle the case where no version changes are found
        if (!assessmentDetailsHistory.length && !assessmentDetails.length) {
            return {
                combinedData: [],
                totalCount: 0
            };
        }

        // Combine current details and history
        const combinedOutlineData = [...assessmentDetails, ...assessmentDetailsHistory];

        // Fetch unique user IDs to get user names
        const userIds = [...new Set(combinedOutlineData.map(item => item.created_by))];
        const users = await this.userRepo.findByIds(userIds);
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {});

        // Add user names and filter only necessary fields (userName, created_on, version)
        const combinedDataWithUserNames = combinedOutlineData
            .map(item => ({
                id: item.id,
                userName: userMap[item.created_by] || 'Unknown User',
                created_on: item.created_on,
                version: item.version
            }))
            .sort((a, b) => b.version - a.version || b.created_on.getTime() - a.created_on.getTime());

        // Apply pagination (limit and offset)
        const paginatedData = combinedDataWithUserNames.slice(queryParam.offset, queryParam.offset + queryParam.limit);

        return {
            combinedData: combinedDataWithUserNames,
            totalCount: combinedOutlineData.length
        };
    }


    async updateSection(
        userInfo: any,
        data: any,
        queryParam: { assessment_id: number; section_id: string, version: number }
    ): Promise<AssessmentSections> {
        const orgId = userInfo.tenant_id;
        const userId = userInfo.userId;

        // Validate user info
        if (!orgId || !userId) {
            throw new ForbiddenException({
                error: 'Invalid user information.',
                message: 'Tenant ID or User ID is missing in user info.',
            });
        }

        // Check if the user is linked to any organization
        const orgCount = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgCount) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
        const isLocked = await this.assessmentDetailsRepo.count({
            where: {
                id: queryParam.assessment_id,
                customer_id: orgId,
                is_locked: true
            }
        });

        if (isLocked) {
            throw new ForbiddenException({
                error: 'Assessment is already processing you cannot update it.',
                message: 'Assessment is already processing you cannot update it.',
            });
        }


        // Validate content in the request data
        if (!data?.content) {
            throw new ForbiddenException({
                error: 'Please provide the update content for the section.',
                message: 'Content for section update is missing.',
            });
        }

        const newContentHash = await this.generateMD5Hash(data?.content);

        // Fetch existing assessment sections
        const existingSections = await this.assessmentSectionRepo.find({
            where: {
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                customer_id: orgId,
                is_deleted: false,
            },
        });

        if (existingSections.length === 0) {
            throw new NotFoundException({
                error: 'Section not found.',
                message: `No section found for assessment_id ${queryParam.assessment_id}, section_id ${queryParam.section_id}, and customer_id ${orgId}.`,
            });
        }

        const existingSection = existingSections[0];

        await this.assessmentPolicyService.canUpdateSection(userInfo, existingSection.app_id);

        // Generate content hash if missing
        let contentHash = existingSection.content_hash;
        if (!contentHash) {
            contentHash = await this.generateMD5Hash(existingSection.content);
        }

        if (contentHash === newContentHash) {
            throw new ForbiddenException({
                error: 'Nothing to update.',
                message: 'The provided content is identical to the existing content.',
            });
        }

        // Fetch the existing outline
        const outlineDetail = await this.assessmentOutlineRepo.findOne({
            where: {
                assessment_id: queryParam.assessment_id,
                customer_id: orgId,
                app_id: existingSection.app_id,
            },
        });

        if (!outlineDetail) {
            throw new NotFoundException({
                error: 'Assessment outline not found.',
                message: `No outline found for assessment_id ${queryParam.assessment_id}, customer_id ${orgId}, and app_id ${existingSection.app_id}.`,
            });
        }

        let HistoryOutlineId = null;

        // Call `updateOutline` and handle errors
        try {
            HistoryOutlineId = await this.updateOutline(outlineDetail, existingSection.section_id, data.content);
        } catch (err) {
            throw new ForbiddenException({
                error: 'Failed to update outline.',
                message: err.message,
            });
        }

        // Increment the version
        const newVersion = existingSection.version + 1;

        // Create a history entry for the existing section
        const newHistoryEntry = this.assessmentSectionHistoryRepo.create({
            customer_id: existingSection.customer_id,
            app_id: existingSection.app_id,
            assessment_id: existingSection.assessment_id,
            section_id: existingSection.section_id,
            version: existingSection.version,
            created_by: existingSection.created_by,
            content: existingSection.content,
            s3_path: existingSection.s3_path,
            is_deleted: existingSection.is_deleted,
            content_hash: contentHash,
            created_on: existingSection.created_on,
            assmntHistoryId: HistoryOutlineId,
        });

        // Save the history
        await this.assessmentSectionHistoryRepo.save(newHistoryEntry);

        // Update the outline in `assessmentOutlineRepo`
        // const updatedOutline = outlineDetail.outline.map((outline) => {
        //     if (outline.section_id === queryParam.section_id) {
        //         outline.version = newVersion;
        //         outline.children = data.content.children || outline.children; // Update children if provided
        //     }
        //     return outline;
        // });

        // outlineDetail.outline = updatedOutline;
        // outlineDetail.outline_hash = await this.generateMD5Hash(JSON.stringify(updatedOutline));
        // outlineDetail.version += 1;

        // // Save the updated outline
        // await this.assessmentOutlineRepo.save(outlineDetail);

        // Update the existing section
        existingSection.version = newVersion;
        existingSection.created_by = userId;
        existingSection.content_hash = newContentHash;
        existingSection.content = data.content;
        existingSection.s3_path = data.s3_path || existingSection.s3_path || null;
        existingSection.copy_of = queryParam.version || null;

        return await this.assessmentSectionRepo.save(existingSection);
    }


    async generateMD5Hash(data: any): Promise<string> {
        const contentString = typeof data === 'string' ? data : JSON.stringify(data);
        return createHash('md5').update(contentString).digest('hex');
    }

    async updateOutline(
        outlineData: AssessmentOutline,
        sectionId: string,
        content: any
    ): Promise<number> {
        // Validate outline data
        if (!outlineData) {
            throw new ForbiddenException({
                error: `Assessment Outline not found.`,
                message: `The outline data is missing or invalid.`,
            });
        }

        // Generate hash for the outline if content_hash exists
        let contentHash = outlineData.outline_hash
            ? await this.generateMD5Hash(outlineData.outline)
            : null;

        // Create a history entry for the current outline
        const outlineHistoryData = this.assessmentHistoryRepo.create({
            customer_id: outlineData.customer_id,
            app_id: outlineData.app_id,
            assessment_id: outlineData.assessment_id,
            version: outlineData.version, // Previous version
            created_by: outlineData.created_by,
            created_on: new Date(),
            is_deleted: false,
            outline_hash: contentHash,
            outline: outlineData.outline,
        });

        const savedHistory = await this.assessmentHistoryRepo.save(outlineHistoryData);
        // Parse the outline into a mutable structure
        let outline = JSON.parse(JSON.stringify(outlineData.outline)); // Clone to avoid mutation

        let sectionUpdated = false;

        // Recursive function to locate and update the section's version
        const updateSectionVersion = (items: any[]): void => {
            if (!Array.isArray(items)) return;

            for (const item of items) {
                if (item.section_id === sectionId) {
                    item.version = (item.version || 0) + 1; // Increment the version
                    sectionUpdated = true;
                    return;
                }
                if (Array.isArray(item.children)) {
                    updateSectionVersion(item.children);
                }
            }
        };

        // Update the section version in the outline
        updateSectionVersion(outline);

        // If section was not found, throw an error
        if (!sectionUpdated) {
            throw new NotFoundException({
                error: `Section with ID ${sectionId} not found in the outline.`,
                message: `Unable to locate the section with ID ${sectionId} in the provided outline.`,
            });
        }

        // Generate a new hash for the updated outline
        const updatedOutlineHash = await this.generateMD5Hash(JSON.stringify(outline));

        // Update the existing outline data
        outlineData.outline = outline;
        outlineData.outline_hash = updatedOutlineHash;
        outlineData.version += 1; // Increment the outline version
        outlineData.created_on = new Date();

        // Save the updated outline back to the repository
        const updatedOutline = await this.assessmentOutlineRepo.save(outlineData);

        return savedHistory.id; // Return the ID of the created history entry
    }




    async fetchAssessmentsSec(
        userInfo: any,
        queryParam: { assessment_id: number; section_id: string }
    ): Promise<any> {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        // Check if the organization exists
        const count = await this.customerRepo.count({
            where: { id: orgId },
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch the assessment outline based on the assessment ID
        const assessmentOutl = await this.assessmentOutlineRepo.findOne({
            where: { assessment_id: queryParam.assessment_id },
        });

        if (!assessmentOutl) {
            throw new NotFoundException({
                error: 'Assessment outline not found',
                message: 'No outline found for the specified assessment ID',
            });
        }

        // Locate the specific section in the outline
        const outline = assessmentOutl.outline;
        const targetSection = outline.find((section) => section.section_id === queryParam.section_id);

        if (!targetSection) {
            throw new NotFoundException({
                error: 'Section ID not found in outline',
                message: 'Specified section ID does not exist in the assessment outline',
            });
        }

        // Fetch the assessment section details from the database
        const assessmentSection = await this.assessmentSectionRepo.findOne({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                is_deleted: false,
            },
        });

        if (!assessmentSection) {
            throw new NotFoundException({
                error: 'Assessment section not found',
                message: 'No section found for the specified ID in this assessment',
            });
        }

        // Convert the specific node and its children into a flat tree format
        const convertToFlatTree = (node) => {
            const flatTree = [];

            const recursiveFlatTree = (currentNode) => {
                flatTree.push({
                    id: currentNode.section_id,
                    level: currentNode.level,
                    title: assessmentSection.title,
                    content: assessmentSection.content,
                });

                if (currentNode.children && currentNode.children.length > 0) {
                    currentNode.children.forEach((child) => recursiveFlatTree(child));
                }
            };

            recursiveFlatTree(node);
            return flatTree;
        };

        return convertToFlatTree(targetSection);
    }



    async fetchAssessmentsSecList(
        userInfo: any,
        queryParam: { assessment_id: number; limit: number; offset: number }
    ): Promise<any> {
        const orgId = userInfo['tenant_id'];

        // Verify user organization membership
        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.'
            });
        }

        // Fetch the outline data for the given assessment
        const assessmentOutl = await this.assessmentOutlineRepo.findOne({
            where: { assessment_id: queryParam.assessment_id }
        });

        if (!assessmentOutl || !assessmentOutl.outline) {
            throw new Error('Assessment outline not found or outline data is missing');
        }

        const outline = assessmentOutl.outline;

        // Helper function to recursively flatten the outline tree

        //TODO Remove HtmlContent
        const convertToFlatTree = async (outline) => {
            const flatTree = [];

            const recursiveFlatTree = async (node) => {

                const assessmentSection = await this.assessmentSectionRepo.findOne({
                    where: {
                        customer_id: orgId,
                        assessment_id: queryParam.assessment_id,
                        section_id: node.section_id,
                        is_deleted: false,
                    }
                });

                if (assessmentSection) {
                    if (typeof assessmentSection.content === 'string') {
                        const section = {
                            id: node.section_id,
                            level: node.level,
                            title: assessmentSection.title,
                            content: {
                                htmlContent: assessmentSection.content
                            }
                        };
                        flatTree.push(section);
                    } else {
                        const section = {
                            id: node.section_id,
                            level: node.level,
                            title: assessmentSection.title,
                            content: assessmentSection.content
                        };
                        flatTree.push(section);
                    }
                }

                if (node.children && node.children.length > 0) {
                    for (const child of node.children) {
                        await recursiveFlatTree(child); // Await each recursive call
                    }
                }
            };

            for (const node of outline) {
                await recursiveFlatTree(node); // Await each recursive call
            }

            return flatTree;
        };

        // Generate the flat tree and apply pagination
        const flatTree = await convertToFlatTree(outline);

        const start = Math.min(queryParam.offset, flatTree.length);
        const end = Math.min(queryParam.offset + queryParam.limit, flatTree.length);
        const paginatedFlatTree = flatTree.slice(start, end);


        return {
            sections: flatTree,
            total: flatTree.length,
            limit: queryParam.limit,
            offset: queryParam.offset
        };
    }




    async updateSectionDS(userInfo: any, data: any, queryParam: { assessment_id: number; section_id: string; }): Promise<any> {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        // Check if the user is linked to any organization
        const count = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        if (!data.content) {
            throw new ForbiddenException({
                error: 'Please provide the Update content for section.',
                message: 'Please provide the Update content for section.',
            });
        }

        let newVersion = 0;

        // Check for existing entries in `assessment_sections`
        const existingAssessmentSections = await this.assessmentSectionRepo.find({
            where: {
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id
            }
        });

        // If existing data is found, create a new history entry
        if (existingAssessmentSections.length > 0) {
            // Get the latest version from the history table for this assessment
            const latestVersionEntry = await this.assessmentSectionHistoryRepo.findOne({
                where: { assessment_id: queryParam.assessment_id },
                order: { version: 'DESC' }
            });

            // Set the new version number
            newVersion = latestVersionEntry ? latestVersionEntry.version + 1 : 1;

            // Create a new history entry based on the existing assessment section
            const newHistoryEntry = this.assessmentSectionHistoryRepo.create({
                customer_id: existingAssessmentSections[0].customer_id,
                app_id: existingAssessmentSections[0].app_id,
                assessment_id: existingAssessmentSections[0].assessment_id,
                section_id: existingAssessmentSections[0].section_id,
                version: newVersion,
                created_by: userId,  // Set the creator of the history entry
                content: existingAssessmentSections[0].content,
                s3_path: existingAssessmentSections[0].s3_path,
                is_deleted: existingAssessmentSections[0].is_deleted
            });

            // Save the new history entry (copy_of field is not included)
            await this.assessmentSectionHistoryRepo.save(newHistoryEntry);
        }

        // Create a new entry in `assessment_sections` with an incremented version
        const newAssessmentSection = this.assessmentSectionRepo.create({
            customer_id: orgId,
            app_id: existingAssessmentSections[0].app_id,
            assessment_id: queryParam.assessment_id,
            section_id: queryParam.section_id,
            version: newVersion + 1, // Increment version for the new entry
            created_by: userId, // Assuming you have the `userId` of the creator
            content: data.content, // New content data
            s3_path: data.s3_path, // New S3 path if applicable
            is_deleted: false // Not deleted
        });

        // Save the new assessment section entry to the database
        return await this.assessmentSectionRepo.save(newAssessmentSection);
    }

    async fetchAssessmentsSectionHistoryVersion(
        userInfo: any,
        queryParam: { assessment_id: number; outline_id: number; version: number; limit: number; offset: number }
    ): Promise<{ section_id: string; title: string; newContent: string; oldContent: string }[] | { message: string }> {
        const orgId = userInfo['tenant_id'];

        // Verify if user is linked to an organization
        const orgCount = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgCount) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        if (!version) {
            throw new ForbiddenException({
                error: 'Please provide the version.',
                message: 'Please provide the version.',
            });
        }

        const newVersion = queryParam.version + 1;

        // Fetch the changed sections for the given assessment ID and version
        const listOfChangedSections = await this.assessmentSectionHistoryRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                version: queryParam.version,
                assmntHistoryId: queryParam.outline_id,
                is_deleted: false,
            },
        });

        if (!listOfChangedSections.length) {
            return { message: 'No historical data found for the specified sections.' };
        }

        // Prepare the result array
        const results = [];

        for (const section of listOfChangedSections) {
            const sectionId = section.section_id;

            // Fetch historical data for the current section and version
            const historyVersion = await this.assessmentSectionHistoryRepo.findOne({
                where: {
                    customer_id: orgId,
                    assessment_id: queryParam.assessment_id,
                    section_id: sectionId,
                    version: queryParam.version,
                    is_deleted: false,
                },
            });

            if (!historyVersion) {
                continue; // Skip if no historical version found
            }

            // Increment version and check for the next version in history
            const nextVersion = await this.assessmentSectionHistoryRepo.findOne({
                where: {
                    customer_id: orgId,
                    assessment_id: queryParam.assessment_id,
                    section_id: sectionId,
                    version: newVersion,
                    is_deleted: false,
                },
            });

            let currentVersion;

            if (!nextVersion) {
                // Fetch data from the current section table if no next version is found in history
                currentVersion = await this.assessmentSectionRepo.findOne({
                    where: {
                        customer_id: orgId,
                        section_id: sectionId,
                        is_deleted: false,
                    },
                });
            } else {
                currentVersion = nextVersion;
            }

            if (!currentVersion) {
                continue; // Skip if no current version found
            }

            // Construct the result for the current section
            results.push({
                section_id: sectionId,
                title: currentVersion.title || 'Untitled',
                newContent:
                    typeof currentVersion.content === 'object' && currentVersion.content
                        ? currentVersion.content.htmlContent || 'No content available'
                        : 'No content available',
                oldContent:
                    typeof historyVersion.content === 'object' && historyVersion.content
                        ? historyVersion.content.htmlContent || 'No content available'
                        : 'No content available',
            });
        }

        // Return the results
        return results.length ? results : { message: 'No data found for the specified sections.' };
    }



    async updateSectionHistory(
        userInfo: any,
        queryParam: { assessment_id: number; section_id: string; version: number }
    ): Promise<AssessmentSections> {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        // Verify user organization membership
        const isUserInOrg = await this.customerRepo.count({ where: { id: orgId } });
        if (!isUserInOrg) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        let newVersion = 0;
        let existingAssessmentSectionsHistory;

        // Check for existing assessment sections
        const existingAssessmentSections = await this.assessmentSectionRepo.find({
            where: {
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                customer_id: orgId,
                is_deleted: false
            }
        });

        await this.assessmentPolicyService.canUpdateSection(userInfo, existingAssessmentSections[0].app_id);

        // If an existing section exists, create a history entry
        if (existingAssessmentSections.length > 0) {
            const existingSection = existingAssessmentSections[0];

            // Retrieve the version from history to verify
            existingAssessmentSectionsHistory = await this.assessmentSectionHistoryRepo.findOne({
                where: {
                    assessment_id: queryParam.assessment_id,
                    section_id: queryParam.section_id,
                    version: queryParam.version,
                    customer_id: orgId,
                    is_deleted: false
                }
            });

            if (!existingAssessmentSectionsHistory) {
                throw new ForbiddenException({
                    error: 'The version you are applying not found.',
                    message: 'The version you are applying not found.',
                });
            }

            // Set new version number for `assessment_sections`
            newVersion = existingSection.version + 1;

            // Create and save history entry for the current section
            const newHistoryEntry = this.assessmentSectionHistoryRepo.create({
                ...existingSection,
                created_on: existingSection.created_on,
            });
            await this.assessmentSectionHistoryRepo.save(newHistoryEntry);

            // Delete the existing section
            await this.assessmentSectionRepo.remove(existingAssessmentSections);
        }

        // Create a new entry in `assessment_sections` with an incremented version
        const newAssessmentSection = this.assessmentSectionRepo.create({
            customer_id: orgId,
            title: existingAssessmentSections[0]?.title || '',
            app_id: existingAssessmentSections[0]?.app_id || null,
            assessment_id: queryParam.assessment_id,
            section_id: queryParam.section_id,
            version: newVersion,
            created_by: userId,
            content: existingAssessmentSectionsHistory?.content || '',
            s3_path: existingAssessmentSectionsHistory?.s3_path || existingAssessmentSections[0]?.s3_path || null,
            is_deleted: false,
            copy_of: queryParam.version
        });

        // Handle outline history creation and version update on section update
        const outlineData = await this.assessmentOutlineRepo.findOne({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                is_deleted: false
            }
        });

        if (outlineData) {
            const newOutlineVersion = outlineData.version + 1;

            // Create history entry for `assessment_outline`
            const outlineHistoryData = this.assessmentHistoryRepo.create({
                customer_id: outlineData.customer_id,
                app_id: outlineData.app_id,
                assessment_id: outlineData.assessment_id,
                version: outlineData.version,
                created_by: userId,
                created_on: new Date(),
                is_deleted: false,
                outline: outlineData.outline
            });
            await this.assessmentHistoryRepo.save(outlineHistoryData);

            // Update outline version
            outlineData.version = newOutlineVersion;
            await this.assessmentOutlineRepo.save(outlineData);
        }

        // Save the new assessment section entry
        return await this.assessmentSectionRepo.save(newAssessmentSection);
    }

    async getAssessmentsSectionHistoryDetails(
        userInfo: any,
        queryParam: { assessment_id: number; section_id: string; limit: number; offset: number }
    ): Promise<{ combinedData: any[], totalCount: number }> {
        const orgId = userInfo['tenant_id'];

        // Verify the organization ID is valid
        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch assessment history details
        const assessmentDetailsHistory = await this.assessmentSectionHistoryRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                is_deleted: false
            },
            select: ['id', 'section_id', 'version', 'created_on', 'created_by']
        });

        // Log the number of history entries found
        this.logger.info("Number of history records:", assessmentDetailsHistory.length);

        // Handle the case where no version changes are found
        if (!assessmentDetailsHistory.length) {
            return {
                combinedData: [],
                totalCount: 0
            };
        }

        // Fetch unique user IDs to get user names
        const userIds = [...new Set(assessmentDetailsHistory.map(item => item.created_by))];
        const users = await this.userRepo.findByIds(userIds);
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {});

        // Map user names to history records and select necessary fields
        const combinedDataWithUserNames = assessmentDetailsHistory
            .map(item => ({
                id: item.id,  // Use unique ID from history record
                section_id: item.section_id,
                userName: userMap[item.created_by] || 'Unknown User',
                created_on: item.created_on,
                version: item.version
            }))
            .sort((a, b) => b.version - a.version || b.created_on.getTime() - a.created_on.getTime());

        // Apply pagination (limit and offset)
        const paginatedData = combinedDataWithUserNames.slice(queryParam.offset, queryParam.offset + queryParam.limit);

        return {
            combinedData: paginatedData,
            totalCount: assessmentDetailsHistory.length
        };
    }

    async getAssessmentsSectionHistoryVersion(
        userInfo: any,
        queryParam: { assessment_id: number; section_id: string; version: number; limit: number; offset: number }
    ): Promise<{ section_id: string; title: string; newContent: string; oldContent: string } | { message: string }> {
        const orgId = userInfo['tenant_id'];

        // Verify if user is linked to an organization
        const orgCount = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgCount) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // if (!queryParam.version) {
        //     throw new ForbiddenException({
        //         error: 'Please provide the version.',
        //         message: 'Please provide the version.',
        //     });
        // }

        // Fetch the current version of the assessment section
        const currentVersion = await this.assessmentSectionRepo.findOne({
            where: {
                section_id: queryParam.section_id,
                assessment_id: queryParam.assessment_id,
                customer_id: orgId
            },
        });

        if (!currentVersion) {
            return { message: 'The current version of this section was not found.' };
        }

        // Check if there is a history record for this section
        const sectionHistoryExists = await this.assessmentSectionHistoryRepo.findOne({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                is_deleted: false
            }
        });

        if (!sectionHistoryExists) {
            return { message: 'No historical data found for this section.' };
        }

        // Determine the version to use as `historyVersionCurrent`
        let historyVersionCurrent;
        if (currentVersion.version === queryParam.version + 1) {
            historyVersionCurrent = currentVersion;
        } else {
            historyVersionCurrent = await this.assessmentSectionHistoryRepo.findOne({
                where: {
                    customer_id: orgId,
                    assessment_id: queryParam.assessment_id,
                    section_id: queryParam.section_id,
                    version: queryParam.version + 1,
                    is_deleted: false
                }
            });
        }

        if (!historyVersionCurrent) {
            return { message: 'The specified historical version was not found.' };
        }

        // Fetch the previous historical version (`historyVersionPre`)
        const historyVersionPre = await this.assessmentSectionHistoryRepo.findOne({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                version: queryParam.version,
                is_deleted: false
            }
        });

        return {
            section_id: queryParam.section_id,
            title: currentVersion.title || 'Untitled',
            newContent: historyVersionCurrent.content?.htmlContent || 'No content available',
            oldContent: historyVersionPre?.content?.htmlContent || 'No previous content available'
        };
    }

    async getAssessmentsSectionHistoryDetailsByOutline(
        userInfo: any,
        queryParam: { assessment_id: number; app_id: number; limit: number; offset: number }
    ): Promise<{ combinedData: any[]; totalCount: number }> {
        const orgId = userInfo['tenant_id'];

        // Verify the organization ID is valid
        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        // Fetch assessment history details
        const assessmentDetailsHistory = await this.assessmentHistoryRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                app_id: queryParam.app_id,
                is_deleted: false,
            },
        });

        if (!assessmentDetailsHistory.length) {
            return {
                combinedData: [],
                totalCount: 0,
            };
        }

        // Get unique outline content hashes
        const uniqueOutlineContents = [
            ...new Set(assessmentDetailsHistory.map(item => item.outline_hash).filter(hash => hash)),
        ];

        // Fetch outlines based on unique hashes
        const outlineRecords = await this.assessmentHistoryRepo.findBy({
            customer_id: orgId,
            assessment_id: queryParam.assessment_id,
            app_id: queryParam.app_id,
            outline_hash: In(uniqueOutlineContents),
        });

        // Create a map for quick lookup of outlines
        const outlineMap = outlineRecords.reduce((acc, record) => {
            acc[record.outline_hash] = record.outline;
            return acc;
        }, {});

        // Fetch unique user IDs to get user names
        const userIds = [...new Set(assessmentDetailsHistory.map(item => item.created_by))];
        const users = await this.userRepo.find({
            where: { id: In(userIds) },
            select: ['id', 'name'],
        });
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {});

        // Combine data and map user names
        const combinedDataWithUserNames = assessmentDetailsHistory
            .map(item => {
                const outline = outlineMap[item.outline_hash];
                if (!outline) {
                    this.logger.warn(`Outline not found for outline_hash: ${item.outline_hash}`);
                    return null;
                }

                return {
                    id: item.id,
                    userName: userMap[item.created_by] || 'Unknown User',
                    created_on: item.created_on,
                    version: item.version,
                };
            })
            .filter(Boolean) // Remove null entries
            .sort((a, b) => b.version - a.version || b.created_on.getTime() - a.created_on.getTime());

        // Apply pagination (limit and offset)
        const paginatedData = combinedDataWithUserNames.slice(
            queryParam.offset,
            queryParam.offset + queryParam.limit,
        );

        return {
            combinedData: paginatedData,
            totalCount: assessmentDetailsHistory.length,
        };
    }


    async updateMultipleSections(
        userInfo: any,
        data: { sections: { section_id: string; content: any; s3_path?: string }[] },
        queryParam: { assessment_id: number }
    ): Promise<AssessmentSections[]> {
        const orgId = userInfo.tenant_id;
        const userId = userInfo.userId;

        if (!orgId || !userId) {
            throw new ForbiddenException({
                error: 'Invalid user information.',
                message: 'Tenant ID or User ID is missing in user info.',
            });
        }

        const orgCount = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgCount) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        if (!data || !data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
            throw new BadRequestException({
                error: 'Invalid Request',
                message: 'Request must contain an array of sections with section_id and content.',
            });
        }

        const outlineDetail = await this.assessmentOutlineRepo.findOne({
            where: {
                assessment_id: queryParam.assessment_id,
                customer_id: orgId,
            },
        });

        if (!outlineDetail) {
            throw new NotFoundException({
                error: 'Assessment outline not found.',
                message: `No outline found for assessment_id ${queryParam.assessment_id}, customer_id ${orgId}.`,
            });
        }

        await this.assessmentPolicyService.canUpdateSection(userInfo, outlineDetail.app_id);

        const updatedSections = [];
        let HistoryOutlineId = null;
        try {
            HistoryOutlineId = await this.updateOutlineMultipleSections(outlineDetail, data, userInfo);
        } catch (err) {
            throw new ForbiddenException({
                error: `Failed to update outline for section ${data.sections}.`,
                message: err.message,
            });
        }

        for (const section of data.sections) {
            const { section_id, content, s3_path } = section;

            if (!section_id || !content) {
                throw new BadRequestException({
                    error: 'Invalid Section Data',
                    message: 'Each section must have a section_id and content.',
                });
            }

            const newContentHash = await this.generateMD5Hash(content);

            const existingSection = await this.assessmentSectionRepo.findOne({
                where: {
                    assessment_id: queryParam.assessment_id,
                    section_id,
                    customer_id: orgId,
                    is_deleted: false,
                },
            });

            if (!existingSection) {
                throw new NotFoundException({
                    error: `Section not found.`,
                    message: `No section found for assessment_id ${queryParam.assessment_id}, section_id ${section_id}, and customer_id ${orgId}.`,
                });
            }

            const existingContentHash = existingSection.content_hash || (await this.generateMD5Hash(existingSection.content));
            if (existingContentHash === newContentHash) {
                throw new ForbiddenException({
                    error: 'Nothing to update.',
                    message: `The content for section_id ${section_id} is identical to the existing content.`,
                });
            }

            const newVersion = existingSection.version + 1;

            const newHistoryEntry = this.assessmentSectionHistoryRepo.create({
                customer_id: existingSection.customer_id,
                app_id: existingSection.app_id,
                assessment_id: existingSection.assessment_id,
                section_id: existingSection.section_id,
                version: existingSection.version,
                created_by: existingSection.created_by,
                content: existingSection.content,
                s3_path: existingSection.s3_path,
                is_deleted: existingSection.is_deleted,
                content_hash: existingContentHash,
                created_on: existingSection.created_on,
                assmntHistoryId: HistoryOutlineId,
            });

            await this.assessmentSectionHistoryRepo.save(newHistoryEntry);

            // Update the section with new content directly in the existing entry
            existingSection.version = newVersion;
            existingSection.created_by = userId;
            existingSection.content_hash = newContentHash;
            existingSection.content = content;
            existingSection.s3_path = s3_path ?? existingSection.s3_path;

            await this.assessmentSectionRepo.update(
                { id: existingSection.id },
                {
                    version: existingSection.version,
                    created_by: existingSection.created_by,
                    content_hash: existingSection.content_hash,
                    content: existingSection.content,
                    s3_path: existingSection.s3_path,
                }
            );

            updatedSections.push(existingSection);
        }

        return updatedSections;
    }



    // new fetch api for the user details 
    async fetchUserOutline(
        userInfo: any,
        queryParam: { assessment_id: number; app_id: number; limit: number; offset: number }
    ): Promise<{ combinedData: any[]; totalCount: number }> {
        const orgId = userInfo['tenant_id'];

        // Verify the organization ID is valid
        const count = await this.customerRepo.count({ where: { id: orgId } });
        if (!count) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        const outlineData = await this.assessmentOutlineRepo.findOne({
            where: {
                customer_id: orgId,
                app_id: queryParam.app_id,
                assessment_id: queryParam.assessment_id
            }
        });

        const sectionIds = outlineData.outline;

        const assessmentDetailsHistory = await this.assessmentHistoryRepo.find({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                app_id: queryParam.app_id,
                is_deleted: false,
            },
        });

        if (!assessmentDetailsHistory.length) {
            return {
                combinedData: [],
                totalCount: 0,
            };
        }

        // Get unique outline content hashes
        const uniqueOutlineContents = [
            ...new Set(assessmentDetailsHistory.map(item => item.outline_hash).filter(hash => hash)),
        ];

        // Fetch outlines based on unique hashes
        const outlineRecords = await this.assessmentHistoryRepo.findBy({
            customer_id: orgId,
            assessment_id: queryParam.assessment_id,
            app_id: queryParam.app_id,
            outline_hash: In(uniqueOutlineContents),
        });

        // Create a map for quick lookup of outlines
        const outlineMap = outlineRecords.reduce((acc, record) => {
            acc[record.outline_hash] = record.outline;
            return acc;
        }, {});

        // Fetch unique user IDs to get user names
        const userIds = [...new Set(assessmentDetailsHistory.map(item => item.created_by))];
        const users = await this.userRepo.find({
            where: { id: In(userIds) },
            select: ['id', 'name'],
        });
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {});

        // Combine data and map user names
        const combinedDataWithUserNames = assessmentDetailsHistory
            .map(item => {
                const outline = outlineMap[item.outline_hash];
                if (!outline) {
                    this.logger.warn(`Outline not found for outline_hash: ${item.outline_hash}`);
                    return null;
                }

                return {
                    id: item.id,
                    userName: userMap[item.created_by] || 'Unknown User',
                    created_on: item.created_on,
                    version: item.version,
                };
            })
            .filter(Boolean) // Remove null entries
            .sort((a, b) => b.version - a.version || b.created_on.getTime() - a.created_on.getTime());

        const historyData = await this.assessmentHistoryRepo.findBy({
            customer_id: orgId,
            app_id: queryParam.app_id,
            assessment_id: queryParam.assessment_id
        })



        const paginatedData = combinedDataWithUserNames.slice(
            queryParam.offset,
            queryParam.offset + queryParam.limit,
        );

        return {
            combinedData: paginatedData,
            totalCount: assessmentDetailsHistory.length,
        };
    }


    async updateVersionHistory(
        userInfo: any,
        queryParam: { assessment_id: number; section_id: string; version: number }
    ): Promise<AssessmentSections> {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        // Verify user organization membership
        const isUserInOrg = await this.customerRepo.count({ where: { id: orgId } });
        if (!isUserInOrg) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }

        let newVersion = 0;
        let existingAssessmentSectionsHistory;

        // Check for existing assessment sections
        const existingAssessmentSections = await this.assessmentSectionRepo.find({
            where: {
                assessment_id: queryParam.assessment_id,
                section_id: queryParam.section_id,
                customer_id: orgId,
                is_deleted: false
            }
        });

        // If an existing section exists, create a history entry
        if (existingAssessmentSections.length > 0) {
            const existingSection = existingAssessmentSections[0];

            // Retrieve the version from history to verify
            existingAssessmentSectionsHistory = await this.assessmentSectionHistoryRepo.findOne({
                where: {
                    assessment_id: queryParam.assessment_id,
                    section_id: queryParam.section_id,
                    version: queryParam.version,
                    customer_id: orgId,
                    is_deleted: false
                }
            });

            if (!existingAssessmentSectionsHistory) {
                throw new ForbiddenException({
                    error: 'The version you are applying not found.',
                    message: 'The version you are applying not found.',
                });
            }

            // Set new version number for `assessment_sections`
            newVersion = existingSection.version + 1;

            // Create and save history entry for the current section
            const newHistoryEntry = this.assessmentSectionHistoryRepo.create({
                ...existingSection,
                created_on: existingSection.created_on,
            });
            await this.assessmentSectionHistoryRepo.save(newHistoryEntry);

            // Delete the existing section
            await this.assessmentSectionRepo.remove(existingAssessmentSections);
        }

        // Create a new entry in `assessment_sections` with an incremented version
        const newAssessmentSection = this.assessmentSectionRepo.create({
            customer_id: orgId,
            title: existingAssessmentSections[0]?.title || '',
            app_id: existingAssessmentSections[0]?.app_id || null,
            assessment_id: queryParam.assessment_id,
            section_id: queryParam.section_id,
            version: newVersion,
            created_by: userId,
            content: existingAssessmentSectionsHistory?.content || '',
            s3_path: existingAssessmentSectionsHistory?.s3_path || existingAssessmentSections[0]?.s3_path || null,
            is_deleted: false,
            copy_of: queryParam.version
        });

        // Handle outline history creation and version update on section update
        const outlineData = await this.assessmentOutlineRepo.findOne({
            where: {
                customer_id: orgId,
                assessment_id: queryParam.assessment_id,
                is_deleted: false
            }
        });

        if (outlineData) {
            const newOutlineVersion = outlineData.version + 1;

            // Create history entry for `assessment_outline`
            const outlineHistoryData = this.assessmentHistoryRepo.create({
                customer_id: outlineData.customer_id,
                app_id: outlineData.app_id,
                assessment_id: outlineData.assessment_id,
                version: outlineData.version,
                created_by: userId,
                created_on: new Date(),
                is_deleted: false,
                outline: outlineData.outline
            });
            await this.assessmentHistoryRepo.save(outlineHistoryData);

            // Update outline version
            outlineData.version = newOutlineVersion;
            await this.assessmentOutlineRepo.save(outlineData);
        }

        // Save the new assessment section entry
        return await this.assessmentSectionRepo.save(newAssessmentSection);
    }

    async updateOutlineMultipleSections(
        outlineData: AssessmentOutline,
        data: { sections: { section_id: string; content: any; s3_path?: string }[] },
        userInfo: any,
    ): Promise<number> {
        // Validate outline data
        if (!outlineData) {
            throw new ForbiddenException({
                error: `Assessment Outline not found.`,
                message: `The outline data is missing or invalid.`,
            });
        }

        // Validate incoming sections data
        if (!data || !data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
            throw new BadRequestException({
                error: `Invalid Section Data`,
                message: `The 'sections' field must be a non-empty array.`,
            });
        }

        const sectionIds = data.sections.map((section) => section.section_id);

        // Generate hash for the current outline
        let contentHash = outlineData.outline_hash
            ? await this.generateMD5Hash(outlineData.outline)
            : null;

        // Create a history entry for the current outline
        const outlineHistoryData = this.assessmentHistoryRepo.create({
            customer_id: outlineData.customer_id,
            app_id: outlineData.app_id,
            assessment_id: outlineData.assessment_id,
            version: outlineData.version, // Previous version
            created_by: userInfo["userId"] || outlineData.created_by,
            created_on: new Date(),
            is_deleted: false,
            outline_hash: contentHash,
            outline: outlineData.outline,
        });

        const savedHistory = await this.assessmentHistoryRepo.save(outlineHistoryData);

        // Parse the outline into a mutable structure
        let outline = JSON.parse(JSON.stringify(outlineData.outline)); // Clone to avoid mutation

        let updatedSectionsCount = 0;

        // Recursive function to locate and update the sections' versions
        const updateSectionsVersion = (items: any[]): void => {
            if (!Array.isArray(items)) return;

            for (const item of items) {
                if (sectionIds.includes(item.section_id)) {
                    const updatedSection = data.sections.find(
                        (section) => section.section_id === item.section_id
                    );

                    if (updatedSection) {
                        // Update the content and increment version
                        item.version = (item.version || 0) + 1;
                        updatedSectionsCount++;
                    }
                }

                if (Array.isArray(item.children)) {
                    updateSectionsVersion(item.children);
                }
            }
        };

        // Update the sections' versions in the outline
        updateSectionsVersion(outline);

        // If no sections were updated, throw an error
        if (updatedSectionsCount === 0) {
            throw new NotFoundException({
                error: `Sections with the given IDs not found in the outline.`,
                message: `Unable to locate any sections with the provided IDs in the outline.`,
            });
        }

        // Generate a new hash for the updated outline
        const updatedOutlineHash = await this.generateMD5Hash(JSON.stringify(outline));

        // Update the existing outline data
        outlineData.outline = outline;
        outlineData.outline_hash = updatedOutlineHash;
        outlineData.version += 1; // Increment the outline version
        outlineData.created_on = new Date();

        // Save the updated outline back to the repository
        await this.assessmentOutlineRepo.save(outlineData);

        return savedHistory.id; // Return the ID of the created history entry
    }


    async getStandardByCustomerId(userInfo: any, organizationId?: string): Promise<any[]> {
        // Use provided organizationId if available (for SuperAdmin/CSM managing another org)
        // Otherwise use the current user's organization
        let orgId = organizationId || userInfo['tenant_id'];
        
        // For SuperAdmin/CSM, allow accessing other organizations
        const userRoleId = userInfo['role_id'];
        const isSuperAdminOrCSM = userRoleId === 1 || userRoleId === 5; // SuperAdmin = 1, CSM = 5
        
        if (!isSuperAdminOrCSM && !organizationId) {
            // Regular users must be linked to an organization
            const count = await this.customerRepo.count({
                where: { id: orgId }
            });
            if (!count) {
                throw new ForbiddenException({
                    error: 'You are not linked to any organization.',
                    message: 'You are not linked to any organization.',
                });
            }
        }
        
        // Validate that the organization exists
        const orgExists = await this.customerRepo.count({
            where: { id: orgId }
        });
        if (!orgExists) {
            // Return empty array instead of throwing error for better UX
            return [];
        }
        
        const userId = userInfo['userId'];
        if (!userId) {
            throw new ForbiddenException({
                error: `Invalid User!`,
                message: `Invalid User!`,
            });
        }

        const orgStandards = await this.organizationStandardRepo
            .createQueryBuilder('organization_standards')
            .select('organization_standards.standard_id', 'standard_id')  // Alias the field to match entity
            .where('organization_standards.customer_id = :orgId', { orgId })
            .getRawMany();

        if (!orgStandards || orgStandards.length === 0) {
            // Return empty array instead of throwing error for better UX
            return [];
        }

        // Extract the standards_id from the raw result
        const standardIds = orgStandards.map((orgStandard) => orgStandard.standard_id);  // Access using the alias 'standards_id'

        const standards = await this.standardRepo.createQueryBuilder('standard')
            .leftJoinAndSelect('standard.framework', 'framework')
            .select([
                'standard.id',
                'standard.name',
                'standard.short_description',
                'standard.long_description',
                'standard.path',
                'standard.labels',
                'standard.created_at',
                'standard.updated_at',
                'standard.active',
                'framework.id',
                'framework.name'
            ])
            .where('standard.id IN (:...standardIds)', { standardIds })
            .andWhere('standard.active = :active', { active: true })
            .getMany();

            
            return standards.map(standard => ({
                id: standard.id,
                name: standard.name,
                short_description: standard.short_description,
                long_description: standard.long_description,
                path: standard.path,
                labels: standard.labels,
                created_at: standard.created_at,
                updated_at: standard.updated_at,
                active: standard.active,
                framework_name: standard.framework.name,
                framework_id: standard.framework.id
            }));

    }

    async uploadAssessment(userInfo: any, assessmentId: number) {
        const orgId = userInfo['customerId'];
        const userId = userInfo['userId'];

        const assessment = await this.assessmentDetailsRepo.findOne({
            where: { id: assessmentId, customer_id: orgId }
        });

        if (!assessment) {
            throw new NotFoundException({
                error: 'Assessment not found',
                message: 'Assessment not found',
            });
        }

        if (!assessment.temp_location) {
            throw new NotFoundException({
                error: 'Uploaded Assessment not found',
                message: 'Uploaded Assessment not found',
            });
        }

        if(assessment.is_locked) {
            throw new ForbiddenException({
                error: 'Assessment is locked',
                message: 'Assessment is locked',
            });
        }

        assessment.location = assessment.temp_location;
        assessment.temp_location = null;
        assessment.updated_by = userId;
        assessment.updated_on = new Date();
        assessment.is_locked = false;
        await this.assessmentDetailsRepo.save(assessment);
    }

    async downloadAssessment(userInfo: any, assessmentId: number) {
        const orgId = userInfo['tenant_id'];
        const userId = userInfo['userId'];

        const assessment = await this.assessmentDetailsRepo.findOne({
            where: { id: assessmentId, customer_id: orgId }
        });

        if (!assessment) {
            throw new NotFoundException({
                error: 'Assessment not found',
                message: 'Assessment not found',
            });
        }

        if (assessment.is_locked) {
            throw new ForbiddenException({
                error: 'Assessment is locked',
                message: 'Assessment is locked',
            });
        }

        if (!assessment.location) {
            throw new NotFoundException({
                error: 'Assessment location not found',
                message: 'Assessment location not found',
            });
        }

        const downloadUrl = await this.fileDownloadService.generateSignedUrl(
            assessment.location
        );
        return { downloadUrl, assessment_id: assessment.id, name: assessment.title };
    }        
        
        
}
