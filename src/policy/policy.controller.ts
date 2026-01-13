import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { SectorService } from './sector.service';
import { AuthGuard } from 'src/guards/authGuard';
import { Roles } from 'src/decorators/roles.decorator';
import * as metadata from "src/common/metadata";
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { Sector } from 'src/entities/sector.entity';
import { CreatePolicyDto } from './dto/createPolicy.dto';
import { UpdatePolicyContentDto } from './dto/updatePolicyContent.dto';
import { Templates } from 'src/entities/template.entity';
import { UpdatePolicyDetailsDto } from './dto/updatePolicyDetails.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PolicyDetails } from 'src/entities/policyDetails.entity';

const userRoles = metadata["userRoles"];

@ApiTags('Policies')
@Controller('policies')
@ApiBearerAuth()
export class PolicyController {
  constructor(
    private readonly policyService: PolicyService,
    private readonly sectorService: SectorService
  ) {}

  @Get('sectors')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Get all available sectors' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of all sectors',
    schema: {
      properties: {
        code: { type: 'string', example: '200' },
        message: { type: 'string', example: 'success' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Technology' },
              description: { type: 'string', example: 'Companies involved in software, hardware, IT services, and digital solutions' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  async getSectors(): Promise<StandardResponse<Sector[]>> {
    const sectors = await this.sectorService.findAll();
    return StandardResponse.success('Sectors retrieved successfully', sectors);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new policy' })
  @ApiBody({
    type: CreatePolicyDto,
    description: 'Policy creation data',
    examples: {
      example1: {
        value: {
          policyName: 'Sample Policy',
          sector: 'Technology',
          standards: [1, 2],
          appIds: [1, 2],
          s3Urls: ['https://example.com/path/to/file1.pdf', 'https://example.com/path/to/file2.pdf'],
          remarks: 'Sample remarks',
          templateId: 1
        },
        summary: 'Sample policy creation request'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: PolicyDetails
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Policy with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cannot create policy with duplicate name "Sample Policy". Policy names must be unique within your organization.',
        error: 'Duplicate policy name'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  async createPolicy(@Req() req: any, @Body() createPolicyDto: CreatePolicyDto): Promise<StandardResponse<any>> {
    const policy = await this.policyService.create(req['user_data'], createPolicyDto);
    return StandardResponse.success('Policy created successfully', policy, '201');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Get all policies' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all policies',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policies retrieved successfully',
        data: [
          {
            id: '1',
            policyName: 'Sample Policy',
            version: '1.0',
            description: 'Sample policy description',
            customerName: 'Sample Company',
            sector: 'Technology',
            standards: ['ISO27001', 'SOC2'],
            is_locked: true,
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z',
            updateBy: 'user123',
            content: {
              htmlContent: '<!DOCTYPE html><html><body><h1>Policy Content</h1></body></html>'
            }
          }
        ]
      }
    }
  })
  async findAll(@Req() req) {
    const policies = await this.policyService.findAll(req['user_data']);
    return new StandardResponse('success', 'Policies retrieved successfully', policies);
  }

  @Get('policy/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Get a policy by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a policy by ID',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy retrieved successfully',
        data: {
          id: '1',
          policyName: 'Sample Policy',
          version: '1.0',
          description: 'Sample policy description',
          customerName: 'Sample Company', 
          sector: 'Technology',
          standards: ['ISO27001', 'SOC2'],
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  async findOne(@Req() req: any, @Param('id') id: number) {
    const policy = await this.policyService.findOne(id);
    return new StandardResponse('success', 'Policy retrieved successfully', policy);
  }

  @Put(':id/content')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Update policy content' })
  @ApiResponse({
    status: 200,
    description: 'Policy content updated successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy content updated successfully',
        data: {
          id: '1',
          policyName: 'Sample Policy',
          version: '1.0',
          description: 'Updated policy description',
          content: '<!DOCTYPE html><html><body><h1>Updated Policy Content</h1></body></html>',
          customerName: 'Sample Company',
          sector: 'Technology',
          standards: ['ISO27001', 'SOC2'],
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  async updatePolicyContent(
    @Param('id') id: string,
    @Body() updatePolicyContentDto: UpdatePolicyContentDto
  ): Promise<StandardResponse<any>> {
    const policy = await this.policyService.updatePolicyContent(id, updatePolicyContentDto);
    return StandardResponse.success('Policy content updated successfully', policy);
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Get all policy templates' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all policy templates',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy templates retrieved successfully',
        data: [
          {
            id: 1,
            name: 'Access Control Policy',
            content: {
              htmlContent: '<!DOCTYPE html><html><body><h1>Access Control Policy</h1></body></html>'
            },
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:00:00Z',
            createdBy: 'admin'
          }
        ]
      }
    }
  })
  async getAllPolicyTemplates(): Promise<StandardResponse<Templates[]>> {
    const templates = await this.policyService.findAllPolicyTemplates();
    return StandardResponse.success('Policy templates retrieved successfully', templates);
  }

  @Get('templates/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Get a policy template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a policy template by ID',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy template retrieved successfully',
        data: {
          id: 1,
          name: 'Access Control Policy',
          content: {
            htmlContent: '<!DOCTYPE html><html><body><h1>Access Control Policy</h1></body></html>'
          },
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          createdBy: 'admin'
        }
      }
    }
  })
  async getPolicyTemplateById(@Param('id') id: string): Promise<StandardResponse<Templates>> {
    const template = await this.policyService.findPolicyTemplateById(Number(id));
    return StandardResponse.success('Policy template retrieved successfully', template);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Clone an existing policy' })
  @ApiResponse({
    status: 201,
    description: 'Policy cloned successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy cloned successfully',
        data: {
          id: '2',
          policyName: 'Sample Policy (Copy)',
          version: '1.0',
          description: 'Sample policy description',
          customerName: 'Sample Company',
          sector: 'Technology',
          standards: ['ISO27001', 'SOC2'],
          is_locked: false,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Policy with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cannot clone policy with duplicate name "Sample Policy (Copy)". Policy names must be unique within your organization.',
        error: 'Duplicate policy name'
      }
    }
  })
  async clonePolicy(
    @Param('id') id: string,
    @Body('policyName') policyName: string,
    @Req() req: any
  ): Promise<StandardResponse<any>> {
    const clonedPolicy = await this.policyService.clonePolicy(id, policyName, req['user_data']);
    return StandardResponse.success('Policy cloned successfully', clonedPolicy, '201');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Update policy details' })
  @ApiResponse({
    status: 200,
    description: 'Policy details updated successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy details updated successfully',
        data: {
          id: '1',
          policyName: 'Updated Policy Name',
          version: '1.0',
          description: 'Updated description',
          sector: 'Technology',
          standards: ['ISO27001', 'SOC2'],
          remarks: 'Updated remarks',
          customerName: 'Sample Company',
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Policy with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cannot update policy with duplicate name "Updated Policy Name". Policy names must be unique within your organization.',
        error: 'Duplicate policy name'
      }
    }
  })
  async updatePolicyDetails(
    @Param('id') id: string,
    @Body() updatePolicyDetailsDto: UpdatePolicyDetailsDto
  ): Promise<StandardResponse<any>> {
    const policy = await this.policyService.updatePolicyDetails(id, updatePolicyDetailsDto);
    return StandardResponse.success('Policy details updated successfully', policy);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Delete a policy' })
  @ApiResponse({
    status: 200,
    description: 'Policy deleted successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy deleted successfully',
        data: null
      }
    }
  })
  async deletePolicy(@Param('id') id: string): Promise<StandardResponse<void>> {
    await this.policyService.deletePolicy(id);
    return StandardResponse.success('Policy deleted successfully');
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Delete a policy template' })
  @ApiResponse({
    status: 200,
    description: 'Policy template deleted successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy template deleted successfully',
        data: null
      }
    }
  })
  async deletePolicyTemplate(@Param('id') id: string): Promise<StandardResponse<void>> {
    await this.policyService.deletePolicyTemplate(Number(id));
    return StandardResponse.success('Policy template deleted successfully');
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Change policy status' })
  @ApiResponse({
    status: 200,
    description: 'Policy status updated successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy status updated successfully',
        data: {
          id: '1',
          policyName: 'Sample Policy',
          version: '1.0',
          description: 'Sample policy description',
          status: 'published',
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  async changePolicyStatus(
    @Param('id') id: string,
    @Body('status') status: 'published' | 'draft'
  ): Promise<StandardResponse<any>> {
    const policy = await this.policyService.changePolicyStatus(id, status);
    return StandardResponse.success('Policy status updated successfully', policy);
  }

  @Post(':id/lock')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Lock or unlock a policy' })
  @ApiResponse({
    status: 200,
    description: 'Policy lock status updated successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy lock status updated successfully',
        data: {
          id: '1',
          policyName: 'Sample Policy',
          version: '1.0',
          description: 'Sample policy description',
          status: 'published',
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  async togglePolicyLock(
    @Param('id') id: string,
    @Body('is_locked') is_locked: boolean
  ): Promise<StandardResponse<any>> {
    const policy = await this.policyService.togglePolicyLock(id, is_locked);
    return StandardResponse.success('Policy lock status updated successfully', policy);
  }

  @Post('test/lock/:id')
  @ApiOperation({ summary: 'Test endpoint to manually lock or unlock a policy' })
  @ApiResponse({
    status: 200,
    description: 'Policy lock status updated successfully',
    type: StandardResponse,
    schema: {
      example: {
        status: 'success',
        message: 'Policy lock status updated successfully',
        data: {
          id: '1',
          policyName: 'Sample Policy',
          version: '1.0',
          description: 'Sample policy description',
          status: 'published',
          is_locked: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          updateBy: 'user123'
        }
      }
    }
  })
  async testTogglePolicyLock(
    @Param('id') id: string,
    @Body('is_locked') is_locked: boolean
  ): Promise<StandardResponse<any>> {
    try {
      const policy = await this.policyService.togglePolicyLock(id, is_locked);
      return StandardResponse.success('Policy lock status updated successfully', policy);
    } catch (error) {
      return StandardResponse.error(error.message, null, error.status || 500);
    }
  }

  @Post('test/sqs')
  @ApiOperation({ summary: 'Test endpoint to manually trigger SQS message' })
  async testSqsMessage(@Body() body: any): Promise<StandardResponse<any>> {
    await this.policyService.handleMessage(body
    );
    return StandardResponse.success('SQS message triggered successfully');
  }

  @Post('generate-from-controls')
  @UseGuards(JwtAuthGuard)
  @Roles(userRoles.org_admin, userRoles.org_member)
  @ApiOperation({ summary: 'Generate policy content from control requirements using AI' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        controlIds: { type: 'array', items: { type: 'number' } },
        standardId: { type: 'number' },
        policyName: { type: 'string' },
      },
      required: ['controlIds', 'standardId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Policy content generated successfully' })
  async generatePolicyFromControls(
    @Body('controlIds') controlIds: number[],
    @Body('standardId') standardId: number,
    @Body('policyName') policyName?: string
  ): Promise<StandardResponse<any>> {
    const result = await this.policyService.generatePolicyFromControls(
      controlIds,
      standardId,
      policyName
    );
    return StandardResponse.success('Policy content generated successfully', result);
  }
  
} 