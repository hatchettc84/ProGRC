import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';
import { AssessmentOutline } from './assessmentOutline.entity';
import { Templates } from '../template.entity';

@Entity('assessment')
export class AssessmentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({ type: 'json' })
  frameworks: number[]; // Assuming frameworks is a list of integers, adjust if it's different

  @Column({ type: 'int' })
  template_id: number;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_on: Date;

  @Column({ type: 'varchar' })
  updated_by: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_on: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  temp_location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updated_by_user: User;

  @OneToOne(() => AssessmentOutline, (outline) => outline.assessment)
  @JoinColumn({ name: 'id', referencedColumnName: 'assessment_id' })
  outline: AssessmentOutline;

  @ManyToOne(() => Templates)
  @JoinColumn({ name: 'template_id' })
  template: Templates;
}
