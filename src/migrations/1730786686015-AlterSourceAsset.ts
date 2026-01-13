import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceAsset1730786686015 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'application_source_type',
            'assets_count',
            new TableColumn({
                name: 'assets_count',
                type: 'int',
                isNullable: true,
            })
        );

        await queryRunner.changeColumn(
            'application_source_type',
            'source_count',
            new TableColumn({
                name: 'source_count',
                type: 'int',
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'application_source_type',
            'assets_count',
            new TableColumn({
                name: 'assets_count',
                type: 'int',
                isNullable: false,
            })
        );

        await queryRunner.changeColumn(
            'application_source_type',
            'source_count',
            new TableColumn({
                name: 'source_count',
                type: 'int',
                isNullable: false,
            })
        );
    }

}
