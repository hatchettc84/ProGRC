import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceTypeAddSourceAndAssetsCount1729653967403 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Add 'source_count' column (nullable)
         await queryRunner.addColumn('source_types', new TableColumn({
            name: 'source_count',
            type: 'int',
            isNullable: true,
        }));

        // Add 'assets_count' column (nullable)
        await queryRunner.addColumn('source_types', new TableColumn({
            name: 'assets_count',
            type: 'int',
            isNullable: true,
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

         // Remove 'source_count' column
         await queryRunner.dropColumn('source_types', 'source_count');

         // Remove 'assets_count' column
         await queryRunner.dropColumn('source_types', 'assets_count');
    }

}
