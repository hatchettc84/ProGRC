import { MigrationInterface, QueryRunner } from "typeorm";

export class PopulateStandardControlMappings1767959654525 implements MigrationInterface {
    name = 'PopulateStandardControlMappings1767959654525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Map all NIST 800-53 controls (framework_id = 2) to all NIST 800-53 standards
        // Standards: 1,2,3,4,5,6,7,8,12,13 (all belong to framework 2)
        const nistStandards = [1, 2, 3, 4, 5, 6, 7, 8, 12, 13];
        
        for (const standardId of nistStandards) {
            await queryRunner.query(`
                INSERT INTO standard_control_mapping
                    (standard_id, control_id, additional_selection_parameters, additional_guidance, created_at, updated_at)
                SELECT ${standardId}, c.id, NULL, NULL, NOW(), NOW()
                FROM control c
                WHERE c.framework_id = 2
                  AND c.active = true
                  AND NOT EXISTS (
                      SELECT 1 
                      FROM standard_control_mapping scm 
                      WHERE scm.standard_id = ${standardId} 
                        AND scm.control_id = c.id
                  );
            `);
        }

        // Map CMMC 2.0 Level 1 controls (standard 9) - subset of NIST 800-171 controls
        // For now, map all framework 3 controls to CMMC standards
        // Standard 9: CMMC 2.0 Level 1
        // Standard 10: CMMC 2.0 Level 2
        const cmmcStandards = [9, 10];
        
        for (const standardId of cmmcStandards) {
            await queryRunner.query(`
                INSERT INTO standard_control_mapping
                    (standard_id, control_id, additional_selection_parameters, additional_guidance, created_at, updated_at)
                SELECT ${standardId}, c.id, NULL, NULL, NOW(), NOW()
                FROM control c
                WHERE c.framework_id = 3
                  AND c.active = true
                  AND NOT EXISTS (
                      SELECT 1 
                      FROM standard_control_mapping scm 
                      WHERE scm.standard_id = ${standardId} 
                        AND scm.control_id = c.id
                  );
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove mappings for standards we just added
        await queryRunner.query(`
            DELETE FROM standard_control_mapping 
            WHERE standard_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13)
        `);
    }
}
