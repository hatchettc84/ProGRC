import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyAndSeedStandards1729071377861 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE standards ADD COLUMN IF NOT EXISTS "organization_name" VARCHAR(255);
            ALTER TABLE standards ADD COLUMN IF NOT EXISTS "image" VARCHAR(255);
            ALTER TABLE standards ADD COLUMN IF NOT EXISTS "key" VARCHAR(255) UNIQUE;
            ALTER TABLE standards ADD COLUMN IF NOT EXISTS "active" boolean default false;
        `);

    await queryRunner.query(`
            INSERT INTO standards (name, description, path, organization_name, image, key, active) VALUES
            ('CIS Controls', null, null, 'Center for Internet Security', 'assets/images/cis_controls.png', 'cis_controls', false),
            ('SOC 2 - AICPA 2017 TSC', null, null, 'American Institute of Certified Public Accountants', 'assets/images/aicpa.png', 'aicpa', false),
            ('ISO/IEC 27001:2022', null, null, 'International Organization of Standardization', 'assets/images/iso.png', 'iso_27001_2022', false),
            ('HIPAA', null, null,  'Health Insurance Portability and Accountability Act', 'assets/images/hipaa.png', 'hipaa', false),
            ('NIST 800-53', 'NIST cybersecurity framework is a powerful tool to organize and improve cybersecurity program', 'Location for NIST-800-53', 'National Institute of Standards and Technology', 'assets/images/nist_800_53.png', 'nist_800_53', true),
            ('Cloud Security Alliance', null, null, 'Cloud Security Matrix', 'assets/images/cloud_security_alliance.png', 'cloud_security_alliance', false);
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS standard_controls (
                id bigserial NOT NULL PRIMARY KEY,
                standard_control_category_id bigint NOT NULL,
                standard_id int NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                risk_levels VARCHAR(255),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

    await queryRunner.query(`
      CREATE INDEX standard_controls_standard_id_index ON standard_controls (standard_id);
      CREATE INDEX standard_controls_standard_control_category_id_index ON standard_controls (standard_control_category_id);
    `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS standard_control_enhancements (
                id bigserial NOT NULL PRIMARY KEY,
                control_id bigint NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                risk_levels VARCHAR(255),
                created_at TIMESTAMP DEFAULT now()
            );
        `);

    await queryRunner.query(`
      CREATE INDEX standard_control_enhancements_control_id_index ON standard_control_enhancements (control_id);
    `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS standard_control_categories (
                id bigserial NOT NULL PRIMARY KEY,
                standard_id int NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT now()
            );
      `);

    await queryRunner.query(`
      CREATE INDEX standard_control_categories_standard_id_index ON standard_control_categories (standard_id);
    `);

    await queryRunner.query(`
            INSERT INTO standard_control_categories (standard_id, name) SELECT id, 'Access Control' FROM standards WHERE key = 'nist_800_53';
    `);

    await queryRunner.query(`
           INSERT INTO standard_controls (standard_id, name, description, risk_levels, standard_control_category_id) SELECT id, 'Account Management', '<ol>
  <li>Define and document the types of accounts allowed and specifically prohibited for use within the system;</li>
  <li>Assign account managers;</li>
  <li>Require <strong>[Assignment: organization-defined prerequisites and criteria]</strong> for group and role membership;</li>
  <li>Specify:
    <ol type="a">
      <li>Authorized users of the system;</li>
      <li>Group and role membership; and</li>
      <li>Access authorizations (i.e., privileges) and <strong>[Assignment: organization-defined attributes (as required)]</strong> for each account;</li>
    </ol>
  </li>
  <li>Require approvals by <strong>[Assignment: organization-defined personnel or roles]</strong> for requests to create accounts;</li>
  <li>Create, enable, modify, disable, and remove accounts in accordance with <strong>[Assignment: organization-defined policy, procedures, prerequisites, and criteria]</strong>;</li>
  <li>Monitor the use of accounts;</li>
  <li>Notify account managers and <strong>[Assignment: organization-defined personnel or roles]</strong> within:
    <ol type="a">
      <li><strong>[Assignment: organization-defined time period]</strong> when accounts are no longer required;</li>
      <li><strong>[Assignment: organization-defined time period]</strong> when users are terminated or transferred; and</li>
      <li><strong>[Assignment: organization-defined time period]</strong> when system usage or need-to-know changes for an individual;</li>
    </ol>
  </li>
  <li>Authorize access to the system based on:
    <ol type="a">
      <li>A valid access authorization;</li>
      <li>Intended system usage; and</li>
      <li><strong>[Assignment: organization-defined attributes (as required)]</strong>;</li>
    </ol>
  </li>
  <li>Review accounts for compliance with account management requirements <strong>[Assignment: organization-defined frequency]</strong>;</li>
  <li>Establish and implement a process for changing shared or group account authenticators (if deployed) when individuals are removed from the group; and</li>
  <li>Align account management processes with personnel termination and transfer processes.</li>
</ol>', 'low,moderate,high', (SELECT id FROM standard_control_categories WHERE name = 'Access Control') FROM standards WHERE key = 'nist_800_53';
        `);

    await queryRunner.query(`
             INSERT INTO standard_control_enhancements (control_id, name, description, risk_levels) SELECT id, 'Automated System Account Management', 'Support the management of system accounts using [Assignment: organization-defined automated mechanisms].', 'moderate,high' FROM standard_controls WHERE name = 'Account Management';

            INSERT INTO standard_control_enhancements (control_id, name, description, risk_levels) SELECT id, 'Automated Temporary and Emergency Account Management', 'Automatically [Selection: remove; disable] temporary and emergency accounts after [Assignment: organization-defined time period for each type of account].', 'moderate,high' FROM standard_controls WHERE name = 'Account Management';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM standards WHERE key IN ('cis_controls', 'aicpa', 'iso_27001_2022', 'hipaa', 'nist_800_53', 'cloud_security_alliance');
            `);
    await queryRunner.query(`
            ALTER TABLE standards DROP COLUMN IF EXISTS "organization_name";
            ALTER TABLE standards DROP COLUMN IF EXISTS "image";
            ALTER TABLE standards DROP COLUMN IF EXISTS "key";
            ALTER TABLE standards DROP COLUMN IF EXISTS "active";
        `);

    await queryRunner.query(`
            DROP TABLE IF EXISTS standard_controls;
            DROP TABLE IF EXISTS standard_control_enhancements;
            DROP TABLE IF EXISTS standard_control_categories;
        `);
  }

}
