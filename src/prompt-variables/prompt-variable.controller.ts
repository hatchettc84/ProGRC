import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import { PromptVariableService } from './prompt-variable.service';
import {
    CreatePromptVariableDto,
    UpdatePromptVariableDto,
    TestPromptVariableDto,
    DuplicatePromptVariableDto
} from './dto/prompt-variable.dto';
import { PromptTemplateVariable } from 'src/entities/promptTemplateVariable.entity';
import { TemplateSectionType } from 'src/entities/templatesSection.entity';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/masterData/userRoles.entity';

@ApiTags('Prompt Variables')
@Controller('prompt-variables')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-auth')
export class PromptVariableController {
    constructor(private readonly promptVariableService: PromptVariableService) { }

    @Post()
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Create a new prompt variable' })
    @ApiBody({
        description: 'Prompt variable data',
        type: CreatePromptVariableDto,
        examples: {
            'Company Summary Variable': {
                value: {
                    display_name: 'Company Risk Summary',
                    description: 'Generates a comprehensive risk summary for the organization',
                    prompt: 'Generate a comprehensive risk summary for the organization based on their compliance assessment',
                    context_source: 'customer.name, assessment.type, application.description',
                    output_format: 'HTML formatted text, maximum 300 words',
                    type: 'GLOBAL',
                    group_id: 1,
                    specific_use_case: false,
                    input_parameters: []
                }
            },
            'Control Details with Parameters': {
                value: {
                    display_name: 'Specific Control Details',
                    description: 'Provides detailed information about a specific control',
                    prompt: 'Provide detailed information about the specific control including its implementation status',
                    context_source: 'customer.name, application.name, assessment.type',
                    output_format: 'Structured HTML with sections for description, status, and recommendations',
                    type: 'CONTROL',
                    group_id: 2,
                    specific_use_case: false,
                    input_parameters: [
                        {
                            name: 'control_id',
                            label: 'Control ID',
                            type: 'text',
                            required: true,
                            description: 'The specific control identifier (e.g., AC-1, AU-2)'
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Prompt variable created successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Prompt variable created successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                        display_name: { type: 'string', example: 'Company Risk Summary' },
                        description: { type: 'string', example: 'Generates a comprehensive risk summary for the organization' },
                        prompt: { type: 'string', example: 'Generate a comprehensive risk summary...' },
                        context_source: { type: 'string', example: 'customer.name, assessment.type, application.description' },
                        output_format: { type: 'string', example: 'HTML formatted text, maximum 300 words' },
                        type: { type: 'string', example: 'GLOBAL' },
                        group_id: { type: 'number', example: 1 },
                        specific_use_case: { type: 'boolean', example: false },
                        customer_id: { type: 'string', example: 'customer-uuid' },
                        is_active: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    async createPromptVariable(
        @Request() req: any,
        @Body() data: CreatePromptVariableDto
    ): Promise<StandardResponse<PromptTemplateVariable>> {
        const variable = await this.promptVariableService.createPromptVariable(req.user_data, data);
        return StandardResponse.success('Prompt variable created successfully', variable);
    }

    @Get()
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Search prompt variables for customer' })
    @ApiQuery({ name: 'search', required: false, description: 'Search term to filter variables by name or description' })
    @ApiQuery({ name: 'type', required: false, enum: TemplateSectionType, description: 'Filter by visibility scope' })
    @ApiQuery({ name: 'include_specific', required: false, type: 'string', description: 'Include specific use case variables (true/false)' })
    @ApiResponse({
        status: 200,
        description: 'Variables retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variables retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                            display_name: { type: 'string', example: 'Company Risk Summary' },
                            description: { type: 'string', example: 'Generates a comprehensive risk summary' },
                            type: { type: 'string', example: 'GLOBAL' },
                            group_id: { type: 'number', example: 1 },
                            specific_use_case: { type: 'boolean', example: false },
                            created_at: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getCustomerPromptVariables(
        @Request() req: any,
        @Query('search') searchTerm?: string,
        @Query('type') type?: TemplateSectionType,
        @Query('include_specific') includeSpecificUseCase?: string
    ): Promise<StandardResponse<PromptTemplateVariable[]>> {
        const includeSpecific = includeSpecificUseCase === 'true';
        const variables = await this.promptVariableService.searchVariables(
            req.user_data.customerId,
            searchTerm,
            type,
            includeSpecific
        );
        return StandardResponse.success('Variables retrieved successfully', variables);
    }

    @Get('template-editor')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get variables for template editor (excludes specific use case variables)' })
    @ApiQuery({ name: 'type', required: false, enum: TemplateSectionType, description: 'Filter by visibility scope' })
    @ApiResponse({
        status: 200,
        description: 'Template editor variables retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Template editor variables retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                            display_name: { type: 'string', example: 'Company Risk Summary' },
                            type: { type: 'string', example: 'GLOBAL' },
                            group_id: { type: 'number', example: 1 }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getTemplateEditorVariables(
        @Request() req: any,
        @Query('type') type?: TemplateSectionType
    ): Promise<StandardResponse<PromptTemplateVariable[]>> {
        const variables = await this.promptVariableService.getTemplateEditorVariables(req.user_data.customerId, type);
        return StandardResponse.success('Template editor variables retrieved successfully', variables);
    }

    @Get('by-type/:type')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get variables by visibility scope type' })
    @ApiParam({ name: 'type', enum: TemplateSectionType, description: 'Visibility scope type (GLOBAL, CONTROL_FAMILY, CONTROL)' })
    @ApiResponse({
        status: 200,
        description: 'Variables retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variables retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                            display_name: { type: 'string', example: 'Company Risk Summary' },
                            type: { type: 'string', example: 'GLOBAL' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getVariablesByType(
        @Request() req: any,
        @Param('type') type: TemplateSectionType
    ): Promise<StandardResponse<PromptTemplateVariable[]>> {
        const variables = await this.promptVariableService.getVariablesByType(req.user_data.customerId, type);
        return StandardResponse.success('Variables retrieved successfully', variables);
    }

    @Get('by-group/:groupId')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get variables by template variable group' })
    @ApiParam({ name: 'groupId', type: 'number', description: 'Template variable group ID' })
    @ApiResponse({
        status: 200,
        description: 'Variables retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variables retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                            display_name: { type: 'string', example: 'Company Risk Summary' },
                            group_id: { type: 'number', example: 1 }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getVariablesByGroup(
        @Request() req: any,
        @Param('groupId', ParseIntPipe) groupId: number
    ): Promise<StandardResponse<PromptTemplateVariable[]>> {
        const variables = await this.promptVariableService.getVariablesByGroup(req.user_data.customerId, groupId);
        return StandardResponse.success('Variables retrieved successfully', variables);
    }

    @Get('customer')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get all variables for the authenticated customer' })
    @ApiResponse({
        status: 200,
        description: 'All customer variables retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'All customer variables retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                            display_name: { type: 'string', example: 'Company Risk Summary' },
                            description: { type: 'string', example: 'Generates a comprehensive risk summary' },
                            type: { type: 'string', example: 'GLOBAL' },
                            is_active: { type: 'boolean', example: true },
                            created_at: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getAllCustomerVariables(
        @Request() req: any
    ): Promise<StandardResponse<PromptTemplateVariable[]>> {
        const variables = await this.promptVariableService.getCustomerVariables(req.user_data.customerId);
        return StandardResponse.success('All customer variables retrieved successfully', variables);
    }

    @Get(':variableId')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Get a specific prompt variable by ID' })
    @ApiParam({ name: 'variableId', type: 'number', description: 'Prompt variable ID' })
    @ApiResponse({
        status: 200,
        description: 'Variable retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variable retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                        display_name: { type: 'string', example: 'Company Risk Summary' },
                        description: { type: 'string', example: 'Generates a comprehensive risk summary for the organization' },
                        prompt: { type: 'string', example: 'Generate a comprehensive risk summary...' },
                        context_source: { type: 'string', example: 'customer.name, assessment.type, application.description' },
                        output_format: { type: 'string', example: 'HTML formatted text, maximum 300 words' },
                        type: { type: 'string', example: 'GLOBAL' },
                        group_id: { type: 'number', example: 1 },
                        specific_use_case: { type: 'boolean', example: false },
                        input_parameters: { type: 'array', items: { type: 'object' } },
                        customer_id: { type: 'string', example: 'customer-uuid' },
                        is_active: { type: 'boolean', example: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Variable not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    async getPromptVariable(
        @Param('variableId', ParseIntPipe) variableId: number
    ): Promise<StandardResponse<PromptTemplateVariable>> {
        const variable = await this.promptVariableService.getVariableById(variableId);
        return StandardResponse.success('Variable retrieved successfully', variable);
    }

    @Put(':variableId')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Update a prompt variable' })
    @ApiParam({ name: 'variableId', type: 'number', description: 'Prompt variable ID' })
    @ApiBody({
        description: 'Updated prompt variable data',
        type: UpdatePromptVariableDto,
        examples: {
            'Update Basic Fields': {
                value: {
                    display_name: 'Updated Company Risk Summary',
                    description: 'Updated description for the risk summary variable',
                    prompt: 'Generate an updated comprehensive risk summary for the organization'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Variable updated successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variable updated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        variable_name: { type: 'string', example: 'prompt_company_risk_summary_a1b2c3d4' },
                        display_name: { type: 'string', example: 'Updated Company Risk Summary' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Variable not found' })
    async updatePromptVariable(
        @Param('variableId', ParseIntPipe) variableId: number,
        @Body() data: UpdatePromptVariableDto
    ): Promise<StandardResponse<PromptTemplateVariable>> {
        const variable = await this.promptVariableService.updatePromptVariable(variableId, data);
        return StandardResponse.success('Variable updated successfully', variable);
    }

    @Delete(':variableId')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Soft delete a prompt variable' })
    @ApiParam({ name: 'variableId', type: 'number', description: 'Prompt variable ID' })
    @ApiResponse({
        status: 200,
        description: 'Variable deleted successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variable deleted successfully' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Variable not found' })
    async deletePromptVariable(
        @Param('variableId', ParseIntPipe) variableId: number
    ): Promise<StandardResponse<void>> {
        await this.promptVariableService.deletePromptVariable(variableId);
        return StandardResponse.success('Variable deleted successfully');
    }

    @Post(':variableId/test')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Test a prompt variable with mock context' })
    @ApiParam({ name: 'variableId', type: 'number', description: 'Prompt variable ID' })
    @ApiBody({
        description: 'Test context data',
        type: TestPromptVariableDto,
        examples: {
            'Test Context': {
                value: {
                    customer_id: "as3asf3",
                    application_id: "as3asf3",
                    standard_id: "as3asf3",
                    user_id: "as3asf3",
                    input_parameters: {
                        control_id: "AC-1"
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Variable test completed',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variable test completed' },
                data: { type: 'string', example: 'Generated content from AI based on the test context...' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid test context' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Variable not found' })
    async testPromptVariable(
        @Param('variableId', ParseIntPipe) variableId: number,
        @Body() testContext: TestPromptVariableDto
    ): Promise<StandardResponse<string>> {
        const result = await this.promptVariableService.testVariable(variableId, testContext);
        return StandardResponse.success('Variable test completed', result);
    }

    @Post(':variableId/duplicate')
    @Roles(UserRole.CSM)
    @ApiOperation({ summary: 'Duplicate an existing prompt variable' })
    @ApiParam({ name: 'variableId', type: 'number', description: 'Prompt variable ID to duplicate' })
    @ApiBody({
        description: 'Duplication options',
        type: DuplicatePromptVariableDto,
        examples: {
            'With Custom Name': {
                value: {
                    display_name: 'Company Risk Summary (Copy)'
                }
            },
            'Auto-generated Name': {
                value: {}
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Variable duplicated successfully',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: '200' },
                message: { type: 'string', example: 'Variable duplicated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 2 },
                        variable_name: { type: 'string', example: 'prompt_company_risk_summary_copy_b2c3d4e5' },
                        display_name: { type: 'string', example: 'Company Risk Summary (Copy)' },
                        description: { type: 'string', example: 'Generates a comprehensive risk summary for the organization' },
                        prompt: { type: 'string', example: 'Generate a comprehensive risk summary...' },
                        context_source: { type: 'string', example: 'customer.name, assessment.type, application.description' },
                        output_format: { type: 'string', example: 'HTML formatted text, maximum 300 words' },
                        type: { type: 'string', example: 'GLOBAL' },
                        group_id: { type: 'number', example: 1 },
                        specific_use_case: { type: 'boolean', example: false },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Variable not found' })
    async duplicatePromptVariable(
        @Request() req: any,
        @Param('variableId', ParseIntPipe) variableId: number,
        @Body() data: DuplicatePromptVariableDto
    ): Promise<StandardResponse<PromptTemplateVariable>> {
        const variable = await this.promptVariableService.duplicateVariable(
            variableId,
            req.user_data,
            data.display_name
        );
        return StandardResponse.success('Variable duplicated successfully', variable);
    }
} 