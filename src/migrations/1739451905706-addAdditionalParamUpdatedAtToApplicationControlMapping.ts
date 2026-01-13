import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdditionalParamUpdatedAtToApplicationControlMapping1739451905706 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_mapping 
            ADD COLUMN IF NOT EXISTS additional_param_updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;
            
          `);

        await queryRunner.query(`DROP VIEW IF EXISTS application_control_mapping_view;`);

        await queryRunner.query(`
               CREATE OR REPLACE  VIEW application_control_mapping_view AS
              SELECT id,
         control_id,
         created_at,
         updated_at,
         app_id,
         standard_id,
         risk_level,
         is_excluded,
         exception_reason,
         implementation_explanation_emb,
         is_reviewed,
         additional_param_updated_at,
  
         -- Fixing the CASE statement syntax
         CASE
             WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN 0
             ELSE 1
         END AS is_user_modified_status,
  
         CASE
             WHEN user_implementation_explanation IS NULL THEN 0
             ELSE 1
         END AS is_user_modified_explanation,
  
         CASE
             WHEN user_implementation_explanation IS NULL THEN implementation_explanation
             ELSE user_implementation_explanation
         END AS implementation_explanation,
  
         CASE
             WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN implementation_status
             ELSE user_implementation_status
         END AS implementation_status,
  
         CASE
             WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN
                 CASE
                     WHEN implementation_status = 'not_implemented' THEN 0
                     WHEN implementation_status = 'implemented' THEN 100
                     WHEN implementation_status = 'partially_implemented' THEN COALESCE(NULLIF(percentage_completion, 0), 50)
                     WHEN implementation_status = 'not_applicable' THEN 0
                     WHEN implementation_status = 'planned' THEN 0
                     WHEN implementation_status = 'alternative_implementation' THEN 100
                     ELSE 0
                 END
             ELSE
                 CASE
                     WHEN user_implementation_status = 'not_implemented' THEN 0
                     WHEN user_implementation_status = 'implemented' THEN 100
                     WHEN user_implementation_status = 'partially_implemented' THEN COALESCE(NULLIF(percentage_completion, 0), 50)
                     WHEN user_implementation_status = 'not_applicable' THEN 0
                     WHEN user_implementation_status = 'planned' THEN 0
                     WHEN user_implementation_status = 'alternative_implementation' THEN 100
                     ELSE 0
                 END
         END AS num,
  
         CASE
             WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN
                 CASE
                     WHEN implementation_status IN ('not_implemented', 'implemented', 'partially_implemented', 'planned', 'alternative_implementation') THEN 1
                     WHEN implementation_status = 'not_applicable' THEN 0
                     ELSE 0
                 END
             ELSE
                 CASE
                     WHEN user_implementation_status IN ('not_implemented', 'implemented', 'partially_implemented', 'planned', 'alternative_implementation') THEN 1
                     WHEN user_implementation_status = 'not_applicable' THEN 0
                     ELSE 0
                 END
         END AS deno
  FROM application_control_mapping;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_mapping DROP COLUMN IF EXISTS additional_param_updated_at;
            `);

        await queryRunner.query(`DROP VIEW IF EXISTS application_control_mapping_view;`);

        await queryRunner.query(`
                CREATE OR REPLACE  VIEW application_control_mapping_view AS
               SELECT id,
          control_id,
          created_at,
          updated_at,
          app_id,
          standard_id,
          risk_level,
          is_excluded,
          exception_reason,
          implementation_explanation_emb,
          is_reviewed,
   
          -- Fixing the CASE statement syntax
          CASE
              WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN 0
              ELSE 1
          END AS is_user_modified_status,
   
          CASE
              WHEN user_implementation_explanation IS NULL THEN 0
              ELSE 1
          END AS is_user_modified_explanation,
   
          CASE
              WHEN user_implementation_explanation IS NULL THEN implementation_explanation
              ELSE user_implementation_explanation
          END AS implementation_explanation,
   
          CASE
              WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN implementation_status
              ELSE user_implementation_status
          END AS implementation_status,
   
          CASE
              WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN
                  CASE
                      WHEN implementation_status = 'not_implemented' THEN 0
                      WHEN implementation_status = 'implemented' THEN 100
                      WHEN implementation_status = 'partially_implemented' THEN COALESCE(NULLIF(percentage_completion, 0), 50)
                      WHEN implementation_status = 'not_applicable' THEN 0
                      WHEN implementation_status = 'planned' THEN 0
                      WHEN implementation_status = 'alternative_implementation' THEN 100
                      ELSE 0
                  END
              ELSE
                  CASE
                      WHEN user_implementation_status = 'not_implemented' THEN 0
                      WHEN user_implementation_status = 'implemented' THEN 100
                      WHEN user_implementation_status = 'partially_implemented' THEN COALESCE(NULLIF(percentage_completion, 0), 50)
                      WHEN user_implementation_status = 'not_applicable' THEN 0
                      WHEN user_implementation_status = 'planned' THEN 0
                      WHEN user_implementation_status = 'alternative_implementation' THEN 100
                      ELSE 0
                  END
          END AS num,
   
          CASE
              WHEN user_implementation_status IS NULL OR user_implementation_status = '' THEN
                  CASE
                      WHEN implementation_status IN ('not_implemented', 'implemented', 'partially_implemented', 'planned', 'alternative_implementation') THEN 1
                      WHEN implementation_status = 'not_applicable' THEN 0
                      ELSE 0
                  END
              ELSE
                  CASE
                      WHEN user_implementation_status IN ('not_implemented', 'implemented', 'partially_implemented', 'planned', 'alternative_implementation') THEN 1
                      WHEN user_implementation_status = 'not_applicable' THEN 0
                      ELSE 0
                  END
          END AS deno
   FROM application_control_mapping;
           `);
    }

}
