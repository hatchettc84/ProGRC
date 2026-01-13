import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSourceAddTags1736230763746 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.source_v1
            ADD COLUMN tags text[] NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.source_v1
            DROP COLUMN tags;
        `);
    }

}
