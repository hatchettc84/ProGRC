import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum CustomerEventType {
    KICKOFF = 'kickoff',
    MONTHLY_CHECK_IN = 'monthly_check_in',
    QUARTERLY_VALUE_PLAN = 'quarterly_value_plan',
}

@Entity('customer_events')
export class CustomerEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customer_id: string;

    @Column()
    type: CustomerEventType;

    @Column()
    notes: string;

    @Column()
    date: Date;

    @Column()
    done: boolean;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    created_by: string;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    updated_by: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;
}
