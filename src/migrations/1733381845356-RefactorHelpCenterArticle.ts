import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorHelpCenterArticle1733381845356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `CREATE TABLE help_center_articles_new (
                id BIGSERIAL PRIMARY KEY,
                drafted_metadata jsonb NOT NULL,
                drafted_content TEXT NOT NULL,
                published_metadata jsonb,
                published_content TEXT,
                category_key VARCHAR(255) NOT NULL,
                order_index INT NOT NULL DEFAULT 0,
                status VARCHAR(255) NOT NULL DEFAULT 'DRAFT',
                created_at TIMESTAMP NOT NULL,
                created_by UUID NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                updated_by UUID NOT NULL,
                published_at TIMESTAMP,
                published_by UUID
            );`
        )

        await queryRunner.query(
            `INSERT INTO help_center_articles_new (id, drafted_metadata, drafted_content, published_metadata, published_content, category_key, order_index, status, created_at, created_by, updated_at, updated_by, published_at, published_by)
            SELECT id, jsonb_build_object('title', title, 'description', description, 'thumbnail', thumbnail, 'slug', slug, 'keywords', keywords), drafted_content, jsonb_build_object('title', title, 'description', description, 'thumbnail', thumbnail, 'slug', slug, 'keywords', keywords), published_content, category_key, order_index, status, created_at, created_by, updated_at, updated_by, published_at, published_by
            FROM help_center_articles;`
        )

        await queryRunner.query('DROP INDEX help_center_articles_category_id_order_index');
        await queryRunner.query('DROP TABLE help_center_articles');
        await queryRunner.query('ALTER TABLE help_center_articles_new RENAME TO help_center_articles');

        await queryRunner.query('CREATE INDEX help_center_articles_category_id_order_index ON help_center_articles (category_key, order_index);');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE help_center_articles_old (
                id BIGSERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                drafted_content TEXT NOT NULL,
                published_content TEXT,
                thumbnail VARCHAR(255),
                slug VARCHAR(255) NOT NULL UNIQUE,
                category_key VARCHAR(255) NOT NULL,
                order_index INT NOT NULL DEFAULT 0,
                keywords VARCHAR(255) NOT NULL,
                status VARCHAR(255) NOT NULL DEFAULT 'DRAFT',
                created_at TIMESTAMP NOT NULL,
                created_by UUID NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                updated_by UUID NOT NULL,
                published_at TIMESTAMP,
                published_by UUID
            );
        `);

        await queryRunner.query(
            `INSERT INTO help_center_articles_old (id, title, description, drafted_content, published_content, thumbnail, slug, category_key, order_index, keywords, status, created_at, created_by, updated_at, updated_by, published_at, published_by)
            SELECT id, drafted_metadata->>'title', drafted_metadata->>'description', drafted_content, published_content, drafted_metadata->>'thumbnail', drafted_metadata->>'slug', category_key, order_index, drafted_metadata->>'keywords', status, created_at, created_by, updated_at, updated_by, published_at, published_by
            FROM help_center_articles;`
        )

        await queryRunner.query('DROP INDEX help_center_articles_category_id_order_index');
        await queryRunner.query('DROP TABLE help_center_articles');
        await queryRunner.query('ALTER TABLE help_center_articles_old RENAME TO help_center_articles');
        await queryRunner.query('CREATE INDEX help_center_articles_category_id_order_index ON help_center_articles (category_key, order_index);');
    }

}
