import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { VendorReview } from './vendorReview.entity';

export enum VendorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum VendorRiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'vendor_name' })
  vendorName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, name: 'contact_email' })
  contactEmail: string;

  @Column({ nullable: true, name: 'contact_phone' })
  contactPhone: string;

  @Column({ nullable: true, name: 'website_url' })
  websiteUrl: string;

  @Column({ nullable: true, name: 'industry' })
  industry: string;

  @Column({ nullable: true, name: 'vendor_type' })
  vendorType: string; // e.g., 'software', 'service', 'hardware', 'cloud'

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @Column({
    type: 'enum',
    enum: VendorRiskLevel,
    nullable: true,
    name: 'risk_level',
  })
  riskLevel: VendorRiskLevel;

  @Column({ type: 'jsonb', nullable: true, name: 'compliance_certifications' })
  complianceCertifications: string[]; // e.g., ['SOC2', 'ISO27001', 'GDPR']

  @Column({ type: 'jsonb', nullable: true, name: 'contract_details' })
  contractDetails: Record<string, any>; // Contract dates, terms, etc.

  @Column({ nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ nullable: true, name: 'updated_by' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => VendorReview, (review) => review.vendor)
  reviews: VendorReview[];
}

