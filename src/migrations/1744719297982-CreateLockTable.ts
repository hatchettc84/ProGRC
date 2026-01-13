import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLockTable1744719297982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS locks (
                name VARCHAR(255) PRIMARY KEY,
                acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS locks;
        `);
  }
}
