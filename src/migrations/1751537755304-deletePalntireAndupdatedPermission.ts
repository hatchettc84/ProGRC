import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletePalntireAndupdatedPermission1751537755304 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update permissions for clone application endpoint
        await queryRunner.query(`
            UPDATE permissions 
            SET allowed_roles = '[3,4,5]' 
            WHERE api_path = '/api/v1/applications/{id}/clone' 
            AND "method" = 'POST'
        `);

        // Update permissions for update application endpoint
        await queryRunner.query(`
            delete from standard where id = 13;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the permission change
        await queryRunner.query(`
            UPDATE permissions 
            SET allowed_roles = '[3,4]' 
            WHERE api_path = '/api/v1/applications/{id}/clone' 
            AND "method" = 'POST'
        `);
    }

}
