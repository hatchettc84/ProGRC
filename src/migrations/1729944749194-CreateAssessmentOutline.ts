import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAssessmentOutline1729944749194 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS assessment_outline`);
    await queryRunner.createTable(
      new Table({
        name: 'assessment_outline',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'customer_id',
            type: 'varchar(255)',
            isNullable: false,
          },
          {
            name: 'app_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'assessment_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_on',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'outline',
            type: 'json',
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assessment_outline');
  }

}
