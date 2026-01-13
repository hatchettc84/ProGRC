import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableRelatedCompliance1730267504947 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS compliances (
                id bigserial PRIMARY KEY,
                customer_id varchar(255) NOT NULL,
                app_id bigint NOT NULL,
                standard_id INT NOT NULL,
                control_count INT NOT NULL DEFAULT 0,
                asset_count INT NOT NULL DEFAULT 0,
                exception_count INT NOT NULL DEFAULT 0,
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS compliance_categories (
                id bigserial PRIMARY KEY,
                customer_id varchar(255) NOT NULL,
                app_id bigint NOT NULL,
                standard_id INT NOT NULL,
                standard_category_id BIGINT NOT NULL,
                compliance_id bigint NOT NULL,
                enhancement_count INT NOT NULL DEFAULT 0,
                asset_count INT NOT NULL DEFAULT 0,
                exception_count INT NOT NULL DEFAULT 0,
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS app_standard_controls;

            CREATE TABLE IF NOT EXISTS compliance_controls (
                id bigserial PRIMARY KEY,
                customer_id varchar(255) NOT NULL,
                app_id bigint NOT NULL,
                standard_control_id bigint NOT NULL,
                standard_id int NOT NULL,
                standard_category_id bigint NOT NULL,
                compliance_id bigint NOT NULL,
                compliance_category_id bigint NOT NULL,
                implementation TEXT,
                risk_levels VARCHAR(255),
                asset_count INT NOT NULL DEFAULT 0,
                enhancement_count INT NOT NULL DEFAULT 0,
                exception_count INT NOT NULL DEFAULT 0,
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS compliance_control_enhancements (
                id bigserial PRIMARY KEY,
                customer_id varchar(255) NOT NULL,
                app_id bigint NOT NULL,
                standard_control_id bigint NOT NULL,
                standard_id int NOT NULL,
                standard_category_id bigint NOT NULL,
                compliance_id bigint NOT NULL,
                compliance_category_id bigint NOT NULL,
                compliance_control_id bigint NOT NULL,
                implementation TEXT,
                standard_control_enhancement_id bigint NOT NULL,
                status varchar default 'not_implemented',
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                exception boolean default false,
                exception_reason TEXT,
                risk_levels VARCHAR(255),
                asset_count INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS compliance_control_enhancement_evidences (
                id bigserial PRIMARY KEY,
                compliance_control_enhancement_id bigint NOT NULL,
                document varchar NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `)

        await queryRunner.query(`
            DROP TABLE IF EXISTS app_standard_control_enhancements;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS asset_controls;

            CREATE TABLE IF NOT EXISTS compliance_assets (
                id bigserial PRIMARY KEY,
                customer_id varchar(255) NOT NULL,
                app_id bigint NOT NULL,
                standard_id INT NOT NULL,
                standard_control_id bigint NOT NULL,
                compliance_id bigint NOT NULL,
                compliance_control_id bigint NOT NULL,
                compliance_control_enhancement_id bigint NOT NULL,
                asset_id bpchar(36) NOT NULL,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE INDEX compliance_controls_app_id_index ON compliance_controls (app_id, standard_id);
            CREATE INDEX compliance_controls_compliance_control_id_index ON compliance_controls (compliance_id);
            CREATE INDEX compliance_control_enhancements_control_id_index ON compliance_control_enhancements (compliance_control_id);
            CREATE INDEX compliance_assets_compliance_control_enhancement_id_index ON compliance_assets (compliance_control_enhancement_id, compliance_control_id);
            CREATE INDEX compliance_control_enhancement_evidences_compliance_control_enhancement_id_index ON compliance_control_enhancement_evidences (compliance_control_enhancement_id);
        `);

        await queryRunner.query(`
            ALTER TABLE standard_control_categories RENAME TO standard_categories;
            ALTER TABLE standard_controls RENAME COLUMN standard_control_category_id TO standard_category_id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS app_standard_controls (
                id bigserial NOT NULL PRIMARY KEY,
                app_id bigint NOT NULL,
                standard_control_id bigint NOT NULL,
                standard_id int NOT NULL,
                risk_levels VARCHAR(255),
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS app_standard_control_enhancements (
                id bigserial NOT NULL PRIMARY KEY,
                app_standard_control_id bigint NOT NULL,
                implementation TEXT,
                standard_control_enhancement_id bigint NOT NULL,
                status varchar default 'not_implemented',
                exception boolean default false,
                exception_reason TEXT,
                risk_levels VARCHAR(255),
                evidence_document varchar,
                evidence_description TEXT,
                percentage_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE INDEX app_standard_controls_app_id_index ON app_standard_controls (app_id, standard_id);
            CREATE INDEX app_standard_controls_standard_control_id_index ON app_standard_controls (standard_control_id);
            CREATE INDEX app_standard_control_enhancements_app_standard_control_id_index ON app_standard_control_enhancements (app_standard_control_id);
            CREATE INDEX app_standard_control_enhancements_standard_control_enhancement_id_index ON app_standard_control_enhancements (standard_control_enhancement_id);
        `);

        // Drop all the new tables in reverse order of creation
        await queryRunner.query(`
            DROP TABLE IF EXISTS compliance_assets;
            DROP TABLE IF EXISTS compliance_control_enhancements;
            DROP TYPE IF EXISTS compliance_control_enhancement_status;
            DROP TABLE IF EXISTS compliance_controls;
            DROP TABLE IF EXISTS compliance_categories;
            DROP TABLE IF EXISTS compliances;
            DROP TABLE IF EXISTS compliance_control_enhancement_evidences;
        `);

        queryRunner.query(`
            ALTER TABLE standard_controls RENAME COLUMN standard_category_id TO standard_control_category_id;
            ALTER TABLE standard_categories RENAME TO standard_control_categories;
        `);
    }

}
