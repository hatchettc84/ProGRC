import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Customer } from "./customer.entity";
import { User } from "./user.entity";

@Entity('customer_csms')
export class CustomerCsm {
    @PrimaryColumn()
    customer_id: string;

    @PrimaryColumn()
    user_id: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    role_id: number;
    
    @ManyToOne(() => Customer, customer => customer.customer_csms)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User, user => user.csms)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
