import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterApplicationControlMappingAddUserStatusAndUserExplation1737967030620 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'application_control_mapping'
                AND column_name = 'user_implementation_status'
              ) THEN
                ALTER TABLE public.application_control_mapping
                ADD COLUMN user_implementation_status varchar(255) NULL;
              END IF;
            END;
            $$;
          `);
      
          await queryRunner.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'application_control_mapping'
                AND column_name = 'user_implementation_explanation'
              ) THEN
                ALTER TABLE public.application_control_mapping
                ADD COLUMN user_implementation_explanation json NULL;
              END IF;
            END;
            $$;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'application_control_mapping'
                AND column_name = 'user_implementation_status'
              ) THEN
                ALTER TABLE public.application_control_mapping
                DROP COLUMN user_implementation_status;
              END IF;
            END;
            $$;
          `);
      
          // Remove the 'user_implementation_explanation' column if it exists
          await queryRunner.query(`
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'application_control_mapping'
                AND column_name = 'user_implementation_explanation'
              ) THEN
                ALTER TABLE public.application_control_mapping
                DROP COLUMN user_implementation_explanation;
              END IF;
            END;
            $$;
          `);
    }

}
