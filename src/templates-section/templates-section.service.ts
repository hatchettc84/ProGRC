import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateSection } from '../entities/templatesSection.entity'; // Import the entity

@Injectable()
export class TemplatesSectionService {
    constructor(
        @InjectRepository(TemplateSection)
        private readonly templateSectionRepository: Repository<TemplateSection>, // Injecting the repository
    ) {}

    // Fetch all template sections
    async findAll(): Promise<TemplateSection[]> {
        return await this.templateSectionRepository.find();
    }

    // Fetch a single template section by id
    async findOneById(id: number): Promise<TemplateSection> {
        return await this.templateSectionRepository.findOneBy({ id });
    }

    // Create a new template section
    async createTemplateSection(templateSectionData: Partial<TemplateSection>): Promise<TemplateSection> {
        const newTemplateSection = this.templateSectionRepository.create(templateSectionData);
        return await this.templateSectionRepository.save(newTemplateSection);
    }

    // Update an existing template section by id
    async updateTemplateSection(id: number, templateSectionData: Partial<TemplateSection>): Promise<TemplateSection> {
        await this.templateSectionRepository.update(id, templateSectionData);
        return await this.findOneById(id); // Return the updated record
    }

    // Delete a template section by id
    async deleteTemplateSection(id: number): Promise<void> {
        await this.templateSectionRepository.delete(id);
    }
}