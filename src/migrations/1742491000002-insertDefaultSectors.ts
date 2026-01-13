import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultSectors1742491000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO sectors (name, description) VALUES
            ('Select an industry', 'Default option for sector selection'),
            ('Technology', 'Companies involved in software, hardware, IT services, and digital solutions'),
            ('Healthcare', 'Organizations providing medical services, healthcare products, and health insurance'),
            ('Finance & Banking', 'Financial institutions, banks, investment firms, and financial services'),
            ('Education', 'Educational institutions, training providers, and educational technology companies'),
            ('Government', 'Government agencies, public sector organizations, and regulatory bodies'),
            ('Retail', 'Businesses involved in selling goods and services to consumers'),
            ('Manufacturing', 'Companies engaged in production and manufacturing of goods'),
            ('Energy & Utilities', 'Organizations in power generation, distribution, and utility services'),
            ('Insurance', 'Insurance providers and related financial services'),
            ('Telecommunications', 'Companies providing communication and networking services'),
            ('Other', 'Other industries not covered by the above categories')
            ON CONFLICT (name) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM sectors 
            WHERE name IN (
                'Select an industry',
                'Technology',
                'Healthcare',
                'Finance & Banking',
                'Education',
                'Government',
                'Retail',
                'Manufacturing',
                'Energy & Utilities',
                'Insurance',
                'Telecommunications',
                'Other'
            );
        `);
    }
} 