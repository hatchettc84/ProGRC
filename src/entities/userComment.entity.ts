import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_comments')
export class UserComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    app_id: number;

    @Column({ type: 'int', nullable: false })
    standard_id: number;

    @Column({ type: 'int', nullable: true })
    control_id: number;

    @Column({ type: 'boolean', nullable: false })
    is_standard_level_comment: boolean;

    @Column({ type: 'jsonb', default: () => "'[]'" })
    tags: object;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ type: 'uuid', nullable: false })
    created_by: string;

    @Column({ type: 'uuid', nullable: true })
    updated_by: string;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'created_by'
    })
    createdByUser: User;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'updated_by'
    })
    modifiedByUser: User;
}