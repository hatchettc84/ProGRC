import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPercentageCompletion1738743127032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_mapping 
            ADD COLUMN IF NOT EXISTS percentage_completion DECIMAL(5,2) NULL;
            
          `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                        ALTER TABLE application_control_mapping DROP COLUMN IF EXISTS percentage_completion;

          `);
    }

}
