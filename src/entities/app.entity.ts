import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AppUser } from "./appUser.entity";
import { Customer } from "./customer.entity";
import { Standard } from "./standard_v1.entity";
import { User } from "./user.entity";

@Entity('app')
export class App {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    desc: string;

    @Column({ nullable: true })
    url: string;

    @Column({ type: 'json', nullable: true })
    tags: string[];

    @Column()
    created_at: Date;
    @Column({ nullable: true })
    updated_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'created_by'
    })
    created_by_user: User;
    @Column({ type: 'uuid', nullable: true })
    created_by: string;


    @ManyToOne(() => User)
    @JoinColumn({
        name: 'updated_by'
    })
    updated_by_user: User;
    @Column({ type: 'uuid', nullable: true })
    updated_by: string;

    @OneToMany(() => AppUser, (appUser) => appUser.app)
    appUsers: AppUser[];

    appUser: AppUser;

    @ManyToOne(() => Customer)
    @JoinColumn({
        name: 'customer_id'
    })
    customer: Customer;
    @Column()
    customer_id: string;

    standards: Standard[];

    @Column({ nullable: true })
    deleted_at: Date;

    @Column({ nullable: true })
    is_locked: boolean;
}
