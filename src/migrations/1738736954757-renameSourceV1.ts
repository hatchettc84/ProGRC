import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSourceV11738736954757 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE source_v1 RENAME TO source;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE source RENAME TO source_v1;
          `);
    }

}
