import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { TemplateService } from "./service/template.service";
import { CloneTemplateRequest, CreateTemplateRequest, CreateTemplateSectionRequest, PatchTemplateRequest, TemplateDetailsResponse, TemplateResponse, TemplateSectionResponse, UpdateTemplateRequest, UpdateTemplateSectionsRequest, UploadTemplateRequest } from "./template.dto";
import { TemplateVariable } from "src/entities/templateVariable.entity";
import { TemplateVariableGroup } from "src/entities/templateVariableGroup.entity";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { Standard } from "src/entities/standard_v1.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller('template')
@ApiTags('Template Management')
@UseInterceptors(TransformInterceptor)
export class TemplateController {
    constructor(
        private readonly templateSrvc: TemplateService
    ) { }

    @Get('/list')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.CSM, UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.SuperAdmin, UserRole.SuperAdminReadOnly)
    @ApiOperation({ summary: 'List all templates' })
    @ApiResponse({ status: 200, description: 'List all templates', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, name: 'Template 1', description: 'Template description', licenseTypeId: 1, isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' }] } } })
    async getCustomerTemplates(
        @Request() req: any,
        @Query('entityType') entityType: string,
    ): Promise<StandardResponse<TemplateResponse[]>> {
        const templates = await this.templateSrvc.listTemplates(req['user_data'], entityType);
        return StandardResponse.success('Success', templates);
    }

    @Post('/new')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Create a new template with default sections' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                standards: { type: 'array', items: { type: 'number' } },
                licenseTypeId: { type: 'number' },
                customer_ids: { type: 'array', items: { type: 'string' }, nullable: true }
            },
            required: ['name', 'standards', 'licenseTypeId']
        }
    })
    @ApiResponse({ status: 201, description: 'Create a new template', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'New Template', licenseTypeId: 1, isPublished: false, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' } } } })
    async createTemplate(
        @Request() req: any,
        @Body() body: CreateTemplateRequest,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.createTemplate(req['user_data'], body);
        return StandardResponse.success('Success', template);
    }

    @Post('/:id/clone')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Clone a template by id' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        }
    })
    @ApiResponse({ status: 201, description: 'Clone an existing template', schema: { example: { status: 'Success', message: 'Success', data: { id: 2, name: 'Cloned Template', description: 'Cloned description', licenseTypeId: 1, isPublished: false, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' } } } })
    async cloneTemplate(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: CloneTemplateRequest,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.cloneTemplate(req['user_data'], id, body);
        return StandardResponse.success('Success', template);
    }

    @Get('/:id/details')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.CSM, UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.SuperAdmin, UserRole.SuperAdminReadOnly)
    @ApiOperation({ summary: 'Get template by id' })
    @ApiResponse({ status: 200, description: 'Get template by ID', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Template 1', description: 'Template description', licenseTypeId: 1, isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' } } } })
    async getTemplateById(
        @Param('id') id: number,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.getTemplateById(id);
        return StandardResponse.success('Success', template);
    }

    @Delete('/:id/delete')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Delete template by id' })
    @ApiResponse({ status: 200, description: 'Delete template by ID', schema: { example: { status: 'Success', message: 'Success', data: null } } })
    async deleteTemplate(
        @Param('id') id: number,
    ): Promise<StandardResponse<void>> {
        await this.templateSrvc.deleteTemplate(id);
        return StandardResponse.success('Success', null);
    }

    @Put('/:id/update')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Update template by id' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                standards: { type: 'array', items: { type: 'number' }, nullable: true },
                customer_ids: { type: 'array', items: { type: 'string' }, nullable: true },
                licenseTypeId: { type: 'number' },
                outline: { type: 'object', nullable: true },
                isPublished: { type: 'boolean' }
            },
            required: ['name', 'licenseTypeId', 'isPublished']
        }
    })
    @ApiResponse({ status: 200, description: 'Update template by ID', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Updated Template', description: 'Updated description', licenseTypeId: 1, isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async updateTemplate(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: UpdateTemplateRequest,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.updateTemplate(req['user_data'], id, body);
        return StandardResponse.success('Success', template);
    }

    @Patch('/:id/update')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Patch template by id' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                standards: { type: 'array', items: { type: 'number' }, nullable: true },
                customer_ids: { type: 'array', items: { type: 'string' }, nullable: true },
                licenseTypeId: { type: 'number' },
                outline: { type: 'object', nullable: true },
                isPublished: { type: 'boolean' }
            },
            required: ['name', 'licenseTypeId', 'isPublished']
        }
    })
    @ApiResponse({ status: 200, description: 'Patch template by ID', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Updated Template', description: 'Updated description', licenseTypeId: 1, isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async patchTemplate(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: PatchTemplateRequest,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.patchTemplate(req['user_data'], id, body);
        return StandardResponse.success('Success', template);
    }

    @Post('/:id/section')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Create a new section in a template' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                parent_id: { type: 'number', nullable: true }
            },
            required: ['title']
        }
    })
    @ApiResponse({ status: 201, description: 'Create a new section in a template', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, title: 'New Section', section_id: 'section_1', html_content: '<p>Section content</p>', is_active: true, type: 'type', parent_id: null, is_looped: false } } } })
    async createSection(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: CreateTemplateSectionRequest,
    ): Promise<StandardResponse<TemplateSectionResponse>> {
        const section = await this.templateSrvc.createSection(req['user_data'], id, body);
        return StandardResponse.success('Success', section);
    }

    @Get('/:id/sections')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OrgMember, UserRole.CSM, UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.SuperAdmin, UserRole.SuperAdminReadOnly)
    @ApiOperation({ summary: 'Get all sections of a template' })
    @ApiResponse({ status: 200, description: 'Get all sections of a template', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, title: 'Section 1', section_id: 'section_1', html_content: '<p>Section content</p>', is_active: true, type: 'type', parent_id: 0, is_looped: false }] } } })
    async getSections(
        @Param('id') id: number,
    ): Promise<StandardResponse<TemplateSectionResponse[]>> {
        const sections = await this.templateSrvc.getSections(id);
        return StandardResponse.success('Success', sections);
    }

    @Patch('/:id/sections')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiOperation({ summary: 'Update template sections' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                sections: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            title: { type: 'string' },
                            section_id: { type: 'string' },
                            html_content: { type: 'string', nullable: true },
                            parent_id: { type: 'number', nullable: true }
                        },
                        required: ['id', 'title', 'section_id']
                    }
                }
            },
            required: ['sections']
        }
    })
    @ApiResponse({ status: 200, description: 'Update sections of a template', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, title: 'Updated Section', section_id: 'section_1', html_content: '<p>Updated content</p>', is_active: true, type: 'type', parent_id: 0, is_looped: false }] } } })
    async updateSections(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: UpdateTemplateSectionsRequest,
    ): Promise<StandardResponse<TemplateSectionResponse[]>> {
        const sections = await this.templateSrvc.updateSections(req['user_data'], id, body);
        return StandardResponse.success('Success', sections);
    }

    @Get('/variables')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get all variables' })
    @ApiResponse({ status: 200, description: 'Get all template variables', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, label: 'Variable 1', placeholder: 'Placeholder 1', type: 'GLOBAL', group_id: 1, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' }] } } })
    async getVariables(): Promise<StandardResponse<TemplateVariable[]>> {
        const variables = await this.templateSrvc.getVariables();
        return StandardResponse.success('Success', variables);
    }

    @Get('/variable-groups')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get all variable groups' })
    @ApiResponse({ status: 200, description: 'Get all template variable groups', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, name: 'Group 1', parent_id: 0, order_index: 1, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' }] } } })
    async getVariableGroups(): Promise<StandardResponse<TemplateVariableGroup[]>> {
        const variableGroups = await this.templateSrvc.getVariableGroups();
        return StandardResponse.success('Success', variableGroups);
    }


    @Get('/standards')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get all standards' })
    @ApiResponse({ status: 200, description: 'Get all standards', schema: { example: { status: 'Success', message: 'Success', data: [{ id: 1, name: 'Standard 1', created_at: '2023-01-01T00:00:00.000Z', updated_at: '2023-01-02T00:00:00.000Z' }] } } })
    async getStandards(): Promise<StandardResponse<Standard[]>> {
        const standards = await this.templateSrvc.getStandards();
        return StandardResponse.success('Success', standards);
    }

    @Delete('/section/:sectionId/delete')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Delete section by section_id' })
    @ApiResponse({ status: 200, description: 'Delete section by section_id', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Template 1', licenseTypeId: 1, licenseType: 'License Type', isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async deleteSectionBySectionId(
        @Param('sectionId') sectionId: string,
    ): Promise<StandardResponse<TemplateDetailsResponse>> {
        const template = await this.templateSrvc.deleteSection(sectionId);
        return StandardResponse.success('Success', template);
    }

    @Put('/:id/upload')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                standards: { type: 'array', items: { type: 'number' }, nullable: true },
                customer_ids: { type: 'array', items: { type: 'string' }, nullable: true },
                licenseTypeId: { type: 'number' },
                isPublished: { type: 'boolean' },
                type: { type: 'string' },
                llm_enabled: { type: 'boolean' }
            },
            required: ['name', 'licenseTypeId', 'isPublished', 'type', 'llm_enabled']
        }
    })
    @ApiOperation({ summary: 'Upload template' })
    @ApiResponse({ status: 200, description: 'Upload template', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Template 1', licenseTypeId: 1, licenseType: 'License Type', isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async uploadTemplate(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: UploadTemplateRequest,
    ): Promise<StandardResponse<TemplateResponse>> {
        const template = await this.templateSrvc.uploadTemplate(req['user_data'], id, body);
        return StandardResponse.success('Success', template);
    }

    @Get('/:id/download')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Download template' })
    @ApiResponse({ status: 200, description: 'Download template', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Template 1', licenseTypeId: 1, licenseType: 'License Type', isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async downloadTemplate(
        @Param('id') id: number,
    ): Promise<StandardResponse<TemplateResponse>> {
        const template = await this.templateSrvc.downloadTemplate(id);
        return StandardResponse.success('Success', template);
    }

    @Patch('/:id/upload')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false
        })
    )
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                standards: { type: 'array', items: { type: 'number' }, nullable: true },
                customer_ids: { type: 'array', items: { type: 'string' }, nullable: true },
                licenseTypeId: { type: 'number' },
                isPublished: { type: 'boolean' },
                type: { type: 'string' },
                llm_enabled: { type: 'boolean' }
            },
            required: ['name', 'licenseTypeId', 'isPublished', 'type', 'llm_enabled']
        }
    })
    @ApiOperation({ summary: 'Update template file' })
    @ApiResponse({ status: 200, description: 'Update Uploaded template', schema: { example: { status: 'Success', message: 'Success', data: { id: 1, name: 'Template 1', licenseTypeId: 1, licenseType: 'License Type', isPublished: true, isEditable: true, isDefault: false, standards: [{ name: 'Standard 1', id: 1 }], createdBy: 'user1', updatedBy: 'user2', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z', outline: {} } } } })
    async updateTemplateFile(
        @Request() req: any,
        @Param('id') id: number,
        @Body() body: any,
    ): Promise<StandardResponse<TemplateResponse>> {
        const template = await this.templateSrvc.updateTemplateFile(req['user_data'], id, body);
        return StandardResponse.success('Success', template);
    }
}
