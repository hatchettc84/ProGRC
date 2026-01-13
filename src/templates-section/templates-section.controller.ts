import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { TemplatesSectionService } from './templates-section.service';
import { TemplateSection } from '../entities/templatesSection.entity'; // Import the entity
import { AuthGuard } from "src/guards/authGuard";
import { Roles } from "src/decorators/roles.decorator";
import * as metadata from '../common/metadata';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const userRoles = metadata["userRoles"];


@Controller('templates-section')
export class TemplatesSectionController {
    constructor(private readonly templatesSectionService: TemplatesSectionService) {}

    // GET /templates-section - Retrieve all template sections
    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(userRoles.org_admin, userRoles.org_member)
    async findAll(): Promise<TemplateSection[]> {
        return await this.templatesSectionService.findAll();
    }

    // GET /templates-section/:id - Retrieve a template section by ID
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<TemplateSection> {
        return await this.templatesSectionService.findOneById(id);
    }

    // POST /templates-section - Create a new template section
    @Post()
    async create(@Body() templateSectionData: Partial<TemplateSection>): Promise<TemplateSection> {
        return await this.templatesSectionService.createTemplateSection(templateSectionData);
    }

    // PUT /templates-section/:id - Update a template section by ID
    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() templateSectionData: Partial<TemplateSection>,
    ): Promise<TemplateSection> {
        return await this.templatesSectionService.updateTemplateSection(id, templateSectionData);
    }

    // DELETE /templates-section/:id - Delete a template section by ID
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return await this.templatesSectionService.deleteTemplateSection(id);
    }
}