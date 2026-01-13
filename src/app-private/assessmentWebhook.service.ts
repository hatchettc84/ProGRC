import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App } from "src/entities/app.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { AssessmentSectionsHistory } from "src/entities/assessments/assessmentSectionsHistory.entity";
import { Customer } from "src/entities/customer.entity";
import { DataSource, Repository } from "typeorm";
import { createWebhookAssessmentSection, UpdateAssessmentSectionDto } from "src/assessment/assessment.dto";

@Injectable()
export class AssessmentsWebhookService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        @InjectRepository(App) private readonly appsRepo: Repository<App>,
        @InjectRepository(AssessmentSections) private readonly assessmentsSectionRepo: Repository<AssessmentSections>,
        @InjectRepository(AssessmentDetail) private readonly assessmentsDetailsRepo: Repository<AssessmentDetail>,
        @InjectRepository(AssessmentOutline) private readonly assessmentsOutlineRepo: Repository<AssessmentOutline>,
        @InjectRepository(AssessmentHistory) private readonly assessmentsHistoryeRepo: Repository<AssessmentHistory>,
        @InjectRepository(AssessmentSectionsHistory) private readonly assessmentsSectionHistoryeRepo: Repository<AssessmentSectionsHistory>,



    ) { }

    async createAssessment(
        requests: createWebhookAssessmentSection[],
        assessmentId: number,
        appId: number
    ): Promise<{ message: string; count: number }> {
        // Extract the organization ID from the first request
        const orgId = requests[0]?.customerId;
    
        // Validate the organization ID
        if (!orgId) {
            throw new ForbiddenException({
                error: 'Organization ID missing in request.',
                message: 'Invalid organization ID in request.',
            });
        }
    
        // Check if the tenant organization exists
        const orgExists = await this.customerRepo.count({ where: { id: orgId } });
        if (!orgExists) {
            throw new ForbiddenException({
                error: 'You are not linked to any organization.',
                message: 'You are not linked to any organization.',
            });
        }
    
        const appExist = await this.appsRepo.count({ where: { id: appId } });
        if (!appExist) {
            throw new ForbiddenException({
                error: 'No application exists with the provided appId.',
                message: 'No application exists with the provided appId.',
            });
        }
    
        const assessmentExists = await this.assessmentsDetailsRepo.count({ where: { id: assessmentId } });
        if (!assessmentExists) {
            throw new ForbiddenException({
                error: 'No assessment exists with the provided assessmentId.',
                message: 'No assessment exists with the provided assessmentId.',
            });
        }
    
        // Start a transaction to handle atomicity
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            for (const request of requests) {
                // Check if a section with sectionId, version = 0, and matching customerId and assessmentId exists
                const existingSection = await this.assessmentsSectionRepo.findOne({
                    where: {
                        section_id: request.sectionId,
                        version: 0, // Only consider version 0
                        customer_id: request.customerId,
                        assessment_id: request.assessmentId,
                    },
                });
    
                if (existingSection) {
                    // Update the content field only
                    existingSection.content = request.content;
    
                    // Optionally update the content_hash (if required)
                    existingSection.content_hash = this.generateMD5Hash(request.content);
    
                    // Save the updated entry
                    await queryRunner.manager.save(existingSection);
                } else {
                    // Create a new entry for sections without a matching version 0 entry
                    const newSection = this.assessmentsSectionRepo.create({
                        title: request.title,
                        app_id: request.appId,
                        assessment_id: request.assessmentId,
                        section_id: request.sectionId,
                        version: 0, // Set version to 0 for new entries
                        created_by: request.createdBy,
                        created_on: new Date(),
                        is_deleted: false,
                        content: request.content,
                        content_hash: this.generateMD5Hash(request.content),
                        customer_id: request.customerId,
                        copy_of: request.copyOf || null,
                    });
    
                    // Save the new entry
                    await queryRunner.manager.save(newSection);
                }
            }
    
            // Commit the transaction if all entries are processed
            await queryRunner.commitTransaction();
    
            return {
                message: 'All assessment sections processed successfully.',
                count: requests.length,
            };
        } catch (error) {
            // Roll back the transaction in case of an error
            await queryRunner.rollbackTransaction();
            throw new Error('Failed to process assessment sections.');
        } finally {
            // Release the query runner
            await queryRunner.release();
        }
    }
    
    /**
     * Utility method to generate a content hash (e.g., MD5 hash).
     * @param content - The content to hash.
     * @returns The generated hash string.
     */
    private generateMD5Hash(content: any): string {
        const crypto = require('crypto');
        const contentString = JSON.stringify(content);
        return crypto.createHash('md5').update(contentString).digest('hex');
    }
    



    async updateAssessmentSections(
        sections: UpdateAssessmentSectionDto[], // Sections to update
        assessmentId: number,
        appId: number,
        customerId: string // Tenant ID
    ): Promise<number> {

        const userId = sections[0].createdBy;
        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            throw new BadRequestException({
                error: 'Invalid Request',
                message: 'Request must contain a non-empty array of sections.',
            });
        }
    
        // Fetch the existing outline for the given assessment
        const existingOutline = await this.assessmentsOutlineRepo.findOne({
            where: { assessment_id: assessmentId, customer_id: customerId, app_id: appId },
        });
    
        if (!existingOutline) {
            throw new NotFoundException({
                error: 'Assessment outline not found.',
                message: `No outline found for assessment_id ${assessmentId}, customer_id ${customerId}, and app_id ${appId}.`,
            });
        }
    
        // Persist the existing outline to the assessmentHistoryRepo
        const historyEntry = this.assessmentsHistoryeRepo.create({
            customer_id: existingOutline.customer_id,
            app_id: existingOutline.app_id,
            assessment_id: existingOutline.assessment_id,
            version: existingOutline.version,
            created_by: existingOutline.created_by,
            created_on: existingOutline.created_on,
            outline: existingOutline.outline,
            outline_hash: existingOutline.outline_hash,
            is_deleted: existingOutline.is_deleted,
        });
    
        // Save the history entry
        await this.assessmentsHistoryeRepo.save(historyEntry);
    
        // Deep clone the outline to modify it safely
        const updatedOutline = JSON.parse(JSON.stringify(existingOutline.outline));
        let updatedCount = 0;
    
        // Update each section in the outline
        for (const section of sections) {
            const { sectionId, content } = section;
    
            // Helper function to recursively find and update the section in the outline tree
            const updateSectionInOutline = (nodes: any[]): boolean => {
                for (const node of nodes) {
                    if (node.section_id === sectionId) {
                        node.children = content.children || node.children; // Update children
                        node.version += 1; // Increment version
                        updatedCount++;
                        return true; // Stop further search
                    }
                    if (node.children?.length) {
                        const updated = updateSectionInOutline(node.children);
                        if (updated) return true;
                    }
                }
                return false;
            };
    
            const sectionFound = updateSectionInOutline(updatedOutline);
            if (!sectionFound) {
                throw new NotFoundException({
                    error: `Section not found in outline.`,
                    message: `Section ID ${sectionId} not found in assessment outline.`,
                });
            }
        }
    
        // Generate a new hash for the updated outline (optional, based on your requirements)
        const newOutlineHash = await this.generateMD5Hash(JSON.stringify(updatedOutline));
    
        // Create a new version of the outline with the updated data
        const newVersion = existingOutline.version + 1;
        const updatedOutlineEntry = this.assessmentsOutlineRepo.create({
            ...existingOutline,
            outline: updatedOutline,
            version: newVersion,
            outline_hash: newOutlineHash,
            created_by:userId,
            created_on: new Date(),
        });
    
        // Save the updated outline
        await this.assessmentsOutlineRepo.save(updatedOutlineEntry);
    
        // Call the function to process AssessmentSections
        await this.updateAndPersistSectionHistory(sections, assessmentId, appId, customerId);
    
        return updatedCount; // Return the number of updated sections
    }
    
    private async updateAndPersistSectionHistory(
        sections: UpdateAssessmentSectionDto[],
        assessmentId: number,
        appId: number,
        customerId: string
    ): Promise<void> {

        const userid = sections[0].createdBy;
        for (const section of sections) {
            const { sectionId, content } = section;
    
            // Fetch the existing section
            const existingSection = await this.assessmentsSectionRepo.findOne({
                where: { section_id: sectionId, assessment_id: assessmentId, app_id: appId, customer_id: customerId },
            });
    
            if (!existingSection) {
                throw new NotFoundException({
                    error: 'Section not found.',
                    message: `Section ID ${sectionId} not found in assessment sections.`,
                });
            }
    
            // Persist the current section to the history repository
            const historyEntry = this.assessmentsSectionHistoryeRepo.create({
                ...existingSection, // Copy all existing fields
            });
    
            await this.assessmentsSectionHistoryeRepo.save(historyEntry);
    
            // Generate a new hash for the updated content
            const newContentHash = await this.generateMD5Hash(JSON.stringify(content));
    
            // Increment version and create a new section entry
            const newVersion = existingSection.version + 1;
    
            const updatedSection = this.assessmentsSectionRepo.create({
                ...existingSection,
                content, // Update content with the new data
                version: newVersion,
                content_hash: newContentHash,
                created_by: userid,
                created_on: new Date(),
            });
    
            await this.assessmentsSectionRepo.save(updatedSection);
        }
    }
    
    // async generateMD5Hash(data: any): Promise<string> {
    //     const contentString = typeof data === 'string' ? data : JSON.stringify(data);
    //     return createHash('md5').update(contentString).digest('hex');
    // }
}
