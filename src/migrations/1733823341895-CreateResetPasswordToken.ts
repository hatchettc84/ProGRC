import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResetPasswordToken1733823341895 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE reset_password_tokens (
            id BIGSERIAL,
            user_id UUID NOT NULL,
            user_email VARCHAR(255) NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used_at TIMESTAMP,
            created_by UUID NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )`);

        await queryRunner.query(`CREATE INDEX reset_password_tokens_user_id_index ON reset_password_tokens(user_id, created_at desc)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE reset_password_tokens`);
    }

}
