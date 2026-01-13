import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCustomerIdsTypeInTemplates1749121491118 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN customer_ids TYPE varchar[] USING customer_ids::varchar[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN customer_ids TYPE integer[] USING customer_ids::integer[]`);
    }

}
