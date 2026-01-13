import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPolicyTemplatesToTemplatesTable1767846551128 implements MigrationInterface {
    name = 'AddPolicyTemplatesToTemplatesTable1767846551128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if entity_type column exists, if not add it
            const columnExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'templates' 
                    AND column_name = 'entity_type'
                )
            `);
            
            if (!columnExists[0]?.exists) {
                console.log('Adding entity_type column to templates table...');
                await queryRunner.query(`
                    ALTER TABLE templates 
                    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(255) DEFAULT 'assessment'
                `);
                console.log('entity_type column added successfully');
            }

            // Get license type ID (assuming at least one exists)
            const licenseTypeResult = await queryRunner.query(`SELECT id FROM license_type LIMIT 1`);
            const licenseTypeId = licenseTypeResult[0]?.id || 1;

            // Get system user ID for created_by/updated_by (SuperAdmin)
            const userResult = await queryRunner.query(`SELECT id FROM users WHERE role_id = 1 LIMIT 1`);
            const userId = userResult[0]?.id || null;

            if (!userId) {
                console.warn('No SuperAdmin user found. Using default UUID for created_by/updated_by.');
            }

            // Copy policy templates to templates table
            await queryRunner.query(`
                INSERT INTO templates (
                    name,
                    entity_type,
                    license_type_id,
                    is_published,
                    is_editable,
                    is_default,
                    is_available,
                    llm_enabled,
                    type,
                    standard_ids,
                    customer_ids,
                    created_by,
                    updated_by,
                    upload_date,
                    update_date,
                    outline
                )
                SELECT 
                    pt.name,
                    'policy'::varchar as entity_type,
                    $1::int as license_type_id,
                    true as is_published,
                    true as is_editable,
                    false as is_default,
                    true as is_available,
                    false as llm_enabled,
                    'word'::varchar as type,
                    '{}'::int[] as standard_ids,
                    '{}'::varchar[] as customer_ids,
                    COALESCE(pt.created_by::uuid, $2::uuid) as created_by,
                    COALESCE(pt.created_by::uuid, $2::uuid) as updated_by,
                    COALESCE(pt.created_at, NOW()) as upload_date,
                    COALESCE(pt.updated_at, NOW()) as update_date,
                    '{}'::json as outline
                FROM policy_template pt
                WHERE NOT EXISTS (
                    SELECT 1 FROM templates t 
                    WHERE t.name = pt.name AND t.entity_type = 'policy'
                )
            `, [licenseTypeId, userId || '00000000-0000-0000-0000-000000000000']);

            // Create template sections for each policy template
            await queryRunner.query(`
                INSERT INTO templates_section (
                    template_id,
                    title,
                    section_id,
                    html_content,
                    is_active,
                    type,
                    parent_id,
                    is_looped,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                SELECT 
                    t.id as template_id,
                    t.name as title,
                    gen_random_uuid()::varchar as section_id,
                    pt.content->>'htmlContent' as html_content,
                    true as is_active,
                    'GLOBAL' as type,
                    NULL as parent_id,
                    false as is_looped,
                    COALESCE(t.created_by, $1::uuid) as created_by,
                    COALESCE(t.updated_by, $1::uuid) as updated_by,
                    COALESCE(t.upload_date, NOW()) as created_at,
                    COALESCE(t.update_date, NOW()) as updated_at
                FROM templates t
                INNER JOIN policy_template pt ON t.name = pt.name
                WHERE t.entity_type = 'policy'
                AND NOT EXISTS (
                    SELECT 1 FROM templates_section ts 
                    WHERE ts.template_id = t.id
                )
            `, [userId || '00000000-0000-0000-0000-000000000000']);

            console.log('Policy templates successfully added to templates table');
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Delete template sections for policy templates
            await queryRunner.query(`
                DELETE FROM templates_section ts
                WHERE EXISTS (
                    SELECT 1 FROM templates t 
                    WHERE t.id = ts.template_id 
                    AND t.entity_type = 'policy'
                )
            `);

            // Delete policy templates from templates table
            await queryRunner.query(`
                DELETE FROM templates WHERE entity_type = 'policy'
            `);

            console.log('Policy templates successfully removed from templates table');
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
}
