import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterHelpCenterArticle1741608765101 implements MigrationInterface {

    
   
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = 'help_center_articles';
        const column = new TableColumn({
            name: 'use_as_guide',
            type: 'boolean',
            default: false,
            isNullable: true,
        });

        const tableExists = await queryRunner.hasTable(table);
        if (tableExists) {
            const columnExists = await queryRunner.hasColumn(table, 'use_as_guide');
            if (!columnExists) {
                await queryRunner.addColumn(table, column);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = 'help_center_articles';
        const columnExists = await queryRunner.hasColumn(table, 'use_as_guide');
        if (columnExists) {
            await queryRunner.dropColumn(table, 'use_as_guide');
        }
    }
}
