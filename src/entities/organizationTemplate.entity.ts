import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Templates } from './template.entity';

@Entity('customer_templates')
export class OrganizationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
  @Column({ nullable: true })
  customer_id: string;

  @ManyToOne(() => Templates)
  @JoinColumn({ name: 'template_id' })
  template: Templates;
  @Column({ nullable: true })
  template_id: number;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;

  @Column({ type: 'varchar' })
  logo_path: string
}
