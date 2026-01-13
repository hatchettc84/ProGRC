import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Poam, PoamPriority, PoamStatus } from "src/entities/poam.entity";
import { CreatePoamDto } from "./dto/create-poam.dto";
import { UpdatePoamDto } from "./dto/update-poam.dto";
import { AppUser } from "src/entities/appUser.entity";
import { User } from "src/entities/user.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { App } from "src/entities/app.entity";
import { TaskOps } from "src/entities/asyncTasks.entity";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { SyncJiraDto } from "./dto/sync-jira.dto";
import { ApplicationControlMapping, ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { ApplicationControlRecommendation, RecommendationStatus } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { LoggerService } from "src/logger/logger.service";
import { GeneratePoamAiDto } from "./dto/generate-poam-ai.dto";

@Injectable()
export class PoamService {
  constructor(
    @InjectRepository(Poam)
    private readonly poamRepository: Repository<Poam>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppUser)
    private readonly appUserRepository: Repository<AppUser>,
    @InjectRepository(App)
    private readonly appRepository: Repository<App>,
    @InjectRepository(CustomerCsm)
    private readonly customerCsm: Repository<CustomerCsm>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMappingRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @InjectRepository(ApplicationControlRecommendation)
    private readonly recommendationRepo: Repository<ApplicationControlRecommendation>,
    private readonly syncComplianceV2Service: SyncComplianceV2Service,
    private readonly aiHelper: AiHelperService,
    private readonly logger: LoggerService
  ) {}

  async create(
    userId: string,
    createPoamDto: CreatePoamDto,
    application_id: number
  ): Promise<Poam> {
    const poam = this.poamRepository.create({
      ...createPoamDto,
      created_by: userId,
      updated_by: userId,
      application_id: application_id,
    });
    return this.poamRepository.save(poam);
  }

  async findAll(applicationId: number): Promise<Poam[]> {
    const poams = await this.poamRepository
      .createQueryBuilder("poam")
      .leftJoinAndSelect(
        "control",
        "control",
        "control.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.control_ids)))"
      )
      .leftJoinAndSelect(
        "standard",
        "standard",
        "standard.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.standard_ids)))"
      )
      .select([
        "poam.id",
        "poam.jira_id",
        "poam.title",
        "poam.description",
        "poam.status",
        "poam.priority",
        "poam.control_ids",
        "poam.standard_ids",
        "poam.application_id",
        "poam.current_assigned",
        "poam.base_recommendation_grouping",
        "poam.created_at",
        "poam.updated_at",
        "poam.created_by",
        "poam.updated_by",
        "json_agg(DISTINCT jsonb_build_object('id', control.id, 'control_name', control.control_name)) as control_details",
        "json_agg(DISTINCT jsonb_build_object('id', standard.id, 'name', standard.name)) as standard_details",
      ])
      .where("poam.application_id = :applicationId", { applicationId })
      .groupBy("poam.id")
      .orderBy("poam.created_at", "DESC")
      .getRawMany();

    // Transform the raw results to match the Poam entity structure
    return poams.map((poam) => {
      const transformedPoam = {
        id: poam.poam_id,
        jira_id: poam.poam_jira_id,
        title: poam.poam_title,
        description: poam.poam_description,
        status: poam.poam_status,
        priority: poam.poam_priority,
        control_ids: poam.poam_control_ids || [],
        standard_ids: poam.poam_standard_ids || [],
        application_id: poam.poam_application_id,
        current_assigned: poam.poam_current_assigned,
        base_recommendation_grouping:
          poam.poam_base_recommendation_grouping || [],
        created_at: poam.poam_created_at,
        updated_at: poam.poam_updated_at,
        created_by: poam.poam_created_by,
        updated_by: poam.poam_updated_by,
        control_details: [],
        standard_details: [],
      };

      // Add controls and standards if they exist
      if (poam.control_details) {
        transformedPoam.control_details = poam.control_details.filter(
          (control) => control.id !== null
        );
      }
      if (poam.standard_details) {
        transformedPoam.standard_details = poam.standard_details.filter(
          (standard) => standard.id !== null
        );
      }

      return transformedPoam;
    });
  }

  async findOne(id: string, applicationId: number): Promise<Poam> {
    const poam = await this.poamRepository.findOne({
      where: { id, application_id: applicationId },
    });

    if (!poam) {
      throw new NotFoundException(`POAM with ID ${id} not found`);
    }

    return poam;
  }

  async update(
    userId: string,
    id: string,
    applicationId: number,
    updatePoamDto: UpdatePoamDto
  ): Promise<Poam> {
    const poam = await this.findOne(id, applicationId);

    Object.assign(poam, {
      ...updatePoamDto,
      updated_by: userId,
    });

    return this.poamRepository.save(poam);
  }

  async remove(id: string, applicationId: number): Promise<void> {
    const poam = await this.findOne(id, applicationId);
    await this.poamRepository.remove(poam);
  }

  async validateApplicationAccess(
    applicationId: number,
    userData: any
  ): Promise<boolean> {
    const userId = userData.userId;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const role = user.role_id;
    const customerId = userData.customerId;

    if (Number(role) === Number(UserRole.SuperAdmin)) {
      return true;
    }

    if (Number(role) === Number(UserRole.OrgAdmin)) {
      const app = await this.appRepository.findOne({
        where: { id: Number(applicationId) },
      });

      if (!app) {
        return false;
      }

      if (app.customer_id !== customerId) {
        return false;
      }
      return true;
    }

    if (Number(role) === Number(UserRole.CSM)) {
      const customerCsm = await this.customerCsm.findOne({
        where: { customer_id: customerId, user_id: userId },
      });

      if (!customerCsm) {
        return false;
      }
      return true;
    }

    const appUser = await this.appUserRepository.findOne({
      where: { app_id: applicationId, user_id: userData.userId },
    });

    if (!appUser) {
      return false;
    }
    return true;
  }

  async triggerPomGeneration(
    userId: string,
    customerId: string,
    appId: number
  ): Promise<void> {
    let message: Record<string, any> = {
      taskId: null,
      appId: appId,
      customer_id: customerId,
      msg_entity_type: TaskOps.GENERATE_POAM,
      sourceId: 0,
      sourceVersionId: 0,
      sourceTypeId: 0,
      currentVersionFileLocation: "",
      previousVersionId: 0,
      previousVersionFileLocation: "",
    };

    await this.syncComplianceV2Service.publishToQueue(
      userId,
      customerId,
      appId,
      [],
      [],
      "poam"
    );
  }

  async syncWithJira(
    userId: string,
    customerId: string,
    appId: number
  ): Promise<void> {}

  async syncSelectedWithJira(
    userId: string,
    customerId: string,
    appId: number,
    body: SyncJiraDto
  ): Promise<void> {}

  async findFilteredPoams(
    applicationId: number,
    standardId?: string,
    controlId?: string
  ): Promise<Poam[]> {
    const queryBuilder = this.poamRepository
      .createQueryBuilder("poam")
      .leftJoinAndSelect(
        "control",
        "control",
        "control.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.control_ids)))"
      )
      .leftJoinAndSelect(
        "standard",
        "standard",
        "standard.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.standard_ids)))"
      )
      .select([
        "poam.id",
        "poam.jira_id",
        "poam.title",
        "poam.description",
        "poam.status",
        "poam.priority",
        "poam.control_ids",
        "poam.standard_ids",
        "poam.application_id",
        "poam.current_assigned",
        "poam.base_recommendation_grouping",
        "poam.created_at",
        "poam.updated_at",
        "poam.created_by",
        "poam.updated_by",
        "json_agg(DISTINCT jsonb_build_object('id', control.id, 'control_name', control.control_name)) as control_details",
        "json_agg(DISTINCT jsonb_build_object('id', standard.id, 'name', standard.name)) as standard_details",
      ])
      .where("poam.application_id = :applicationId", { applicationId });

    if (standardId) {
      queryBuilder.andWhere(
        ":standardId = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.standard_ids)))",
        { standardId }
      );
    }

    if (controlId) {
      queryBuilder.andWhere(
        ":controlId = ANY(ARRAY(SELECT jsonb_array_elements_text(poam.control_ids)))",
        { controlId }
      );
    }

    const poams = await queryBuilder
      .groupBy("poam.id")
      .orderBy("poam.created_at", "DESC")
      .getRawMany();

    // Transform the raw results to match the Poam entity structure
    return poams.map((poam) => {
      const transformedPoam = {
        id: poam.poam_id,
        jira_id: poam.poam_jira_id,
        title: poam.poam_title,
        description: poam.poam_description,
        status: poam.poam_status,
        priority: poam.poam_priority,
        control_ids: poam.poam_control_ids || [],
        standard_ids: poam.poam_standard_ids || [],
        application_id: poam.poam_application_id,
        current_assigned: poam.poam_current_assigned,
        base_recommendation_grouping:
          poam.poam_base_recommendation_grouping || [],
        created_at: poam.poam_created_at,
        updated_at: poam.poam_updated_at,
        created_by: poam.poam_created_by,
        updated_by: poam.poam_updated_by,
        control_details: [],
        standard_details: [],
      };

      // Add controls and standards if they exist
      if (poam.control_details) {
        transformedPoam.control_details = poam.control_details.filter(
          (control) => control.id !== null
        );
      }
      if (poam.standard_details) {
        transformedPoam.standard_details = poam.standard_details.filter(
          (standard) => standard.id !== null
        );
      }

      return transformedPoam;
    });
  }

  /**
   * Generate POAMs using AI from control gaps
   */
  async generatePoamsFromControlGaps(
    userId: string,
    applicationId: number,
    dto: GeneratePoamAiDto
  ): Promise<Poam[]> {
    // Find non-compliant controls
    const whereClause: any = {
      app_id: applicationId,
      implementation_status: In([
        ApplicationControlMappingStatus.NOT_IMPLEMENTED,
        ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED,
      ]),
    };

    if (dto.controlIds && dto.controlIds.length > 0) {
      whereClause.control_id = In(dto.controlIds);
    }

    if (dto.standardId) {
      whereClause.standard_id = dto.standardId;
    }

    const nonCompliantControls = await this.appControlMappingRepo.find({
      where: whereClause,
      relations: ['control', 'standard'],
    });

    if (nonCompliantControls.length === 0) {
      this.logger.log('No non-compliant controls found for POAM generation');
      return [];
    }

    const generatedPoams: Poam[] = [];

    // Group controls by standard for batch processing
    const controlsByStandard = new Map<number, ApplicationControlMapping[]>();
    for (const controlMapping of nonCompliantControls) {
      const standardId = controlMapping.standard_id;
      if (!controlsByStandard.has(standardId)) {
        controlsByStandard.set(standardId, []);
      }
      controlsByStandard.get(standardId)!.push(controlMapping);
    }

    // Generate POAMs for each control
    for (const controlMapping of nonCompliantControls) {
      try {
        const poam = await this.generatePoamForControl(
          userId,
          applicationId,
          controlMapping,
          dto.context
        );
        if (poam) {
          generatedPoams.push(poam);
        }
      } catch (error) {
        this.logger.error(`Error generating POAM for control ${controlMapping.control_id}:`, error);
      }
    }

    return generatedPoams;
  }

  /**
   * Generate a single POAM for a control using AI
   */
  private async generatePoamForControl(
    userId: string,
    applicationId: number,
    controlMapping: ApplicationControlMapping,
    additionalContext?: string
  ): Promise<Poam | null> {
    const control = await this.controlRepo.findOne({
      where: { id: controlMapping.control_id },
    });

    if (!control) {
      return null;
    }

    const standard = await this.standardRepo.findOne({
      where: { id: controlMapping.standard_id },
    });

    // Get recommendations for this control
    const recommendations = await this.recommendationRepo.find({
      where: {
        application_id: applicationId,
        control_id: controlMapping.control_id,
        standard_id: controlMapping.standard_id,
        status: RecommendationStatus.NEW as any,
      },
      take: 5,
    });

    // Build prompt for AI
    const prompt = this.buildPoamGenerationPrompt(
      control,
      standard,
      controlMapping,
      recommendations,
      additionalContext
    );

    const systemMessage = `You are a GRC (Governance, Risk, and Compliance) expert specializing in creating Plans of Action and Milestones (POAMs). 
Generate professional, actionable POAMs that help organizations remediate compliance gaps.`;

    interface PoamGenerationResponse {
      title: string;
      description: string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      suggested_steps?: string[];
    }

    const aiResponse = await this.aiHelper.generateStructuredResponse<PoamGenerationResponse>(
      prompt,
      systemMessage,
      {
        temperature: 0.5,
        max_tokens: 1500,
      }
    );

    if (!aiResponse) {
      this.logger.warn(`AI failed to generate POAM for control ${controlMapping.control_id}`);
      // Fallback to basic POAM
      return this.createFallbackPoam(userId, applicationId, controlMapping, control, standard);
    }

    // Map AI priority to enum
    let priority: PoamPriority = PoamPriority.MEDIUM;
    switch (aiResponse.priority?.toLowerCase()) {
      case 'critical':
        priority = PoamPriority.CRITICAL;
        break;
      case 'high':
        priority = PoamPriority.HIGH;
        break;
      case 'low':
        priority = PoamPriority.LOW;
        break;
      default:
        priority = PoamPriority.MEDIUM;
    }

    // Create POAM
    const poam = this.poamRepository.create({
      title: aiResponse.title || `Remediate ${control.control_name}`,
      description: aiResponse.description || `Address compliance gap for ${control.control_name}`,
      priority,
      status: PoamStatus.UNASSIGNED,
      application_id: applicationId,
      control_ids: [controlMapping.control_id.toString()],
      standard_ids: [controlMapping.standard_id.toString()],
      created_by: userId,
      updated_by: userId,
      base_recommendation_grouping: recommendations.map((r) => ({
        id: r.id,
        recommendation: r.recommendation,
      })),
    });

    return await this.poamRepository.save(poam);
  }

  /**
   * Build prompt for POAM generation
   */
  private buildPoamGenerationPrompt(
    control: Control,
    standard: Standard | null,
    controlMapping: ApplicationControlMapping,
    recommendations: ApplicationControlRecommendation[],
    additionalContext?: string
  ): string {
    const recommendationsText = recommendations.length > 0
      ? recommendations.map((r, i) => `${i + 1}. ${r.recommendation}`).join('\n')
      : 'No specific recommendations available.';

    return `Generate a Plan of Action and Milestones (POAM) for the following compliance gap:

Control Information:
- Control Name: ${control.control_name}
- Control ID: ${control.id}
- Control Description: ${control.control_text.substring(0, 500)}...
- Control Family: ${control.family_name}
- Standard: ${standard?.name || 'Unknown'}
- Current Status: ${controlMapping.implementation_status}
- Risk Level: ${controlMapping.risk_level || 'Not specified'}

Implementation Gap:
${controlMapping.user_implementation_explanation 
  ? JSON.stringify(controlMapping.user_implementation_explanation).substring(0, 500)
  : 'No explanation provided'}

Existing Recommendations:
${recommendationsText}

${additionalContext ? `Additional Context: ${additionalContext}\n` : ''}

Generate a POAM with:
1. A clear, actionable title (max 100 characters)
2. A detailed description explaining the gap and remediation approach (2-3 paragraphs)
3. Priority level (Critical, High, Medium, or Low) based on risk and control importance
4. Optional: Suggested remediation steps

Return a JSON object with: title, description, priority, and optionally suggested_steps array.`;
  }

  /**
   * Create a fallback POAM when AI generation fails
   */
  private createFallbackPoam(
    userId: string,
    applicationId: number,
    controlMapping: ApplicationControlMapping,
    control: Control,
    standard: Standard | null
  ): Poam {
    return this.poamRepository.create({
      title: `Remediate ${control.control_name}`,
      description: `Address compliance gap for ${control.control_name} (${control.family_name}). Current status: ${controlMapping.implementation_status}.`,
      priority: PoamPriority.MEDIUM,
      status: PoamStatus.UNASSIGNED,
      application_id: applicationId,
      control_ids: [controlMapping.control_id.toString()],
      standard_ids: [controlMapping.standard_id.toString()],
      created_by: userId,
      updated_by: userId,
      base_recommendation_grouping: [],
    });
  }
}
