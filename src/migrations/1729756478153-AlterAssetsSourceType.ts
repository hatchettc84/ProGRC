import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssetsSourceType1729756478153 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "assets" RENAME COLUMN "source_type" TO "source_type_id";
          `);

        // Step 2: Change the column type of 'source_type_id' to 'uuid'
        await queryRunner.query(`
            ALTER TABLE "assets" 
            ALTER COLUMN "source_type_id" TYPE uuid 
            USING "source_type_id"::uuid;
          `);

        // Optional: Ensure that the `source_type_id` column allows NULLs if needed, otherwise remove this.
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "source_type_id" SET NOT NULL;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        // Reverse Step 1: Rename the 'source_type_id' column back to 'source_type'
        await queryRunner.query(`
        ALTER TABLE "assets" RENAME COLUMN "source_type_id" TO "source_type";
      `);

        // Reverse Step 2: Change the column type of 'source_type' back to 'varchar'
        await queryRunner.query(`
        ALTER TABLE "assets"
        ALTER COLUMN "source_type" TYPE varchar
        USING "source_type"::varchar;
      `);
    }

}
