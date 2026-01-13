import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertNewStanadards1744782184150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert standard if not exists
        await queryRunner.query(`
            INSERT INTO public.standard (id, name, short_description, long_description, path, labels,
                                     created_at, updated_at, active, framework_id, index)
            SELECT 13, 'Palantir FedStart 2.1',
                    'Palantir FedStart is a SaaS offering for eligible companies and startups looking to deploy software to the federal government.',
                    'Palantir FedStart is a SaaS offering for eligible companies and startups looking to deploy software to the federal government.',
                    null, null, now(), now(), true, 2, 13
            WHERE NOT EXISTS (
                SELECT 1 FROM public.standard WHERE id = 13
            );
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete standard control mappings
        await queryRunner.query(`
            DELETE FROM public.standard_control_mapping 
            WHERE standard_id = 13;
        `);

        // Delete standard
        await queryRunner.query(`
            DELETE FROM public.standard 
            WHERE id = 13;
        `);
    }

}
