import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetSourceTypeNew1751716631245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Delete all existing data from source_types table
        await queryRunner.query(`DELETE FROM public.source_types`);

        await queryRunner.query(`ALTER SEQUENCE public.source_types_id_seq RESTART WITH 1`);
        
        // Insert new source types data with explicit IDs
        await queryRunner.query(`
            INSERT INTO public.source_types (name, created_at, updated_at, template_schema, source_count, assets_count, id) VALUES
            ('FILE', '2024-11-12 09:39:40.525', '2024-11-12 09:39:40.525', NULL, NULL, NULL, 16),
            ('Identity Services', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 15),
            ('Files', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 14),
            ('Database', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 13),
            ('Cisco', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 12),
            ('Splunk', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 11),
            ('Google Workspace', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 10),
            ('Slack', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 9),
            ('Microsoft 365', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 8),
            ('Terraform', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 7),
            ('GitLab', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 6),
            ('VMware', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 5),
            ('Azure', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', '[{"type": "Column", "children": [{"key": "client_id", "type": "Text", "label": "Client ID", "placeholder": "client_id"}, {"key": "client_secret", "type": "Text", "label": "Client Secret", "placeholder": "client_secret"}, {"key": "tenant_id", "type": "Text", "label": "Tenant ID", "placeholder": "tenant_id"}, {"key": "subscription_id", "type": "Text", "label": "Subscription ID", "placeholder": "subscription_id"}]}]', NULL, NULL, 4),
            ('Kubernetes', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 3),
            ('AWS', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', '[{"type": "Column", "children": [{"key": "role_arn", "type": "Text", "label": "Role ARN", "placeholder": "arn:aws:iam::123456789012:role/MyRole"}, {"key": "alias", "type": "Text", "label": "Connection Alias", "placeholder": "Kovr Connection"}]}]', NULL, NULL, 2),
            ('GitHub', '2024-11-13 09:37:33.390698', '2024-11-13 09:37:33.390698', NULL, NULL, NULL, 1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete the inserted data
        await queryRunner.query(`DELETE FROM public.source_types WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)`);
    }

}
