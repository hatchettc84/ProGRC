import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterCustomerCsm1741675197533 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = 'customer_csms';
        const column = new TableColumn({
            name: 'role_id',
            type: 'int',
            isNullable: true,
        });

        const tableExists = await queryRunner.hasTable(table);
        if (tableExists) {
            const columnExists = await queryRunner.hasColumn(table, 'role_id');
            if (!columnExists) {
                await queryRunner.addColumn(table, column);
            }

            await queryRunner.query(`UPDATE ${table} SET role_id = 5 WHERE role_id IS NULL`);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = 'customer_csms';
        const columnExists = await queryRunner.hasColumn(table, 'role_id');
        if (columnExists) {
            await queryRunner.dropColumn(table, 'role_id');
        }
    }

}
