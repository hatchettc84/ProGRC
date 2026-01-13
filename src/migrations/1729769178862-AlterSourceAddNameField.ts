import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceAddNameField1729769178862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn('source', new TableColumn({
            name: 'name',
            type: 'varchar',
            isNullable: true // You can set this to `false` if you don't want the field to be nullable
        }));
        
        await queryRunner.query(`
            ALTER TABLE "source" 
            ADD "is_active" boolean NOT NULL DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropColumn('source', 'name');
        await queryRunner.query(`
            ALTER TABLE "source" 
            DROP COLUMN "is_active";
        `);
    }

}
