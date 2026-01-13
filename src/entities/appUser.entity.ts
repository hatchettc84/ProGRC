import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { App } from "./app.entity";
import { User } from "./user.entity";

export enum AppUserRole {
    ADMIN = 'admin',
    OWNER = 'owner',
    MEMBER = 'member',
    AUDITOR = 'auditor',
    CSM_AUDITOR = 'csm_auditor',
}

@Entity('app_users')
export class AppUser {
    @ManyToOne(() => App)
    @JoinColumn({
        name: 'app_id'
    })
    app: App;

    @PrimaryColumn({ type: 'bigint' })
    app_id: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id'
    })
    user: User;

    @PrimaryColumn({ type: 'uuid' })
    user_id: string;

    @Column({
        type: 'enum',
        enum: AppUserRole,
    })
    role: AppUserRole;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ nullable: true })
    deleted_at: Date;
}
