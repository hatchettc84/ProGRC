import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetExistingFrameworkAndDumpNew1742490012265 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Delete all existing data from framework table
        await queryRunner.query(`DELETE FROM public.framework`);
        
        // Reset the sequence back to 0
        await queryRunner.query(`ALTER SEQUENCE public.framework_id_seq RESTART WITH 1`);
        
        // Insert new framework data
        await queryRunner.query(`
            INSERT INTO public.framework (id,"name",description,"path","version",created_at,updated_at,active) VALUES
            (2,'NIST 800-53','NIST cybersecurity framework is a powerful tool to organize and improve cybersecurity program','/path/to/nist80053',1,'2024-12-27 17:07:04.781064','2024-12-27 17:07:04.781064',true),
            (1,'DOD SRG','The Cloud Computing Security Requirements Guide (CC SRG) outlines the security model for DoD''s use of cloud computing, detailing the necessary security controls and requirements for cloud-based solutions.','/path/to/nist80053',1,'2024-12-23 18:17:51.163987','2024-12-23 18:17:51.163987',true),
            (3,'NIST 800-171 rev2 Catalog','','/path/to/nist800171',1,'2025-02-03 05:55:26.488802','2025-02-03 05:55:26.488802',true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete the inserted data
        await queryRunner.query(`DELETE FROM public.framework WHERE id IN (1, 2, 3)`);
        
        // Reset the sequence back to 1
        await queryRunner.query(`ALTER SEQUENCE public.framework_id_seq RESTART WITH 1`);
    }
}
