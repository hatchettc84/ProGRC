import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;

    @Column()
    token: string;

    @Column()
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    revoked_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
} 