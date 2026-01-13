import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Standard } from './standard_v1.entity';
//import { Standards } from './standard.entity';

@Entity('customer_standards')
export class OrganizationStandards {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
  @Column({ type: 'varchar', nullable: true })
  customer_id: string;

  @ManyToOne(() => Standard)
  @JoinColumn({ name: 'standard_id' })
  standards: Standard;
  @Column({ type: 'int', nullable: true })
  standard_id: number;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: false })
  updated_at: Date;
}
