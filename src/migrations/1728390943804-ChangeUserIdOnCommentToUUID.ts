import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserIdOnCommentToUUID1728390943804 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE comments 
            ALTER COLUMN user_id 
            SET DATA TYPE UUID 
            USING user_id::UUID
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE comments 
            ALTER COLUMN user_id 
            SET DATA TYPE VARCHAR 
            USING user_id::VARCHAR
        `);
    }

}
