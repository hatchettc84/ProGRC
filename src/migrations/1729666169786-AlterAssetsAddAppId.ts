import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAssetsAddAppId1729666169786 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'app_id' column (UUID and nullable)
        await queryRunner.addColumn('assets', new TableColumn({
            name: 'app_id',
            type: 'bigint',
            isNullable: true,  // Set nullable if needed
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop 'app_id' column
        await queryRunner.dropColumn('assets', 'app_id');
    }

}
