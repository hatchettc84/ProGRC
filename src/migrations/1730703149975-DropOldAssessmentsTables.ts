import { MigrationInterface, QueryRunner } from "typeorm";

export class DropOldAssessmentsTables1730703149975 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP TABLE IF EXISTS "assessment_source";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "assessment_versions";
        `);
        
        await queryRunner.query(`
            DROP TABLE IF EXISTS "assessment_info";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "sections";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "section_versions";
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "assessment_standards";
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "assessment_source" (
                "id" UUID PRIMARY KEY,
                "assessment_id" UUID,
                "asset_id" UUID,
                "created_at" TIMESTAMP,
                "created_by" UUID,
                CONSTRAINT "FK_assessment_source_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_assessment_source_asset_id" FOREIGN KEY ("asset_id") REFERENCES "app_assets"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "assessment_versions" (
                "id" SERIAL PRIMARY KEY,
                "assessmentId" integer,
                "version" integer NOT NULL,
                "sectionTree" character varying,
                "createdAt" TIMESTAMP NOT NULL,
                CONSTRAINT "FK_assessment" FOREIGN KEY ("assessmentId") REFERENCES "assessment_info"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "assessment_info" (
                "id" UUID PRIMARY KEY,
                "title" VARCHAR NOT NULL,
                "app_id" integer,
                "template_id" UUID,
                "organization_id" integer,
                "llm_enabled" BOOLEAN DEFAULT false,
                "metadata" VARCHAR,
                "created_at" TIMESTAMP,
                "created_by" UUID,
                "deleted_at" TIMESTAMP,
                "updated_at" TIMESTAMP,
                CONSTRAINT "FK_assessment_info_app_id" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_assessment_info_template_id" FOREIGN KEY ("template_id") REFERENCES "organization_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_assessment_info_organization_id" FOREIGN KEY ("organization_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
                CONSTRAINT "FK_assessment_info_created_by" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "sections" (
                "id" UUID PRIMARY KEY,
                "title" VARCHAR NOT NULL,
                "sequence" integer DEFAULT -1,
                "level" integer DEFAULT 1,
                "assessment_id" UUID,
                "parentSectionId" UUID,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                CONSTRAINT "FK_sections_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_sections_parentSectionId" FOREIGN KEY ("parentSectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "section_versions" (
                "id" SERIAL PRIMARY KEY,
                "section_id" UUID NOT NULL,
                "version" integer NOT NULL,
                "content" TEXT NOT NULL,
                "is_latest" BOOLEAN DEFAULT true,
                "previousVersionId" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_section_versions_section_id" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_section_versions_previousVersionId" FOREIGN KEY ("previousVersionId") REFERENCES "section_versions"("id") ON DELETE SET NULL ON UPDATE NO ACTION
            );
        `);

        await queryRunner.query(`
            CREATE TABLE "assessment_standards" (
                "assessment_id" UUID NOT NULL,
                "standard_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("assessment_id", "standard_id"),
                CONSTRAINT "FK_assessment_standards_assessment_id" FOREIGN KEY ("assessment_id") REFERENCES "assessment_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            );
        `);

    }

}
