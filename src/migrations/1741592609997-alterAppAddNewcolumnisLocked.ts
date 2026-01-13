import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAppAddNewcolumnisLocked1741592609997 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = 'app';
        const column = new TableColumn({
            name: 'is_locked',
            type: 'boolean',
            default: false,
            isNullable: false,
        });

        await queryRunner.addColumn(table, column);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = 'app';
        await queryRunner.dropColumn(table, 'is_locked');
    }

}
