import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFrameworkIds1744964669891 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE standard SET framework_id = 2 WHERE framework_id = 1;
        `);
        await queryRunner.query(`
            UPDATE control SET framework_id = 2 WHERE framework_id = 1;
        `);
        await queryRunner.query(`
            UPDATE control_evaluation_table SET framework_id = 2 WHERE framework_id = 1;
        `);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE standard SET framework_id = 2 WHERE framework_id = 1;
        `);
        await queryRunner.query(`
            UPDATE control SET framework_id = 2 WHERE framework_id = 1;
        `);
        await queryRunner.query(`
            UPDATE control_evaluation_table SET framework_id = 2 WHERE framework_id = 1;
        `);
    }

}
