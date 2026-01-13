import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAppStandardAddUpdateTime1736735459248 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.app_standards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP`);
        await queryRunner.query(`UPDATE public.app_standards SET updated_at = created_at WHERE updated_at IS NULL`);
        await queryRunner.query(`ALTER TABLE public.app_standards ALTER COLUMN updated_at SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.app_standards DROP COLUMN IF EXISTS updated_at`);

    }

}
