import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum RecommendationStatus {
    NEW = 'NEW',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    IMPLEMENTED = 'IMPLEMENTED',
    N_A = 'N/A',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
    ACTIONED = 'ACTIONED'
}

export enum RecommendationAction {
    ACCEPT = 'ACCEPT',
    REJECT = 'REJECT'
}

@Entity('application_control_recommendation')
export class ApplicationControlRecommendation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    application_id: number;

    @Column({ nullable: true })
    control_id: number;

    @Column()
    standard_id: number;

    @Column()
    recommendation: string;

    @Column({
        type: 'enum',
        enum: RecommendationStatus,
        default: RecommendationStatus.NEW
    })
    status: RecommendationStatus;

    @Column({
        type: 'enum',
        enum: RecommendationAction,
        nullable: true
    })
    action: RecommendationAction;

    @Column({ nullable: true })
    cluster: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
