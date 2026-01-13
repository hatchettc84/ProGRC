import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOldAsyncTaskToAsyncTaskv11729936672921 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE async_tasks RENAME TO async_tasks_v1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE async_tasks_v1 RENAME TO async_tasks`);

    }

}
