import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewSSPTemplate41737464292765 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1;`);
        await queryRunner.query(`
            INSERT INTO public.templates
            (id, name, location, standard_id, upload_date, update_date, outline)
            VALUES
            (
                4,
                'Kovr Initial Assessment & Plan Report',
                'https://example.com/template1.pdf',
                5,
                now(),
                now(),
                '[{"section_id":"422d352c-27f4-4bcc-a79c-e214d0accb13","children":[],"level":1,"search_key":"0","version":0},{"section_id":"fdafe850-400b-43f1-a48a-be6f579c2b61","children":[],"level":1,"search_key":"1","version":0},{"section_id":"c7b0881c-8187-40f1-8801-66f273d84332","children":[],"level":1,"search_key":"2","version":0}]'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1;`);
        await queryRunner.query(`
            DELETE FROM public.templates
            WHERE id = 4;
        `);
    }

}
