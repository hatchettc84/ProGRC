import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexOrderOnControl1735625980818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE control ADD COLUMN if not exists order_index int4;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE control DROP COLUMN order_index;
        `)
    }

}
