import { s3Transformer } from "src/utils/entity-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum TrustCenterStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

@Entity('trust_centers')
export class TrustCenter {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    app_id: number;

    @Column()
    assessment_id: number;

    @Column()
    customer_id: string;

    @Column()
    name: string;

    @Column({
        nullable: true,
        transformer: s3Transformer()
    })
    file_path: string;

    @Column()
    approval_date: Date;

    @Column()
    submission_date: Date;

    @Column()
    status: TrustCenterStatus = TrustCenterStatus.PENDING;

    @Column()
    assessment_version: number;

    @Column()
    created_at: Date;

    @Column()
    created_by: string;

    @Column()
    updated_at: Date;

    @Column()
    updated_by: string;

    @Column()
    deleted: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    updated_by_user: User;
}
