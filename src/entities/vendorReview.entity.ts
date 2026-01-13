import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReviewType {
  INITIAL = 'initial',
  ANNUAL = 'annual',
  INCIDENT = 'incident',
  COMPLIANCE = 'compliance',
  RENEWAL = 'renewal',
}

@Entity('vendor_reviews')
export class VendorReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
    name: 'review_type',
  })
  reviewType: ReviewType;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ nullable: true, name: 'review_title' })
  reviewTitle: string;

  @Column({ type: 'text', nullable: true, name: 'review_notes' })
  reviewNotes: string;

  @Column({ type: 'jsonb', nullable: true, name: 'assessment_results' })
  assessmentResults: Record<string, any>; // Structured assessment data

  @Column({ type: 'jsonb', nullable: true, name: 'compliance_checklist' })
  complianceChecklist: Record<string, boolean>; // Compliance items checked

  @Column({ nullable: true, name: 'risk_score' })
  riskScore: number; // 0-100 risk score

  @Column({ nullable: true, name: 'overall_rating' })
  overallRating: number; // 1-5 rating

  @Column({ nullable: true, name: 'review_date' })
  reviewDate: Date;

  @Column({ nullable: true, name: 'next_review_date' })
  nextReviewDate: Date;

  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedBy: string;

  @Column({ nullable: true, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @ManyToOne(() => Vendor, (vendor) => vendor.reviews)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}

