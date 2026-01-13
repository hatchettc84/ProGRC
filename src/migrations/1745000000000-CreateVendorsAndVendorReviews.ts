import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateVendorsAndVendorReviews1745000000000 implements MigrationInterface {
    name = 'CreateVendorsAndVendorReviews1745000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create vendors table
        await queryRunner.createTable(
            new Table({
                name: 'vendors',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'vendor_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'contact_email',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'contact_phone',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'website_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'industry',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'vendor_type',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        default: "'pending'",
                    },
                    {
                        name: 'risk_level',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'compliance_certifications',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'contract_details',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted',
                        type: 'boolean',
                        default: false,
                    },
                ],
            }),
            true,
        );

        // Create vendor_reviews table
        await queryRunner.createTable(
            new Table({
                name: 'vendor_reviews',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'vendor_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'review_type',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        default: "'pending'",
                    },
                    {
                        name: 'review_title',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'review_notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'assessment_results',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'compliance_checklist',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'risk_score',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'overall_rating',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'review_date',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'next_review_date',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'reviewed_by',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_by',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted',
                        type: 'boolean',
                        default: false,
                    },
                ],
            }),
            true,
        );

        // Create foreign keys
        // Check if customers table exists before creating foreign key
        const customersTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'customers'
            )
        `);
        
        if (customersTableExists[0]?.exists) {
            await queryRunner.createForeignKey(
                'vendors',
                new TableForeignKey({
                    columnNames: ['customer_id'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'customers',
                    onDelete: 'CASCADE',
                }),
            );
        } else {
            console.warn('customers table does not exist, skipping foreign key creation');
        }

        // Check if users table exists and has id as primary key before creating foreign key
        const usersTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.table_constraints 
                WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND constraint_type = 'PRIMARY KEY'
            )
        `);
        
        if (usersTableExists[0]?.exists) {
            await queryRunner.createForeignKey(
                'vendors',
                new TableForeignKey({
                    columnNames: ['created_by'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'users',
                    onDelete: 'SET NULL',
                }),
            );
        } else {
            console.warn('users table does not have primary key, skipping foreign key creation');
        }

        await queryRunner.createForeignKey(
            'vendor_reviews',
            new TableForeignKey({
                columnNames: ['vendor_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'vendors',
                onDelete: 'CASCADE',
            }),
        );

        // Check if users table exists before creating foreign keys
        const usersTableHasPK = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.table_constraints 
                WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND constraint_type = 'PRIMARY KEY'
            )
        `);
        
        if (usersTableHasPK[0]?.exists) {
            await queryRunner.createForeignKey(
                'vendor_reviews',
                new TableForeignKey({
                    columnNames: ['reviewed_by'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'users',
                    onDelete: 'SET NULL',
                }),
            );

            await queryRunner.createForeignKey(
                'vendor_reviews',
                new TableForeignKey({
                    columnNames: ['created_by'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'users',
                    onDelete: 'SET NULL',
                }),
            );
        } else {
            console.warn('users table does not have primary key, skipping foreign key creation for vendor_reviews');
        }

        // Create indexes
        await queryRunner.createIndex(
            'vendors',
            new TableIndex({
                name: 'IDX_vendors_customer_id',
                columnNames: ['customer_id'],
            }),
        );

        await queryRunner.createIndex(
            'vendors',
            new TableIndex({
                name: 'IDX_vendors_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'vendor_reviews',
            new TableIndex({
                name: 'IDX_vendor_reviews_vendor_id',
                columnNames: ['vendor_id'],
            }),
        );

        await queryRunner.createIndex(
            'vendor_reviews',
            new TableIndex({
                name: 'IDX_vendor_reviews_status',
                columnNames: ['status'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const vendorReviewsTable = await queryRunner.getTable('vendor_reviews');
        if (vendorReviewsTable) {
            const foreignKeys = vendorReviewsTable.foreignKeys;
            for (const fk of foreignKeys) {
                await queryRunner.dropForeignKey('vendor_reviews', fk);
            }
        }

        const vendorsTable = await queryRunner.getTable('vendors');
        if (vendorsTable) {
            const foreignKeys = vendorsTable.foreignKeys;
            for (const fk of foreignKeys) {
                await queryRunner.dropForeignKey('vendors', fk);
            }
        }

        // Drop indexes
        await queryRunner.dropIndex('vendor_reviews', 'IDX_vendor_reviews_status');
        await queryRunner.dropIndex('vendor_reviews', 'IDX_vendor_reviews_vendor_id');
        await queryRunner.dropIndex('vendors', 'IDX_vendors_status');
        await queryRunner.dropIndex('vendors', 'IDX_vendors_customer_id');

        // Drop tables
        await queryRunner.dropTable('vendor_reviews');
        await queryRunner.dropTable('vendors');
    }
}

