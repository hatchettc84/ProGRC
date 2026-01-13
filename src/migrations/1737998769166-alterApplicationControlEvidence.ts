import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterApplicationControlEvidence1737998769166 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "application_control_evidence" ALTER COLUMN "description" DROP NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "application_control_evidence" ALTER COLUMN "description" SET NOT NULL`
        );

    }

}
