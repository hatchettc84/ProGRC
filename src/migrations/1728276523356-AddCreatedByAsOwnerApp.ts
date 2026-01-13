import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByAsOwnerApp1728276523356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO app_users (app_id, user_id, role)
            SELECT id as app_id, created_by as user_id, 'admin'
            FROM app ON CONFLICT DO NOTHING;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM app_users WHERE role = 'admin'`);
    }

}
