import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Framework } from './framework.entity';

@Entity('customer_frameworks')
export class OrganizationFrameworks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
  @Column({ type: 'varchar', nullable: true })
  customer_id: string;

  @ManyToOne(() => Framework)
  @JoinColumn({ name: 'framework_id' })
  framework: Framework;
  @Column({ type: 'int', nullable: true })
  framework_id: number;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;
}

