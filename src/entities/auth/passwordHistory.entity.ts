import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";

@Entity('password_history')
export class PasswordHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;


    @Column()
    password_hash: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
} 