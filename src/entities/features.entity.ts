import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity('features')
export class Features {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    customer_id: string;

    @Column()
    key: string;

    @Column({ type: 'boolean', default: false })
    flag: boolean;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
} 