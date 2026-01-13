import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1727715600559 implements MigrationInterface {
    name = 'InitialMigration1727715600559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION generate_unique_short_id()
                RETURNS VARCHAR(255) AS $$
            DECLARE
                short_id VARCHAR(8);
            BEGIN
                LOOP
                    -- Generate a random short ID (8 characters from md5 hash)
                    short_id := substring(md5(gen_random_uuid()::text), 1, 8);

                    -- Check if this ID already exists
                    IF NOT EXISTS (SELECT 1 FROM customers WHERE id = short_id) THEN
                        -- If it doesn't exist, return the generated ID
                        RETURN short_id;
                    END IF;
                    -- Otherwise, loop and try generating again
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        `)
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"user_roles" ("id" integer NOT NULL, "role_name" character varying NOT NULL, "is_org_role" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        // await queryRunner.query(`CREATE TABLE IF NOT EXISTS"organization_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invite_status" character varying, "organization_id" integer NOT NULL, "owner_id" BIGINT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_89bde91f78d36ca41e9515d91c" UNIQUE ("user_id"), CONSTRAINT "PK_c2b39d5d072886a4d9c8105eb9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"customers" ("id" varchar(255) NOT NULL PRIMARY KEY default generate_unique_short_id(), "logo_image_key" character varying, "owner_id" uuid, "organization_name" character varying DEFAULT 'N/A', "license_type" character varying, "created_by" uuid, "updated_by" uuid, "is_onboarding_complete" boolean DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(), "deleted" boolean DEFAULT false)`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"app" ("id" bigserial not null, "name" character varying, "desc" character varying, "url" character varying, "tags" jsonb, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "customer_id" varchar(255) NOT NULL, "owner_id" uuid, CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"users" ("id" uuid NOT NULL, "name" character varying, "mobile" character varying, "customer_id" varchar(255), "invite_status" varchar, "profile_image_key" character varying,  "email" character varying NOT NULL, "role_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), deleted BOOLEAN DEFAULT FALSE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"standards" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "path" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb084ce5e29cc74efe0befbefa8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"templates" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "location" character varying, "standard_id" integer, "upload_date" TIMESTAMP DEFAULT now(), "update_date" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"customer_standards" ("id" BIGSERIAL NOT NULL PRIMARY KEY, "customer_id" varchar(255), "standard_id" integer, "created_by" uuid, "updated_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), deleted boolean DEFAULT false)`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"async_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_type" varchar, "entity_id" uuid NOT NULL, "application_id" uuid, "customer_id" varchar(255) NOT NULL, "is_notified" boolean NOT NULL, "task_status" varchar NOT NULL, "request_payload" json NOT NULL, "response_payload" json, "metadata" json, "created_by" uuid NOT NULL, "updated_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55c9f8d137022cc1f6e1179e740" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"customer_templates" ("id" BIGSERIAL NOT NULL PRIMARY KEY, "customer_id" varchar(255), "template_id" integer, "created_by" uuid, "updated_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), deleted boolean DEFAULT false)`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"app_source_types" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_6356e84fa1e0db89fdc45f4d70f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"app_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset_name" character varying, "source_type_id" integer, "app_id" bigint, "detailed_info" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP, "created_by_user_id" uuid, "updated_by_user_id" uuid, CONSTRAINT "PK_e00695c1141809a09a6a9df285a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "doc_id" character varying NOT NULL, "section_id" character varying NOT NULL, "element_id" character varying, "comment" character varying NOT NULL, "selected_text" character varying, "created_at" TIMESTAMP NOT NULL, "user_id" varchar NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"assessment_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assessment_id" uuid NOT NULL, "asset_id" uuid NOT NULL, "created_at" TIMESTAMP, "created_by" character varying, CONSTRAINT "PK_76df7640db77a4b6f7c7da12350" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"assessment_versions" ("id" SERIAL NOT NULL, "version" integer NOT NULL, "sectionTree" character varying, "createdAt" TIMESTAMP NOT NULL, "assessmentId" uuid, CONSTRAINT "PK_7c132bd1b96001adf3601276ce3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"assessment_info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "standard_id" integer, "app_id" bigint, "template_id" uuid, "organization_id" integer, "llm_enabled" boolean DEFAULT false, "metadata" character varying, "created_at" TIMESTAMP, "created_by" VARCHAR, CONSTRAINT "PK_c67f48474247a1655963a9f77f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"sections" ("id" uuid NOT NULL, "title" character varying NOT NULL, "sequence" integer DEFAULT '-1', "level" integer DEFAULT '1', "assessment_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parentSectionId" uuid, CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"section_versions" ("id" SERIAL NOT NULL, "section_id" uuid NOT NULL, "version" integer NOT NULL, "content" text NOT NULL, "is_latest" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "previousVersionId" integer, CONSTRAINT "PK_a74aace07572ab9c39e75f3e14f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"source_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "template_schema" json, "created_by" uuid NOT NULL, "updated_by" uuid, CONSTRAINT "PK_52dade85f5b5ba376917fd78b60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"source_version" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_id" uuid NOT NULL, "file_bucket_key" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7120afca650453a53403e5d01c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" varchar(255) NOT NULL, "source_type" uuid NOT NULL, "current_version" uuid, "app_id" bigint NOT NULL, "data" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_018c433f8264b58c86363eaadde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"source_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_afb53509093dc5c96c99d447de3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"source_asset_version" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploaded_key" text NOT NULL, "processed_bucket_key" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, CONSTRAINT "PK_640f1071ff3b383cb2ca51d4cd4" PRIMARY KEY ("id"))`);

        // await queryRunner.query(`CREATE INDEX "IDX_7062a4fbd9bab22ffd918e5d3d" ON "organization_members" ("organization_id")`);
        // await queryRunner.query(`CREATE INDEX "IDX_89bde91f78d36ca41e9515d91c" ON "organization_members" ("user_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_699e2e992cd6e7aa61f61d4f62" ON "customers" ("created_by")`);
        await queryRunner.query(`CREATE INDEX "IDX_58abbde566ba5e2b78fb170792" ON "customers" ("updated_by")`);

        await queryRunner.query(`CREATE INDEX "IDX_592312630bcf16bc4872f8fd4a" ON "app" ("created_by")`);
        await queryRunner.query(`CREATE INDEX "IDX_973904d503c734212cdb43be4b" ON "app" ("updated_by")`);
        await queryRunner.query(`CREATE INDEX "IDX_0a0d871e841c6c7d3d6d4d1c9a" ON "app" ("customer_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_a2cecd1a3531c0b041e29ba46e" ON "users" ("role_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_a3aa5306fb39624c7162a44b7e" ON "templates" ("standard_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_64106d8d3b2f11e79eabf2bc5c" ON "customer_standards" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_0a6e3d19cb60b766f1612a7c94" ON "customer_standards" ("standard_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_cf1b3269f498072fd3392f9845" ON "customer_templates" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_ddcb8b207b3706c5c192fe120e" ON "customer_templates" ("template_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_a0359a8b04bdb8cb947d216689" ON "app_assets" ("source_type_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_f7e5cdfeb1bc275dc4279a9897" ON "app_assets" ("app_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_95a36792989f342606cd89e423" ON "app_assets" ("created_by_user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_2790da1cce6014bba93ff23e7a" ON "app_assets" ("updated_by_user_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_4c675567d2a58f0b07cef09c13" ON "comments" ("user_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_30402157b9a2de823d0045ea63" ON "assessment_source" ("assessment_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_47208502e03399e56459c9a46d" ON "assessment_source" ("asset_id")`);

        await queryRunner.query(`CREATE INDEX "IDX_69eeb37b31a77571658ef141c1" ON "assessment_versions" ("assessmentId")`);

        await queryRunner.query(`CREATE INDEX "IDX_ec869b2744eb458043bb309411" ON "assessment_info" ("standard_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_03a274a0acf46ca24bc53df088" ON "assessment_info" ("app_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_21c20aeb06332ac4dccefb48da" ON "assessment_info" ("template_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_96bb880bfe59a0dd1b96744459" ON "assessment_info" ("organization_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_0fb1142dd470dfa13755de1690" ON "assessment_info" ("created_by")`);

        await queryRunner.query(`CREATE INDEX "IDX_20fda912f553f62d557169abd9" ON "sections" ("assessment_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e9a132d0f2eb28fb1f0bd0aaef" ON "sections" ("parentSectionId")`);

        await queryRunner.query(`CREATE INDEX "IDX_c9ab963473827a1984c3861f5a" ON "section_versions" ("section_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_8f3c56a6ace24bc95d73402018" ON "section_versions" ("previousVersionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_7062a4fbd9bab22ffd918e5d3d"`);
        await queryRunner.query(`DROP INDEX "IDX_89bde91f78d36ca41e9515d91c"`);
        await queryRunner.query(`DROP INDEX "IDX_699e2e992cd6e7aa61f61d4f62"`);
        await queryRunner.query(`DROP INDEX "IDX_58abbde566ba5e2b78fb170792"`);
        await queryRunner.query(`DROP INDEX "IDX_592312630bcf16bc4872f8fd4a"`);
        await queryRunner.query(`DROP INDEX "IDX_973904d503c734212cdb43be4b"`);
        await queryRunner.query(`DROP INDEX "IDX_0a0d871e841c6c7d3d6d4d1c9a"`);
        await queryRunner.query(`DROP INDEX "IDX_a2cecd1a3531c0b041e29ba46e"`);
        await queryRunner.query(`DROP INDEX "IDX_a3aa5306fb39624c7162a44b7e"`);
        await queryRunner.query(`DROP INDEX "IDX_64106d8d3b2f11e79eabf2bc5c"`);
        await queryRunner.query(`DROP INDEX "IDX_0a6e3d19cb60b766f1612a7c94"`);
        await queryRunner.query(`DROP INDEX "IDX_cf1b3269f498072fd3392f9845"`);
        await queryRunner.query(`DROP INDEX "IDX_ddcb8b207b3706c5c192fe120e"`);
        await queryRunner.query(`DROP INDEX "IDX_a0359a8b04bdb8cb947d216689"`);
        await queryRunner.query(`DROP INDEX "IDX_f7e5cdfeb1bc275dc4279a9897"`);
        await queryRunner.query(`DROP INDEX "IDX_95a36792989f342606cd89e423"`);
        await queryRunner.query(`DROP INDEX "IDX_2790da1cce6014bba93ff23e7a"`);
        await queryRunner.query(`DROP INDEX "IDX_4c675567d2a58f0b07cef09c13"`);
        await queryRunner.query(`DROP INDEX "IDX_30402157b9a2de823d0045ea63"`);
        await queryRunner.query(`DROP INDEX "IDX_47208502e03399e56459c9a46d"`);
        await queryRunner.query(`DROP INDEX "IDX_69eeb37b31a77571658ef141c1"`);
        await queryRunner.query(`DROP INDEX "IDX_ec869b2744eb458043bb309411"`);
        await queryRunner.query(`DROP INDEX "IDX_03a274a0acf46ca24bc53df088"`);
        await queryRunner.query(`DROP INDEX "IDX_21c20aeb06332ac4dccefb48da"`);
        await queryRunner.query(`DROP INDEX "IDX_96bb880bfe59a0dd1b96744459"`);
        await queryRunner.query(`DROP INDEX "IDX_0fb1142dd470dfa13755de1690"`);
        await queryRunner.query(`DROP INDEX "IDX_20fda912f553f62d557169abd9"`);
        await queryRunner.query(`DROP INDEX "IDX_e9a132d0f2eb28fb1f0bd0aaef"`);
        await queryRunner.query(`DROP INDEX "IDX_c9ab963473827a1984c3861f5a"`);
        await queryRunner.query(`DROP INDEX "IDX_8f3c56a6ace24bc95d73402018"`);
        await queryRunner.query(`DROP TABLE "source_asset_version"`);
        await queryRunner.query(`DROP TABLE "source_assets"`);
        await queryRunner.query(`DROP TABLE "source"`);
        await queryRunner.query(`DROP TABLE "source_version"`);
        await queryRunner.query(`DROP TABLE "source_types"`);
        await queryRunner.query(`DROP TABLE "section_versions"`);
        await queryRunner.query(`DROP TABLE "sections"`);
        await queryRunner.query(`DROP TABLE "assessment_info"`);
        await queryRunner.query(`DROP TABLE "assessment_versions"`);
        await queryRunner.query(`DROP TABLE "assessment_source"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "app_assets"`);
        await queryRunner.query(`DROP TABLE "app_source_types"`);
        await queryRunner.query(`DROP TABLE "customer_templates"`);
        await queryRunner.query(`DROP TABLE "async_tasks"`);
        await queryRunner.query(`DROP TABLE "customer_standards"`);
        await queryRunner.query(`DROP TABLE "templates"`);
        await queryRunner.query(`DROP TABLE "standards"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        // await queryRunner.query(`DROP TABLE "organizaorganization_memberstion_members"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
    }

}
