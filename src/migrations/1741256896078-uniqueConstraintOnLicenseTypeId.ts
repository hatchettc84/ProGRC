import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueConstraintOnLicenseTypeId1741256896078 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the constraint already exists
        const constraintExists = await queryRunner.query(`
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'public.license_rules'::regclass 
            AND contype = 'u' 
            AND conname = 'license_rules_license_type_id_key';
        `);

        if (constraintExists.length === 0) {
            await queryRunner.query(`
                ALTER TABLE public.license_rules
                ADD CONSTRAINT license_rules_license_type_id_key UNIQUE (license_type_id);
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.license_rules
            DROP CONSTRAINT IF EXISTS license_rules_license_type_id_key;
        `);
    }
}
