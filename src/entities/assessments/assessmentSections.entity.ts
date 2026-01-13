import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('assessment_sections')
export class AssessmentSections {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({ type: 'int' })
  assessment_id: number;

  @Column({ type: 'varchar' })
  section_id: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_on: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ name: 'content_hash', type: 'varchar', length: 32, nullable: true })
  content_hash: string;

  @Column({ type: 'json' })
  content: any;

  @Column({ type: 'varchar', nullable: true })
  s3_path: string;

  @Column({ type: 'int', nullable: true })
  copy_of: number;
}
