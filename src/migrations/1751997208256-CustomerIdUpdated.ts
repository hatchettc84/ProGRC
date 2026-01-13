import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerIdUpdated1751997208256 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE OR REPLACE FUNCTION public.generate_unique_short_id()
RETURNS character varying
LANGUAGE plpgsql
AS $function$
DECLARE
    short_id VARCHAR(8);
BEGIN
    LOOP
        -- Generate a random short ID (8 characters from md5 hash)
        short_id := substring(md5(gen_random_uuid()::text), 1, 8);

        -- Skip if the ID matches JavaScript exponential format like 1e7, 2e10
        IF short_id ~ '^[0-9]e[0-9]+$' THEN
            CONTINUE;
        END IF;

        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM customers WHERE id = short_id) THEN
            -- If it doesn't exist, return the generated ID
            RETURN short_id;
        END IF;

        -- Otherwise, loop and try generating again
    END LOOP;
END;
$function$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS public.generate_unique_short_id();
        `);
    }

}
