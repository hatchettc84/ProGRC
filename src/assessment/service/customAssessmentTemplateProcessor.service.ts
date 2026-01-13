import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash } from "crypto";
import { App } from "src/entities/app.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { Customer } from "src/entities/customer.entity";
import { Templates } from "src/entities/template.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { EntityManager, In, Repository } from "typeorm";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { AppUser, AppUserRole } from "src/entities/appUser.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { join } from "path";
import { promises as fs } from "fs";
import { LoggerService } from "src/logger/logger.service";
import { ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";
import { TaskStatus } from "src/entities/asyncTasks.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { UserComment } from "src/entities/userComment.entity";
import { decode } from "html-entities";
import { PromptVariableProcessor } from "src/prompt-variables/prompt-variable-processor.service";

@Injectable()
export class CustomAssessmentTemplateProcessor {
  private customerId: string;
  private appId: number;
  private standardId: number;
  private assessmentId: number;
  private templateId: number;
  private userId: string;
  constructor(
    @InjectRepository(App) private readonly appsRepo: Repository<App>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @InjectRepository(Templates)
    private readonly templateRepo: Repository<Templates>,
    @InjectRepository(TemplateSection)
    private readonly templateSectionRepo: Repository<TemplateSection>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(AssessmentDetail)
    private readonly assessmentRepo: Repository<AssessmentDetail>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(StandardControlMapping)
    private readonly standardControlMappingRepo: Repository<StandardControlMapping>,
    @InjectRepository(ApplicationControlMapping)
    private readonly applicationControlMappingRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(AppUser) private readonly appUsers: Repository<AppUser>,
    @InjectRepository(ControlChunkMapping)
    private readonly controlChunkMappingRepo: Repository<ControlChunkMapping>,
    @InjectRepository(SourceChunkMapping)
    private readonly SourceChunkMapping: Repository<SourceChunkMapping>,
    @InjectRepository(UserComment)
    private readonly userCommentRepo: Repository<UserComment>,
    private readonly entityManager: EntityManager,
    private readonly logger: LoggerService,
    private readonly promptVariableProcessor: PromptVariableProcessor
  ) { }

  private static readonly REPORT_SECTION = "Report";

  private placeholderMappings = {
    "{{app_name}}": async (values: any) => this.getValue(values.appName),
    "{{kovr_logo}}": async () => this.getKovrLogo(),
    "{{org_name}}": async (values: any) => this.getValue(values.orgName),
    "{{org_logo}}": async (values: any) => this.org_logo(values.customerId),
    "{{assessment_version}}": async (values: any) =>
      this.getValue(values.assessmentVersion),
    "{{assessment_updated_date}}": async (values: any) =>
      this.getValue(values.assessmentUpdatedDate),
    "{{org_designated_csm}}": async (values: any) =>
      this.getValue(values.orgDesignatedCsm),
    "{{app_description}}": async (values: any) =>
      this.getValue(values.appDescription),
    "{{standard_name}}": async (values: any) =>
      this.getValue(values.standardName),
    "{{total_controls_in_standard}}": (values: any) =>
      this.getValue(values.controlCountInStandard),
    "{{total_implemented_controls}}": (values: any) =>
      this.getValue(values.implementedControlCount),
    "{{total_partially_implemented_controls}}": (values: any) =>
      this.getValue(values.partiallyImplementedControlCount),
    "{{total_not_implemented_controls}}": (values: any) =>
      this.getValue(values.notImplementedControlCount),
    "{{total_excepted_controls}}": (values: any) =>
      this.getValue(values.exceptedControlCount),
    "{{control_family_name}}": async (values: any) =>
      this.getValue(values.controlFamilyName),
    "{{control_id}}": async (values: any) => this.getValue(values.controlName),
    "{{control_name}}": async (values: any) =>
      this.getValue(values.controlLongName),
    "{{control_text}}": async (values: any) =>
      this.getHtmlValue(values.controlText),
    "{{control_discussion}}": async (values: any) =>
      this.getHtmlValue(values.controlDiscussion),
    "{{control_additional_params}}": async (values: any) =>
      this.getHtmlValue(values.controlAdditionalParams),
    "{{app_admin}}": async (values: any) => this.getValue(values.appAdminName),
    "{{responsibility}}": async (values: any) =>
      this.getValue(values.responsibility),
    "{{implementation_status}}": async (values: any) =>
      this.getStatusHtml(values.implementationStatus),
    "{{implementation_explanation}}": async (values: any) =>
      this.getHtmlValue(values.implementationExplanation),
    "{{control_exception}}": async (values: any) =>
      this.getValue(values.controlExceptionReason),
    "{{list_of_referenced_sources}}": async (values: any) =>
      this.generateReferencedSourcesHtml(values.referencedSourcesList),
    "{{list_of_evidences}}": async (values: any) =>
      this.generateEvidencesHtml(values.evidencesList),
    "{{recommendation_plan_table}}": async (values: any) =>
      this.generateRecommendationPlanTable(values.recommendationPlansList),
    "{{control_section_title}}": async (values: any) =>
      this.generateControlSectionTitle(
        values.controlName,
        values.controlLongName
      ),
    "{{control_family_section_title}}": async (values: any) =>
      this.generateControlFamilySectionTitle(values.controlFamilyName),
    "{{app_auditor}}": async (values: any) => this.getValue(values.appAuditors),
    "{{standard_comments}}": async (values: any) =>
      this.generateCommentsTable(values.standardComments),
    "{{control_level_comments}}": async (values: any) =>
      this.generateCommentsTable(values.controlLevelComments),
    "{{implementation_status_checkboxes}}": async (values: any) =>
      this.generateImplementationStatusCheckboxes(values.implementationStatus),
    "{{policy_title}}": async (values: any) =>
      this.getValue(values.policyTitle),
    "{{purpose_statement}}": async (values: any) =>
      this.getHtmlValue(values.policyDescription),
    "{{policy_version}}": async (values: any) =>
      this.getValue(values.policyVersion),
    "{{policy_status}}": async (values: any) =>
      this.getValue(values.policyStatus),
    "{{policy_related_standards}}": async (values: any) =>
      this.getValue(values.policyRelatedStandards),
    "{{policy_app_name}}": async (values: any) =>
      this.getValue(values.policyAppName),
  };

  async processTemplate(
    templateId: number,
    appId: number,
    standardId: number,
    assessment: AssessmentDetail,
    asyncTask: AsyncTask,
    isEditableTemplate: boolean
  ): Promise<{
    assessmentOutline: AssessmentOutline;
    assessmentSections: AssessmentSections[];
  }> {
    try {
      this.logger.info(
        `Processing custom template with template_id: ${templateId} and app_id: ${appId} and standard_id: ${standardId} and isEditableTemplate: ${isEditableTemplate}`
      );
      const template = await this.templateRepo.findOne({
        where: { id: templateId },
        relations: ["sections", "sections.parentSection", "sections.children"],
        order: {
          sections: {
            id: "ASC", // Sorting the sections by id in ascending order
          },
        },
      });
      if (!template) {
        throw new NotFoundException(`Template with id ${templateId} not found`);
      }
      this.customerId = assessment.customer_id;
      this.appId = appId;
      this.standardId = standardId;
      this.assessmentId = assessment.id;
      this.templateId = templateId;
      this.userId = assessment.created_by;

      asyncTask.status = TaskStatus.IN_PROCESS;
      await this.asyncTaskRepo.save(asyncTask);
      let outline = [],
        sections = [];
      if (isEditableTemplate) {
        const result = await this.processEditableTemplateSections(
          template,
          appId,
          standardId,
          assessment
        );
        outline = result.outline;
        sections = result.sections;
      } else {
        const result = await this.processTemplateSections(
          template,
          appId,
          standardId,
          assessment
        );
        outline = result.outline;
        sections = result.sections;
      }
      const outlineHash = await this.generateMD5Hash(outline);

      const assessmentOutline = new AssessmentOutline();
      assessmentOutline.outline = outline;
      assessmentOutline.customer_id = assessment.customer_id;
      assessmentOutline.app_id = appId;
      assessmentOutline.assessment_id = assessment.id;
      assessmentOutline.version = 0;
      assessmentOutline.created_by = assessment.created_by;
      assessmentOutline.outline_hash = outlineHash;

      const assessmentSections = sections.map((section) => {
        const assessmentSection = new AssessmentSections();
        assessmentSection.customer_id = assessment.customer_id;
        assessmentSection.app_id = appId;
        assessmentSection.assessment_id = assessment.id;
        assessmentSection.section_id = section.section_id;
        assessmentSection.title = section.title;
        assessmentSection.version = 0;
        assessmentSection.created_by = assessment.created_by;
        assessmentSection.content = section.html;
        assessmentSection.content_hash = createHash("md5")
          .update(section.html)
          .digest("hex");
        return assessmentSection;
      });

      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(
            AssessmentOutline,
            assessmentOutline
          );
          await transactionalEntityManager.save(
            AssessmentSections,
            assessmentSections
          );
          assessment.is_locked = false;
          await transactionalEntityManager.save(AssessmentDetail, assessment);

          asyncTask.status = TaskStatus.PROCESSED;
          await transactionalEntityManager.save(AsyncTask, asyncTask);
        }
      );

      return { assessmentOutline, assessmentSections };
    } catch (error) {
      this.logger.error("Error processing template:", error.message);
      this.logger.error(error.stack);
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          assessment.is_locked = false;
          assessment.is_deleted = true;
          await transactionalEntityManager.save(AssessmentDetail, assessment);

          asyncTask.status = TaskStatus.FAILED;
          await transactionalEntityManager.save(AsyncTask, asyncTask);
        }
      );
    }
  }

  async generateMD5Hash(data: any): Promise<string> {
    const contentString =
      typeof data === "string" ? data : JSON.stringify(data);
    return createHash("md5").update(contentString).digest("hex");
  }

  private async processTemplateSections(
    template: Templates,
    appId: number,
    standardId: number,
    assessment: AssessmentDetail
  ): Promise<{ outline: any; sections: any[] }> {
    try {
      this.logger.info(
        `Processing custom template - Processing template sections for non-editable template with template_id: ${template.id} and app_id: ${appId} and standard_id: ${standardId}`
      );
      const outline = template.outline;
      const sections = [];

      const coverPageData = await this.getCoverPageData(assessment.id);
      const appStandardSummary = await this.getAppStandardSummary(
        appId,
        standardId
      );
      const controlFamilies = await this.getControlFamilies(appId, standardId);

      let sectionIndex = 0;
      const values = {
        appId,
        standardId,
        ...appStandardSummary,
        ...coverPageData,
      };
      for (const section of template.sections) {
        if (
          section.title === CustomAssessmentTemplateProcessor.REPORT_SECTION
        ) {
          const templateSectionHtml = section.html_content;
          const { outline: reportOutline, sections: reportSections } =
            await this.generateSections(
              controlFamilies,
              values,
              templateSectionHtml,
              sectionIndex
            );
          const filteredOutline = outline.filter(
            (outlineSection) =>
              !reportSections.some(
                (reportSection) =>
                  reportSection.section_id === outlineSection.id
              )
          );
          outline.length = 0;
          outline.push(...filteredOutline, ...reportOutline);
          reportSections.forEach((reportSection) => {
            if (reportSection.level === 3) {
              const pageBreakHtml =
                '<div style="page-break-after: always;"></div>';
              reportSection.html += pageBreakHtml;
            }

            sections.push({
              section_id: reportSection.section_id,
              title: reportSection.title,
              html: reportSection.html,
            });
          });
        } else {
          const replacedHtml = await this.replacePlaceholders(
            section.html_content,
            values
          );
          const $ = cheerio.load(replacedHtml, { xmlMode: true });
          $(" * ").each((index, element) => {
            const id = index === 0 ? section.section_id.toString() : uuidv4();
            $(element).attr("id", id);
            $(element).attr("data-custom-id", this.generateCustomId());
            if (["h1", "h2", "h3"].includes(element.tagName.toLowerCase())) {
              $(element).attr("style", "color:#4F138C;");
            }
          });

          const pageBreakHtml = '<div style="page-break-after: always;"></div>';
          const updatedHtml = decode($.html()) + pageBreakHtml;

          sections.push({
            section_id: section.section_id,
            title: section.title,
            html: updatedHtml,
          });
        }
        sectionIndex++;
      }

      return { outline, sections };
    } catch (error) {
      this.logger.error("Error processing template sections:", error);
      throw error;
    }
  }

  private async processEditableTemplateSections(
    template: Templates,
    appId: number,
    standardId: number,
    assessment: AssessmentDetail
  ): Promise<{ outline: any; sections: any[] }> {
    try {
      this.logger.info(
        `Processing custom template - Processing template sections for editable template with template_id: ${template.id} and app_id: ${appId} and standard_id: ${standardId}`
      );

      let outline = [];
      let sections = [];

      const coverPageData = await this.getCoverPageData(assessment.id);
      const appStandardSummary = await this.getAppStandardSummary(
        appId,
        standardId
      );
      const controlFamilies = await this.getControlFamilies(appId, standardId);
      const standardComments = await this.getStandardComments(
        appId,
        standardId
      );
      const appAuditors = await this.getAppAuditors(appId);

      let sectionIndex = 0;
      const values = {
        appId,
        standardId,
        ...appStandardSummary,
        ...coverPageData,
        standardComments,
        appAuditors,
      };
      for (const section of template.sections) {
        if (section.children.length > 0 && !section.parent_id) {
          const { outline: generatedOutline, sections: generatedSections } =
            await this.generateEditableSections(
              controlFamilies,
              values,
              sectionIndex,
              section,
              outline.length
            );
          const filteredOutline = outline.filter(
            (outlineSection) =>
              !generatedSections.some(
                (reportSection) =>
                  reportSection.section_id === outlineSection.id
              )
          );
          outline.length = 0;
          outline.push(...filteredOutline, ...generatedOutline);
          generatedSections.forEach((reportSection) => {
            const pageBreakHtml =
              '<div style="page-break-after: always;"></div>';
            reportSection.html += pageBreakHtml;

            sections.push({
              section_id: reportSection.section_id,
              title: reportSection.title,
              html: reportSection.html,
            });
          });
        } else if (!section.parent_id) {
          const replacedHtml = await this.replacePlaceholders(
            section.html_content,
            values
          );
          let updatedHtml = replacedHtml;
          if (replacedHtml) {
            const $ = cheerio.load(replacedHtml, { xmlMode: true });
            $(" * ").each((index, element) => {
              const id = index === 0 ? section.section_id.toString() : uuidv4();
              $(element).attr("id", id);
              $(element).attr("data-custom-id", this.generateCustomId());
            });

            const pageBreakHtml =
              '<div style="page-break-after: always;"></div>';
            updatedHtml = decode($.html()) + pageBreakHtml;
          }

          const sectionOutline = {
            section_id: section.section_id,
            title: section.title,
            level: 0,
            search_key: `${outline.length}`,
            children: [],
            version: 0,
          };

          outline.push(sectionOutline);

          sections.push({
            section_id: section.section_id,
            title: section.title,
            html: updatedHtml,
          });
        }
        sectionIndex++;
      }

      const orderedOutline = this.reorderGeneratedOutlineBasedOnTemplate(
        outline,
        template.outline
      );
      if (orderedOutline.length) {
        outline = orderedOutline;
      }
      return { outline, sections };
    } catch (error) {
      this.logger.error("Error processing template sections:", error);
      throw error;
    }
  }

  private async getAppAuditors(appId: number): Promise<string> {
    try {
      const appUsers = await this.appUsers.find({
        where: {
          app_id: appId,
          role: In([AppUserRole.AUDITOR, AppUserRole.CSM_AUDITOR]),
        },
        relations: ["user"],
      });
      return appUsers
        .reduce((acc, appUser) => {
          acc.push(`${appUser.user.name}(${appUser.user.email})`);
          return acc;
        }, [])
        .join(", ");
    } catch (error) {
      this.logger.error("Error fetching app auditors:", error);
      return "";
    }
  }

  private async getCoverPageData(assessmentId: number): Promise<any> {
    try {
      const query = `
                SELECT
                    a.app_id AS "appId",
                    a.updated_on AS "assessmentUpdatedDate",
                    coalesce(ao."version", 0) AS "assessmentVersion",
                    c.organization_name AS "orgName",
                    c.id AS "customerId",
                    (
                        SELECT STRING_AGG(u."name", ', ')
                        FROM customer_csms cc
                        JOIN users u ON u.id = cc.user_id
                        WHERE cc.customer_id = a.customer_id
                    ) AS "orgDesignatedCsm"
                FROM
                    assessment a
                LEFT JOIN assessment_outline ao ON ao.assessment_id = a.id
                JOIN customers c ON c.id = a.customer_id
                WHERE
                    a.id = $1;
            `;

      const result = await this.assessmentRepo.query(query, [assessmentId]);
      if (result.length === 0) {
        throw new NotFoundException(
          `Assessment with id ${assessmentId} not found`
        );
      }
      const coverPageData = result[0];

      coverPageData.assessmentUpdatedDate = new Date(
        coverPageData.assessmentUpdatedDate
      ).toUTCString();

      return coverPageData;
    } catch (error) {
      this.logger.error("Error fetching cover page data:", error);
      throw error;
    }
  }

  private async getControlFamilies(
    appId: number,
    standardId: number
  ): Promise<any> {
    try {
      const query = `select
                        acm.*,
                        cv.control_name as control_name,
                        cv.family_name as family_name,
                        cv.control_long_name as control_long_name,
                        cv.control_text as control_text,
                        cv.control_discussion as control_discussion,
                        cv.control_summary as control_summary,
                        cv.control_parent_id as control_parent_id,
                        cv.order_index as order_index,
                        cv.grouping_control_id as grouping_control_id,
                        cv.is_enhancement as is_enhancement,
                        cv.control_eval_criteria as control_eval_criteria,
                        scm.additional_selection_parameters as additional_selection_parameters,
                        scm.additional_guidance as additional_guidance
                    from
                        application_control_mapping_view acm
                    join control_view cv on
                        cv.id = acm.control_id
                    join app a on
                        a.id = acm.app_id
                    join standard s on
                        s.id = acm.standard_id
                    join app_standards as2 on
                        as2.app_id = acm.app_id
                        and as2.standard_id = acm.standard_id
                    join standard_control_mapping scm on
                        scm.control_id = acm.control_id
                        and scm.standard_id = acm.standard_id
                    where
                        acm.app_id = $1
                        and acm.standard_id = $2
                    order by
                        cv.family_name,
                        cv.order_index,
                        cv.grouping_control_id,
                        cv.id;`;
      const controlFamiliesData =
        await this.applicationControlMappingRepo.query(query, [
          appId,
          standardId,
        ]);
      this.logger.info(
        "Processing custom template - Control families data length:",
        controlFamiliesData?.length
      );
      // const controlFamiliesDataCopy = JSON.parse(JSON.stringify(controlFamiliesData));
      const evidenceQuery = `
                SELECT
                    ace.application_control_mapping_id,
                    ace.description,
                    ace.document
                FROM
                    application_control_evidence ace;
            `;
      const evidenceData = await this.entityManager.query(evidenceQuery);

      const recommendationsQuery = `
                SELECT
                    acr.application_id,
                    acr.control_id,
                    acr.standard_id,
                    acr.recommendation,
                    acr.status
                FROM
                    application_control_recommendation acr;
            `;

      const recommendationsData =
        await this.entityManager.query(recommendationsQuery);

      const controlReferenceSources = await this.getReferenceSourceData(appId);

      const appAdmins = await this.appUsers.find({
        where: { app_id: appId, role: AppUserRole.ADMIN },
        relations: ["user"],
      });
      const appAdminName = appAdmins
        .reduce((acc, appAdmin) => {
          acc.push(appAdmin.user.name);
          return acc;
        }, [])
        .join(", ");

      const aggregatedData = controlFamiliesData.reduce(
        (acc, controlFamily) => {
          const familyName = controlFamily.family_name;
          if (!acc[familyName]) {
            acc[familyName] = [];
          }
          acc[familyName].push({
            id: controlFamily.id,
            controlId: controlFamily.control_id,
            controlName: controlFamily.control_name,
            controlLongName: controlFamily.control_long_name,
            controlText: controlFamily.control_text,
            controlDiscussion: controlFamily.control_discussion,
            summary: controlFamily.control_summary,
            eval_criteria: controlFamily.control_eval_criteria,
            created_at: controlFamily.created_at,
            updated_at: controlFamily.updated_at,
            order_index: controlFamily.order_index,
            controlAdditionalParams:
              controlFamily.additional_selection_parameters,
            appAdminName: appAdminName,
            responsibility: "",
            isUserModifiedStatus: controlFamily.is_user_modified_status,
            implementationStatus: controlFamily.implementation_status
              ? controlFamily.implementation_status
              : "",
            isUserModifiedExplaination:
              controlFamily.is_user_modified_explanation,
            implementationExplanation: controlFamily.implementation_explanation,
            controlExceptionReason: controlFamily.exception_reason || "",
            referencedSourcesList:
              controlReferenceSources
                .filter(
                  (source) => source.control_id === controlFamily.control_id
                )
                .map((source) => source.name) || [],
            evidencesList:
              evidenceData && evidenceData.length > 0
                ? evidenceData.filter(
                  (e) => e.application_control_mapping_id === controlFamily.id
                )
                : [],
            recommendationPlansList:
              recommendationsData.filter(
                (recommendation) =>
                  recommendation.control_id === controlFamily.control_id &&
                  recommendation.standard_id === controlFamily.standard_id &&
                  recommendation.application_id === controlFamily.app_id
              ) || [],
          });
          return acc;
        },
        {}
      );

      Object.keys(aggregatedData).forEach((key) => {
        if (!Array.isArray(aggregatedData[key]) || key === "evidences") {
          delete aggregatedData[key];
        }
      });
      this.logger.info(
        "Processing custom template - Control families aggregated data length:",
        aggregatedData?.length
      );
      return aggregatedData;
    } catch (error) {
      this.logger.error("Error fetching control families:", error);
      throw error;
    }
  }

  async getReferenceSourceData(
    appId: number
  ): Promise<{ name: string; control_id: number }[]> {
    const query = `
            SELECT s.name, ccm.control_id 
            FROM control_chunk_mapping ccm
            INNER JOIN source_chunk_mapping scm ON scm.chunk_id = ccm.chunk_id
            INNER JOIN source s ON scm.source_id = s.id
            WHERE ccm.app_id = $1
            GROUP BY s.name, ccm.control_id;
        `;
    try {
      const result = await this.applicationControlMappingRepo.query(query, [
        appId,
      ]);
      return result;
    } catch (error) {
      this.logger.error("Error executing query:", error);
      return [];
    }
  }

  private async getAppStandardSummary(
    appId: number,
    standardId: number
  ): Promise<any> {
    try {
      const query = `
                SELECT 
                    app.id AS "appId",
                    app.name AS "appName",
                    app.desc AS "appDescription",
                    standard.name AS "standardName",
                    COUNT(standard_control_mapping.id) AS "controlCountInStandard",
                    COUNT(CASE WHEN acm.implementation_status = 'implemented' THEN 1 END) AS "implementedControlCount",
                    COUNT(CASE WHEN acm.implementation_status = 'partially_implemented' THEN 1 END) AS "partiallyImplementedControlCount",
                    COUNT(CASE WHEN acm.implementation_status = 'not_implemented' THEN 1 END) AS "notImplementedControlCount",
                    COUNT(CASE WHEN acm.implementation_status = 'exception' THEN 1 END) AS "exceptedControlCount"
                FROM 
                    app
                JOIN 
                    application_control_mapping_view acm ON app.id = acm.app_id
                JOIN 
                    standard_control_mapping ON acm.control_id = standard_control_mapping.control_id and acm.standard_id = standard_control_mapping.standard_id
                JOIN 
                    standard ON standard_control_mapping.standard_id = standard.id
                WHERE 
                    app.id = $1 AND acm.standard_id = $2
                GROUP BY 
                    app.id, app.name, app.desc, standard.name;
            `;

      const result = await this.appsRepo.query(query, [appId, standardId]);
      return result[0];
    } catch (error) {
      this.logger.error("Error fetching app standard summary:", error);
      throw new error();
    }
  }

  private async generateSections(
    controlFamilies: any[],
    values: any,
    templateSectionHtml: string,
    sectionIndex: number
  ): Promise<{ outline: any; sections: any[] }> {
    try {
      const outline = [];
      const sections = [];
      const $ = cheerio.load(templateSectionHtml, { xmlMode: true });
      const h1Tags = $("h1").toArray();

      for (const h1Element of h1Tags) {
        const h1Id = uuidv4();
        const h1CustomId = this.generateCustomId();
        const h1Text = $(h1Element).text();
        const h1Html = `<h1 id="${h1Id}" data-custom-id="${h1CustomId}" style="color:#4F138C;">${h1Text}</h1>`;
        let parentIndex = 0 + sectionIndex;
        const h1Section = {
          section_id: h1Id,
          title: h1Text,
          level: 1,
          search_key: `${parentIndex}`,
          children: [],
          version: 0,
        };

        let h1Content = await this.replacePlaceholders(h1Html, values);
        sections.push({
          section_id: h1Id,
          html: h1Content,
          title: h1Text,
          level: 1,
        });

        for (const [familyKey, family] of Object.entries(controlFamilies)) {
          if (familyKey.trim() === "evidences") {
            continue;
          }
          const h2Id = uuidv4();
          const h2CustomId = this.generateCustomId();
          const h2Text = familyKey;
          const h2Html = `<h2 id="${h2Id}" data-custom-id="${h2CustomId}" style="color:#4F138C;">${h2Text}</h2>`;
          const h2Section = {
            section_id: h2Id,
            title: h2Text,
            level: 2,
            search_key: `${parentIndex}_${familyKey}`,
            children: [],
            version: 0,
          };
          values = { ...values, controlFamilyName: familyKey };
          let h2Content = await this.replacePlaceholders(h2Html, values);
          sections.push({
            section_id: h2Id,
            html: h2Content,
            title: h2Text,
            level: 2,
          });

          for (const [controlIndex, control] of family.entries()) {
            const h3Id = uuidv4();
            const h3CustomId = this.generateCustomId();
            const h3Text = `${control.controlName} ${control.controlLongName}`;
            const h3Html = `<h3 id="${h3Id}" data-custom-id="${h3CustomId}" style="color:#4F138C;">${h3Text}</h3>`;
            let sectionTitle = await this.generateControlSectionTitle(
              control.controlName,
              control.controlLongName
            );
            const h3Section = {
              section_id: h3Id,
              title: sectionTitle,
              level: 3,
              search_key: `${parentIndex}_${familyKey}_${controlIndex}`,
              children: [],
              version: 0,
            };

            values = { ...values, ...control };
            let h3Content = h3Html;

            const childElements = $("h3").nextUntil("h3, h2, h1").toArray();
            const replacedElements = await Promise.all(
              childElements.map(async (element) => {
                const elementId = uuidv4();
                const elementCustomId = this.generateCustomId();
                $(element).attr("id", elementId);
                $(element).attr("data-custom-id", elementCustomId);
                return decode($.html(element));
              })
            );

            h3Content += replacedElements.join("");

            // Call replacePlaceholders once when h3Content is ready
            h3Content = await this.replacePlaceholders(h3Content, values);

            h2Section.children.push(h3Section);
            sections.push({
              section_id: h3Id,
              html: h3Content,
              title: sectionTitle,
              level: 3,
            });
          }

          h1Section.children.push(h2Section);
        }

        outline.push(h1Section);
      }

      return { outline, sections };
    } catch (error) {
      this.logger.error("Error generating sections:", error);
      throw error;
    }
  }

  private async generateEditableSections(
    controlFamilies: any[],
    values: any,
    sectionIndex: number,
    section: TemplateSection,
    parentIndex: number
  ): Promise<{ outline: any; sections: any[] }> {
    try {
      const outline = [];
      const sections = [];

      const h1Id = section.section_id;
      const h1CustomId = this.generateCustomId();
      const sectionTitle = await this.replacePlaceholders(
        section.title,
        values
      );
      const h1Section = {
        section_id: h1Id,
        title: sectionTitle,
        level: 0,
        search_key: `${parentIndex}`,
        children: [],
        version: 0,
      };
      let h1Content = section.html_content;
      if (h1Content) {
        h1Content = await this.replacePlaceholders(
          section.html_content,
          values
        );
        const $ = cheerio.load(h1Content, { xmlMode: true });
        $(" * ").each((index, element) => {
          const id = index === 0 ? h1Id : uuidv4();
          $(element).attr("id", id);
          $(element).attr("data-custom-id", this.generateCustomId());
        });
        h1Content = decode($.html());
      }
      sections.push({
        section_id: h1Id,
        html: h1Content,
        title: sectionTitle,
        level: 0,
      });

      for (const child of section.children) {
        const childSection = await this.templateSectionRepo.findOne({
          where: { id: child.id },
          relations: ["children"],
        });
        if (childSection.is_looped) {
          for (const [familyKey, family] of Object.entries(controlFamilies)) {
            if (familyKey.trim() === "evidences") {
              continue;
            }
            const h2Id = uuidv4();
            const h2CustomId = this.generateCustomId();
            const h2Text =
              childSection.title === "{{control_family_section_title}}"
                ? familyKey
                : childSection.title;
            const h2Html = childSection.html_content;
            const h2Section = {
              section_id: h2Id,
              title: h2Text,
              level: 1,
              search_key: `${parentIndex}_${familyKey}`,
              children: [],
              version: 0,
            };
            values = { ...values, controlFamilyName: familyKey };
            let h2Content = h2Html;
            if (h2Content) {
              h2Content = await this.replacePlaceholders(h2Html, values);
              const $1 = cheerio.load(h2Content, { xmlMode: true });
              $1(" * ").each((index, element) => {
                const id = index === 0 ? h2Id : uuidv4();
                $1(element).attr("id", id);
                $1(element).attr("data-custom-id", this.generateCustomId());
              });
              h2Content = decode($1.html());
            }
            sections.push({
              section_id: h2Id,
              html: h2Content,
              title: h2Text,
              level: 1,
            });
            if (
              childSection.children.length > 0 &&
              childSection.children[0].is_looped
            ) {
              const gcSection = childSection.children[0];
              for (const [controlIndex, control] of family.entries()) {
                const controlComments = await this.getControlLevelComments(
                  values.appId,
                  values.standardId,
                  control.control_id
                );
                values = {
                  ...values,
                  ...control,
                  controlLevelComments: controlComments,
                };
                const h3Id = uuidv4();
                const h3CustomId = this.generateCustomId();
                const h3Text = `${control.controlName} ${control.controlLongName}`;
                const h3Html = gcSection.html_content;
                let sectionTitle =
                  gcSection.title === "{{control_section_title}}"
                    ? await this.generateControlSectionTitle(
                      control.controlName,
                      control.controlLongName
                    )
                    : await this.replacePlaceholders(gcSection.title, values);
                const h3Section = {
                  section_id: h3Id,
                  title: sectionTitle,
                  level: 2,
                  search_key: `${parentIndex}_${familyKey}_${controlIndex}`,
                  children: [],
                  version: 0,
                };

                // Call replacePlaceholders once when h3Content is ready
                let h3Content = h3Html;
                if (h3Content) {
                  h3Content = await this.replacePlaceholders(h3Html, values);

                  const $2 = cheerio.load(h3Content, { xmlMode: true });
                  $2(" * ").each((index, element) => {
                    const id = index === 0 ? h3Id : uuidv4();
                    $2(element).attr("id", id);
                    $2(element).attr("data-custom-id", this.generateCustomId());
                  });
                  h3Content = decode($2.html());
                }

                h2Section.children.push(h3Section);
                sections.push({
                  section_id: h3Id,
                  html: h3Content,
                  title: sectionTitle,
                  level: 2,
                });
              }
            }

            h1Section.children.push(h2Section);
          }
        } else {
          const { innerOutline, innerSections } =
            await this.generateSectionHtml(
              values,
              `${parentIndex}`,
              1,
              childSection
            );
          h1Section.children.push(...innerOutline);
          sections.push(...innerSections);
        }
      }

      outline.push(h1Section);

      return { outline, sections };
    } catch (error) {
      this.logger.error("Error generating sections:", error);
      throw error;
    }
  }

  private async generateSectionHtml(
    values: any,
    parent_search_key: string,
    level: number,
    child_section: TemplateSection
  ): Promise<{ innerOutline: any[]; innerSections: any[] }> {
    try {
      const section = await this.templateSectionRepo.findOne({
        where: { id: child_section.id },
        relations: ["children"],
      });
      const outline = [];
      const sections = [];
      let replacedHtml = section.html_content;
      if (section.html_content) {
        const $ = cheerio.load(section.html_content, { xmlMode: true });

        // Generate custom IDs and replace placeholders
        $("*").each((index, element) => {
          const id = index === 0 ? section.section_id.toString() : uuidv4();
          $(element).attr("id", id);
          $(element).attr("data-custom-id", this.generateCustomId());
        });

        replacedHtml = await this.replacePlaceholders(decode($.html()), values);
      }

      // Create the current section
      const currentSection = {
        section_id: section.section_id,
        html: replacedHtml,
        title: section.title,
        level: level,
      };

      sections.push(currentSection);

      // Create the current outline
      const currentOutline = {
        section_id: section.section_id,
        title: section.title,
        level: level,
        search_key: parent_search_key,
        children: [],
        version: 0,
      };

      // Process children sections recursively
      if (section.children && section.children.length > 0) {
        for (let i = 0; i < section.children.length; i++) {
          const childSection = section.children[i];
          const childSearchKey = `${parent_search_key}_${i}`;
          const { innerOutline: childOutline, innerSections: childSections } =
            await this.generateSectionHtml(
              values,
              childSearchKey,
              level + 1,
              childSection
            );
          currentOutline.children.push(...childOutline);
          sections.push(...childSections);
        }
      }

      outline.push(currentOutline);

      return { innerOutline: outline, innerSections: sections };
    } catch (error) {
      this.logger.error("Error generating section html:", error);
      throw error;
    }
  }

  private async replacePlaceholders(
    html: string,
    values: any
  ): Promise<string> {
    if (html && html.length > 0) {
      for (const placeholder in this.placeholderMappings) {
        const replacement = await this.placeholderMappings[placeholder](values);
        const regex = new RegExp(placeholder, "g");

        html = html.replace(regex, replacement);
      }

      // Remove \n characters globally
      // html = html.replace(/\n/g, '');
    } else {
      html = "";
    }
    try {
      html = await this.promptVariableProcessor.processTemplate(html, {
        customer_id: this.customerId || undefined,
        application_id: this.appId || undefined,
        user_id: this.userId || undefined,
        standard_id: this.standardId || undefined,
        assessment_id: this.assessmentId || undefined,
      });
    } catch (error) {
      this.logger.error("Error replacing placeholders:", error);
    }
    return html;
  }

  private async generateControlSectionTitle(
    controlName: string,
    controlLongName: string
  ): Promise<string> {
    let sectionTitle = controlName;
    if (controlLongName) {
      let controlTitleArray = controlLongName.split("|");
      if (controlTitleArray.length > 1) {
        sectionTitle += ` ${controlTitleArray[1].trim()}`;
      } else {
        sectionTitle += ` ${controlLongName.trim()}`;
      }
    }
    return sectionTitle;
  }

  private async getStandardComments(
    appId: number,
    standardId: number
  ): Promise<UserComment[]> {
    return await this.userCommentRepo.find({
      where: {
        app_id: appId,
        standard_id: standardId,
      },
      relations: ["createdByUser", "modifiedByUser"],
    });
  }

  private async getControlLevelComments(
    appId: number,
    standardId: number,
    controlId: number
  ): Promise<UserComment[]> {
    return await this.userCommentRepo.find({
      where: {
        app_id: appId,
        standard_id: standardId,
        control_id: controlId,
      },
      relations: ["createdByUser", "modifiedByUser"],
    });
  }

  private async generateControlFamilySectionTitle(
    familyName: string
  ): Promise<string> {
    return familyName;
  }

  private async getKovrLogo(): Promise<string> {
    const filePath = join(
      __dirname,
      "../../public/images/data-uri/kovr-logo-black-and-white.txt"
    );
    const dataUri = await fs.readFile(filePath, "utf-8");
    return `<img style="width:50%;height:auto" src="${dataUri}" />`;
  }

  private async org_logo(customerId: string): Promise<string> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });
    return customer && customer.logo_image_key
      ? '<img style="width:30%;height:auto" src=' +
      customer.logo_image_key +
      " />"
      : "";
  }

  private async getValue(value: any): Promise<string> {
    return value !== null && value !== undefined ? value : " ";
  }

  private async getHtmlValue(value: any): Promise<string> {
    if (!value || (value && value.trim() === "")) {
      return "<span></span>";
    } else {
      return `<pre class="unstyled-pre">${value}</pre>`;
    }
  }

  private async getStatusHtml(status: string): Promise<string> {
    let color = "black";
    const id = uuidv4();
    const customId = this.generateCustomId();
    if (status === ApplicationControlMappingStatus.IMPLEMENTED) {
      color = "green";
    } else if (
      status === ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED
    ) {
      color = "orange";
    } else if (status === ApplicationControlMappingStatus.NOT_IMPLEMENTED) {
      color = "red";
    } else if (
      status === ApplicationControlMappingStatus.NOT_APPLICABLE ||
      status === ApplicationControlMappingStatus.NA
    ) {
      color = "gray";
    } else if (
      status === ApplicationControlMappingStatus.ALTERNATIVE_IMPLEMENTATION
    ) {
      color = "pink";
    } else if (status === ApplicationControlMappingStatus.EXCEPTION) {
      color = "green";
    } else if (status === ApplicationControlMappingStatus.PLANNED) {
      color = "blue";
    } else {
      return "";
    }
    return `<span id="${uuidv4()}" data-custom-id="${this.generateCustomId()}" style="color:${color};">${status.replace("_", " ").toUpperCase()}</span>`;
  }

  private async generateImplementationStatusCheckboxes(
    status: string
  ): Promise<string> {
    return `<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.IMPLEMENTED ? "checked" : ""}> Implemented</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED ? "checked" : ""}> Partially Implemented</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.PLANNED ? "checked" : ""}> Planned</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.ALTERNATIVE_IMPLEMENTATION ? "checked" : ""}> Alternative Implementation</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.NOT_IMPLEMENTED ? "checked" : ""}> Not Implemtented</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.NOT_APPLICABLE || status === ApplicationControlMappingStatus.NA ? "checked" : ""}> Not Applicable</p>
<p dir="ltr"><input name="implementation_status" type="checkbox" ${status === ApplicationControlMappingStatus.EXCEPTION ? "checked" : ""}> Exception</p>
    `;
  }

  private async generateReferencedSourcesHtml(
    referencedSourceslist: any[]
  ): Promise<string> {
    if (!referencedSourceslist || referencedSourceslist.length === 0) {
      return `<div id="${uuidv4()}" data-custom-id="${this.generateCustomId()}">No artifacts present</div>`;
    }

    const $ = cheerio.load(
      `<ul id="${uuidv4()}" data-custom-id="${this.generateCustomId()}"></ul>`,
      { xmlMode: true }
    );
    const ul = $("ul");

    referencedSourceslist.forEach((source) => {
      const li = $("<li></li>");
      li.attr("id", uuidv4());
      li.attr("data-custom-id", this.generateCustomId());
      li.text(source);
      ul.append(li);
    });

    return decode($.html());
  }

  private async generateEvidencesHtml(evidencesList: any[]): Promise<string> {
    if (!evidencesList || evidencesList.length === 0) {
      return `<div id="${uuidv4()}" data-custom-id="${this.generateCustomId()}">No evidendences present</div>`;
    }

    const $ = cheerio.load(
      `<ul id="${uuidv4()}" data-custom-id="${this.generateCustomId()}"></ul>`,
      { xmlMode: true }
    );
    const ul = $("ul");

    evidencesList.forEach((evidence) => {
      const li = $("<li></li>");
      li.attr("id", uuidv4());
      li.attr("data-custom-id", this.generateCustomId());

      const label = $("<label></label>");
      label.attr("id", uuidv4());
      label.attr("data-custom-id", this.generateCustomId());

      const strong = $("<strong></strong>");
      strong.attr("id", uuidv4());
      strong.attr("data-custom-id", this.generateCustomId());
      const evidencesFilePathArray = evidence.document.split("/");
      const fileName =
        evidencesFilePathArray[evidencesFilePathArray.length - 1];
      strong.text(this.substringAfterSecondOccurrence(fileName, "_"));

      const p = $("<div></div>");
      p.attr("id", uuidv4());
      p.attr("data-custom-id", this.generateCustomId());
      p.text(evidence.description);

      label.append(strong);
      li.append(label);
      li.append(p);
      ul.append(li);
    });

    return decode($.html());
  }

  private async generateRecommendationPlanTable(
    recommendationPlansList: any[]
  ): Promise<string> {
    if (!recommendationPlansList || recommendationPlansList.length === 0) {
      return `<div id="${uuidv4()}" data-custom-id="${this.generateCustomId()}">No recommendation plans present</div>`;
    }

    const $ = cheerio.load(
      `<table id="${uuidv4()}" data-custom-id="${this.generateCustomId()}" style="border-collapse: collapse; width: 100%;"></table>`,
      { xmlMode: true }
    );
    const table = $("table");

    // Create table header
    const thead = $("<thead></thead>");
    thead.attr("id", uuidv4());
    thead.attr("data-custom-id", this.generateCustomId());

    const headerRow = $("<tr></tr>");
    headerRow.attr("id", uuidv4());
    headerRow.attr("data-custom-id", this.generateCustomId());

    const headers = ["S.No.", "Recommendation", "Status"];
    headers.forEach((headerText) => {
      const th = $("<th></th>");
      th.attr("id", uuidv4());
      th.attr("data-custom-id", this.generateCustomId());
      th.text(headerText);
      th.css({
        border: "1px solid black",
        padding: "8px",
        "text-align": "left",
      });
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);

    // Create table body
    const tbody = $("<tbody></tbody>");
    tbody.attr("id", uuidv4());
    tbody.attr("data-custom-id", this.generateCustomId());

    recommendationPlansList.forEach((rPlan, index) => {
      const row = $("<tr></tr>");
      row.attr("id", uuidv4());
      row.attr("data-custom-id", this.generateCustomId());

      const serialNumberCell = $("<td></td>");
      serialNumberCell.attr("id", uuidv4());
      serialNumberCell.attr("data-custom-id", this.generateCustomId());
      serialNumberCell.text(index + 1 + "");
      serialNumberCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      const recommendationCell = $("<td></td>");
      recommendationCell.attr("id", uuidv4());
      recommendationCell.attr("data-custom-id", this.generateCustomId());
      recommendationCell.text(rPlan.recommendation);
      recommendationCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      const statusCell = $("<td></td>");
      statusCell.attr("id", uuidv4());
      statusCell.attr("data-custom-id", this.generateCustomId());
      statusCell.text(rPlan.status);
      statusCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      row.append(serialNumberCell);
      row.append(recommendationCell);
      row.append(statusCell);
      tbody.append(row);
    });
    table.append(tbody);

    return decode($.html());
  }

  private async generateCommentsTable(
    comments: UserComment[]
  ): Promise<string> {
    if (!comments || comments.length === 0) {
      return `<div id="${uuidv4()}" data-custom-id="${this.generateCustomId()}">No comments present</div>`;
    }

    const $ = cheerio.load(
      `<table id="${uuidv4()}" data-custom-id="${this.generateCustomId()}" style="border-collapse: collapse; width: 100%;"></table>`,
      { xmlMode: true }
    );
    const table = $("table");

    // Create table header
    const thead = $("<thead></thead>");
    thead.attr("id", uuidv4());
    thead.attr("data-custom-id", this.generateCustomId());

    const headerRow = $("<tr></tr>");
    headerRow.attr("id", uuidv4());
    headerRow.attr("data-custom-id", this.generateCustomId());

    const headers = [
      "Comment",
      "Created By",
      "Modified By",
      "Created At",
      "Modified At",
    ];
    headers.forEach((headerText) => {
      const th = $("<th></th>");
      th.attr("id", uuidv4());
      th.attr("data-custom-id", this.generateCustomId());
      th.text(headerText);
      th.css({
        border: "1px solid black",
        padding: "8px",
        "text-align": "left",
      });
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);

    // Create table body
    const tbody = $("<tbody></tbody>");
    tbody.attr("id", uuidv4());
    tbody.attr("data-custom-id", this.generateCustomId());

    comments.forEach((c, index) => {
      const row = $("<tr></tr>");
      row.attr("id", uuidv4());
      row.attr("data-custom-id", this.generateCustomId());

      const commentCell = $("<td></td>");
      commentCell.attr("id", uuidv4());
      commentCell.attr("data-custom-id", this.generateCustomId());
      commentCell.text(c.comment);
      commentCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      const createdDateCell = $("<td></td>");
      createdDateCell.attr("id", uuidv4());
      createdDateCell.attr("data-custom-id", this.generateCustomId());
      createdDateCell.text(new Date(c.created_at).toUTCString());
      createdDateCell.css({
        border: "1px solid black",
        padding: "8px",
      });
      const createdByCell = $("<td></td>");
      createdByCell.attr("id", uuidv4());
      createdByCell.attr("data-custom-id", this.generateCustomId());
      createdByCell.text(`${c.createdByUser.name}(${c.createdByUser.email})`);
      createdByCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      const modifiedDateCell = $("<td></td>");
      modifiedDateCell.attr("id", uuidv4());
      modifiedDateCell.attr("data-custom-id", this.generateCustomId());
      modifiedDateCell.text(new Date(c.updated_at).toUTCString());
      modifiedDateCell.css({
        border: "1px solid black",
        padding: "8px",
      });
      const modifiedByCell = $("<td></td>");
      modifiedByCell.attr("id", uuidv4());
      modifiedByCell.attr("data-custom-id", this.generateCustomId());
      modifiedByCell.text(
        `${c.modifiedByUser.name}(${c.modifiedByUser.email})`
      );
      modifiedByCell.css({
        border: "1px solid black",
        padding: "8px",
      });

      row.append(commentCell);
      row.append(createdDateCell);
      row.append(createdByCell);
      row.append(modifiedDateCell);
      row.append(modifiedByCell);
      tbody.append(row);
    });
    table.append(tbody);

    return decode($.html());
  }

  private generateCustomId(length = 8) {
    const characters = "1234567890abcdefghijklmniopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  private substringAfterSecondOccurrence(input, char) {
    // Find the first occurrence of the character
    const splits = input.split(char);
    if (splits.length < 2) {
      return input;
    }
    return splits.slice(2).join(char);
  }

  private reorderGeneratedOutlineBasedOnTemplate(
    outline: any[],
    templateOutline: any[]
  ): any[] {
    const reorderedOutline = [];

    // Helper function to recursively reorder sections
    const reorderSections = (
      outlineSections: any[],
      templateSections: any[]
    ): any[] => {
      const reordered = [];
      const remainingSections = [...outlineSections];

      for (const templateSection of templateSections) {
        const sectionIndex = remainingSections.findIndex(
          (s) => s.section_id === templateSection.section_id
        );
        if (sectionIndex !== -1) {
          const section = remainingSections.splice(sectionIndex, 1)[0];
          if (section.children && templateSection.children) {
            section.children = reorderSections(
              section.children,
              templateSection.children
            );
          }
          reordered.push(section);
        }
      }

      // Append remaining sections that were not found in the template
      reordered.push(...remainingSections);

      return reordered;
    };

    return reorderSections(outline, templateOutline);
  }
}
