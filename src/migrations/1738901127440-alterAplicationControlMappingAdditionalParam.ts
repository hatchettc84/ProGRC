import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAplicationControlMappingAdditionalParam1738901127440 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_mapping 
            ADD COLUMN IF NOT EXISTS user_additional_parameter text NULL;
            
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_mapping DROP COLUMN IF EXISTS user_additional_parameter;

`);
    }

}
