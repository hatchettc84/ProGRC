import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetRoleCreateNew1751712116924 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Delete all existing data from user_roles table
        await queryRunner.query(`DELETE FROM public.user_roles`);
        
        
        // Insert new user roles data with explicit IDs
        await queryRunner.query(`
            INSERT INTO public.user_roles (id, role_name, is_org_role) VALUES
            (1, 'Super Admin', false),
            (2, 'Readonly Admin', false),
            (3, 'Admin', true),
            (4, 'Member', true),
            (5, 'CSM', false),
            (6, 'CSM AUDITOR', false),
            (7, 'AUDITOR', true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete the inserted data
        await queryRunner.query(`DELETE FROM public.user_roles WHERE id IN (1, 2, 3, 4, 5, 6, 7)`);
        
        // Reset the ID sequence back to 1
        await queryRunner.query(`ALTER SEQUENCE public.user_roles_id_seq RESTART WITH 1`);
        
    }

}
