import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillSourceCreatedBy1732187902494 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE source
            SET created_by = u.id,
                updated_by = u.id
            FROM users u
            WHERE u.customer_id = source.customer_id
            AND u.role_id = 3
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
