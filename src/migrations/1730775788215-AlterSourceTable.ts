import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceTable1730775788215 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change deleted_at column to is_deleted of boolean type
        await queryRunner.changeColumn(
            'source',
            'deleted_at',
            new TableColumn({
                name: 'is_deleted',
                type: 'boolean',
                isNullable: false,
                default: false,
            })
        );

        // Remove is_active column
       // await queryRunner.dropColumn('source', 'is_active');

        // Add created_by column
        await queryRunner.addColumn(
            'source',
            new TableColumn({
                name: 'created_by',
                type: 'uuid',
                isNullable: true,
            })
        );

        // Add updated_by column
        await queryRunner.addColumn(
            'source',
            new TableColumn({
                name: 'updated_by',
                type: 'uuid',
                isNullable: true,
            })
        );

        await queryRunner.dropColumn('source_types', 'created_by');

        await queryRunner.dropColumn('source_types', 'updated_by');

        await queryRunner.query(`DROP TABLE IF EXISTS "source_assets"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "source_asset_version"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Change is_deleted back to deleted_at of timestamp type
        await queryRunner.changeColumn(
            'source',
            'is_deleted',
            new TableColumn({
                name: 'deleted_at',
                type: 'timestamp',
                isNullable: true,
            })
        );

        // Re-add is_active column
        await queryRunner.addColumn(
            'source',
            new TableColumn({
                name: 'is_active',
                type: 'boolean',
                default: true,
            })
        );

        // Remove created_by column
        await queryRunner.dropColumn('source', 'created_by');

        // Remove updated_by column
        await queryRunner.dropColumn('source', 'updated_by');

        await queryRunner.addColumn(
            'source_types',
            new TableColumn({
                name: 'created_by',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            'source_types',
            new TableColumn({
                name: 'updated_by',
                type: 'varchar',
                isNullable: true,
            })
        );

        await queryRunner.query(`
            CREATE TABLE "source_assets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "source_asset_version" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "uploaded_key" text NOT NULL,
                "processed_bucket_key" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" uuid NOT NULL,
                PRIMARY KEY ("id")
            )
        `);

    }

}
