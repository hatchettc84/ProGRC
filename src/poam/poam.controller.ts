import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, ForbiddenException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PoamService } from './poam.service';
import { CreatePoamDto } from './dto/create-poam.dto';
import { UpdatePoamDto } from './dto/update-poam.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/authGuard';
import { UserRole } from 'src/masterData/userRoles.entity';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { Poam } from 'src/entities/poam.entity';
import { StandardResponse } from 'src/common/dto/standardResponse.dto';
import { SyncJiraDto } from './dto/sync-jira.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GeneratePoamAiDto } from './dto/generate-poam-ai.dto';

@ApiTags('POAM')
@ApiBearerAuth()
@Controller('poams/:app_id')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class PoamController {
  constructor(private readonly poamService: PoamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new POAM' })
  @ApiResponse({ 
    status: 201, 
    description: 'POAM created successfully',
    type: StandardResponse<Poam>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async create(@Request() req: any, @Param('app_id') application_id: number, @Body() createPoamDto: CreatePoamDto) {
    const hasAccess = await this.poamService.validateApplicationAccess(application_id, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poam = await this.poamService.create(req['user_data']['userId'], createPoamDto, application_id );
    return StandardResponse.success('POAM created successfully', poam);
  }

  @Get("list")
  @ApiOperation({ summary: 'Get all POAMs for an application' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all POAMs',
    type: StandardResponse<Poam[]>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async findAll(@Request() req, @Param('app_id') appId: number) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poams = await this.poamService.findAll(appId);
    return StandardResponse.success('POAMs retrieved successfully', poams);
  }

  @Get('poam/:id')
  @ApiOperation({ summary: 'Get a POAM by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the POAM',
    type: StandardResponse<Poam>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async findOne(
    @Request() req,
    @Param('id') id: string,
    @Param('app_id') appId: number,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poam = await this.poamService.findOne(id, appId);
    return StandardResponse.success('POAM retrieved successfully', poam);
  }

  @Patch('poam/:id')
  @ApiOperation({ summary: 'Update a POAM' })
  @ApiResponse({ 
    status: 200, 
    description: 'POAM updated successfully',
    type: StandardResponse<Poam>
  })
  @Roles(UserRole.OrgMember, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Param('app_id') appId: number,
    @Body() updatePoamDto: UpdatePoamDto,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poam = await this.poamService.update(req['user_data']['userId'], id, appId, updatePoamDto);
    return StandardResponse.success('POAM updated successfully', poam);
  }

  @Delete('poam/:id')
  @ApiOperation({ summary: 'Delete a POAM' })
  @ApiResponse({ 
    status: 200, 
    description: 'POAM deleted successfully',
    type: StandardResponse<void>
  })
  @Roles(UserRole.OrgMember, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async remove(
    @Request() req,
    @Param('id') id: string,
    @Param('app_id') appId: number,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    await this.poamService.remove(id, appId);
    return StandardResponse.success('POAM deleted successfully', null);
  }

  @Post('trigger-generation')
  @ApiOperation({ summary: 'Trigger POAM generation' })
  @ApiResponse({ 
    status: 200, 
    description: 'POAM generation triggered successfully',
    type: StandardResponse<void>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async triggerGeneration(
    @Request() req,
    @Param('app_id') appId: number
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    await this.poamService.triggerPomGeneration(
      req['user_data']['userId'],
      req['user_data']['customerId'],
      appId
    );
    return StandardResponse.success('POAM generation triggered successfully', null);
  }

  @Post('sync/jira/all')
  @ApiOperation({ summary: 'Sync POAMs with Jira' })
  @ApiResponse({ 
    status: 200, 
    description: 'Jira sync triggered successfully',
    type: StandardResponse<void>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async syncJira(
    @Request() req,
    @Param('app_id') appId: number,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    await this.poamService.syncWithJira(
      req['user_data']['userId'],
      req['user_data']['customerId'],
      appId
    );
    return StandardResponse.success('Jira sync triggered successfully', null);
  }

  @Post('sync/jira')
  @ApiOperation({ summary: 'Sync POAMs with Jira' })
  @ApiResponse({ 
    status: 200, 
    description: 'Jira sync triggered successfully',
    type: StandardResponse<void>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async syncJiraSingle(
    @Request() req,
    @Param('app_id') appId: number,
    @Body() body: SyncJiraDto,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    await this.poamService.syncSelectedWithJira(
      req['user_data']['userId'],
      req['user_data']['customerId'],
      appId,
      body
    );
    return StandardResponse.success('Jira sync triggered successfully', null);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get POAMs filtered by application, standard and control' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return filtered POAMs',
    type: StandardResponse<Poam[]>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async getFilteredPoams(
    @Request() req,
    @Param('app_id') appId: number,
    @Query('standardId') standardId?: string,
    @Query('controlId') controlId?: string,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poams = await this.poamService.findFilteredPoams(appId, standardId, controlId);
    return StandardResponse.success('POAMs retrieved successfully', poams);
  }

  @Post('generate-ai')
  @ApiOperation({ summary: 'Generate POAMs using AI from control gaps' })
  @ApiResponse({ 
    status: 200, 
    description: 'POAMs generated successfully',
    type: StandardResponse<Poam[]>
  })
  @Roles(UserRole.OrgAdmin, UserRole.OrgMember, UserRole.CSM, UserRole.SuperAdmin)
  async generatePoamsAi(
    @Request() req,
    @Param('app_id') appId: number,
    @Body() dto: GeneratePoamAiDto,
  ) {
    const hasAccess = await this.poamService.validateApplicationAccess(appId, req['user_data']);
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this application');
    }
    const poams = await this.poamService.generatePoamsFromControlGaps(
      req['user_data']['userId'],
      appId,
      dto
    );
    return StandardResponse.success('POAMs generated successfully', poams);
  }
} 