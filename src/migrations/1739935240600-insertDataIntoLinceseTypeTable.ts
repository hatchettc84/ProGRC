import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDataIntoLinceseTypeTable1739935240600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `INSERT INTO license_type (name, created_at, updated_at) VALUES 
          ('Beta', NOW(), NOW()),
          ('Design Partner', NOW(), NOW()),
          ('Starter', NOW(), NOW()),
          ('Team', NOW(), NOW()),
          ('Enterprise', NOW(), NOW())`
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `DELETE FROM license_type WHERE name IN ('Beta', 'Design Partner', 'Starter', 'Team', 'Enterprise')`
        );
      }

}
