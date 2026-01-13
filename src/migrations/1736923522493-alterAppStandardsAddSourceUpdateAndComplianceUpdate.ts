import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAppStandardsAddSourceUpdateAndComplianceUpdate1736923522493 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE public.app_standards ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMP DEFAULT null`);
        await queryRunner.query(`UPDATE public.app_standards SET source_updated_at = created_at WHERE source_updated_at IS NULL`);

        await queryRunner.query(`ALTER TABLE public.app_standards ADD COLUMN IF NOT EXISTS compliance_updated_at TIMESTAMP DEFAULT null`);
        await queryRunner.query(`UPDATE public.app_standards SET compliance_updated_at = created_at WHERE compliance_updated_at IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE public.app_standards DROP COLUMN IF EXISTS source_updated_at`);
        await queryRunner.query(`ALTER TABLE public.app_standards DROP COLUMN IF EXISTS compliance_updated_at`);
    }

}
