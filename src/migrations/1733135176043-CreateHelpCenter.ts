import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHelpCenter1733135176043 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE help_center_articles (
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

            CREATE INDEX help_center_articles_category_id_order_index ON help_center_articles (category_key, order_index);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE help_center_articles');
    }

}
