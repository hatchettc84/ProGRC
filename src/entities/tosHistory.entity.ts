import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Customer } from "./customer.entity";
import { User } from "./user.entity";

@Entity('tos_history')
export class TosHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id'
    })
    user: User;

    @Column({ type: 'uuid', nullable: false })
    user_id: string;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ nullable: false })
    customer_id: string;

    @Column({ type: 'timestamp', nullable: false })
    accepted_at: Date;

    @Column({ nullable: false })
    ip_address: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
