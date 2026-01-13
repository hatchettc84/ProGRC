import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AssessmentDetail } from './assessmentDetails.entity';

@Entity('assessment_outline')
export class AssessmentOutline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({ type: 'int' })
  assessment_id: number;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_on: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ name: 'outline_hash', type: 'varchar', length: 32, nullable: true })
  outline_hash: string;

  @Column({ type: 'json' })
  outline: any;

  @OneToOne(() => AssessmentDetail, (assessment) => assessment.outline)
  @JoinColumn({ name: 'assessment_id' })
  assessment: AssessmentDetail;
}
