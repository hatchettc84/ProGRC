import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAssessmentActorToUUID1732179271234 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assessment"
            ALTER COLUMN "created_by" TYPE UUID USING "created_by"::UUID
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment"
            ALTER COLUMN "updated_by" TYPE UUID USING "updated_by"::UUID
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment_history"
            ALTER COLUMN "created_by" TYPE UUID USING "created_by"::UUID
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assessment"
            ALTER COLUMN "created_by" TYPE VARCHAR USING "created_by"::VARCHAR
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment"
            ALTER COLUMN "updated_by" TYPE VARCHAR USING "updated_by"::VARCHAR
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment_history"
            ALTER COLUMN "created_by" TYPE VARCHAR USING "created_by"::VARCHAR
        `);
    }

}
