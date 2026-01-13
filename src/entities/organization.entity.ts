import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logo_image_key: string;

  @Column()
  organization_name: string;

  @Column({ nullable: true })
  license_type: string;

  @Column({ default: false })
  is_onboarding_complete: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  created_by: {
    name: string;
    email: string;
  };

  @Column()
  license_type_id: number;

  @Column({ type: 'jsonb', nullable: true })
  license_type_data: {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    licenseRule: {
      id: number;
      name: string;
      license_type_id: number;
      number_of_applications: number;
      number_of_assessments: number;
      standards_per_application: number;
      available_standards: number[];
      available_templates: number[];
      created_at: Date;
      updated_at: Date;
    };
  };

  @Column()
  license_start_date: Date;

  @Column()
  license_end_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  csms: Array<{
    id: string;
    created_at: Date;
    name: string;
    email: string;
  }>;
} 