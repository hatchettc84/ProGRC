import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSectionHistoryAddAssmntHistoryId1731826787174 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'assessment_sections_history',
            new TableColumn({
              name: 'assmntHistoryId',
              type: 'int',
              isNullable: true,
            })
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('assessment_sections_history', 'assmntHistoryId');
    }

}
