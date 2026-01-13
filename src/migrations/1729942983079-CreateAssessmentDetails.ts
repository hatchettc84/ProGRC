import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAssessmentDetails1729942983079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS assessment_detail`);

    await queryRunner.createTable(
      new Table({
        name: 'assessment_detail',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },

          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
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
            name: 'frameworks',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'template_id',
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
            name: 'updated_by',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'updated_on',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_locked',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assessment_detail');
  }

}
