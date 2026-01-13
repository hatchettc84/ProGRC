import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAppControlMappingAddIsRevieved1736784863528 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE public.application_control_mapping ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN default false`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`ALTER TABLE public.application_control_mapping DROP COLUMN IF EXISTS is_reviewed`);
    }

}
