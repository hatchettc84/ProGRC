import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('reset_password_tokens')
export class ResetPasswordToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;

    @Column()
    user_email: string;

    @Column()
    token_hash: string;

    @Column()
    expires_at: Date;

    @Column({ nullable: true })
    used_at: Date;

    @Column()
    created_by: string;

    @Column()
    created_at: Date;
}
