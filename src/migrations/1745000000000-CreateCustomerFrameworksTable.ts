import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerFrameworksTable1745000000000 implements MigrationInterface {
    name = 'CreateCustomerFrameworksTable1745000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create customer_frameworks table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.customer_frameworks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                customer_id VARCHAR NOT NULL,
                framework_id INT NOT NULL,
                created_by UUID NULL,
                updated_by UUID NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT FK_customer_frameworks_customer 
                    FOREIGN KEY (customer_id) 
                    REFERENCES customers(id) 
                    ON DELETE CASCADE,
                CONSTRAINT FK_customer_frameworks_framework 
                    FOREIGN KEY (framework_id) 
                    REFERENCES framework(id) 
                    ON DELETE CASCADE,
                CONSTRAINT UQ_customer_frameworks_unique 
                    UNIQUE (customer_id, framework_id)
            );
        `);

        // Create index for faster lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_frameworks_customer_id 
            ON public.customer_frameworks(customer_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_frameworks_framework_id 
            ON public.customer_frameworks(framework_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.customer_frameworks CASCADE;
        `);
    }
}

