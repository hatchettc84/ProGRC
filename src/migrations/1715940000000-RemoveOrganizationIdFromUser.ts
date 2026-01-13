import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveOrganizationIdFromUser1715940000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
       // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "organization_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.addColumn("users", new TableColumn({
        //     name: "organization_id",
        //     type: "uuid",
        //     isNullable: true
        // }));
    }
} 