import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFramworkAndStandard1738243650425 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM public.framework WHERE id = 3
                ) THEN
                    INSERT INTO public.framework (id, name, description, path, version, created_at, updated_at, active)
                    VALUES (3, 'NIST 800-171 rev2 Catalog', '', '/path/to/nist800171', 1, now(), now(), true);
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM public.standard WHERE id = 9
                ) THEN
                    INSERT INTO public.standard (id, name, short_description, long_description, path, labels, created_at, updated_at, active, framework_id)
                    VALUES (9, 'CMMC 2.0 Level 1', '', null, null, null, now(), now(), false, 3);
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM public.standard WHERE id = 10
                ) THEN
                    INSERT INTO public.standard (id, name, short_description, long_description, path, labels, created_at, updated_at, active, framework_id)
                    VALUES (10, 'CMMC 2.0 Level 2', 'CMMC 2.0 is the latest version of the Cybersecurity Maturity Model Certification (CMMC) program. Its a cybersecurity framework that organizes best practices and standards into three levels of increasing stringency.','CMMC 2.0 is the latest version of the Cybersecurity Maturity Model Certification (CMMC) program. Its a cybersecurity framework that organizes best practices and standards into three levels of increasing stringency.' , null, null, now(), now(), true, 3);
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM public.standard WHERE id = 11
                ) THEN
                    INSERT INTO public.standard (id, name, short_description, long_description, path, labels, created_at, updated_at, active, framework_id)
                    VALUES (11, 'CMMC 2.0 Level 3', '', null, null, null, now(), now(), false, 3);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM public.standard WHERE id IN (9, 10, 11);
        `);
        
        await queryRunner.query(`
            DELETE FROM public.framework WHERE id = 3;
        `);

    }

}
