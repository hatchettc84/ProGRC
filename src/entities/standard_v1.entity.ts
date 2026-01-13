import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Framework } from './framework.entity';
import { s3Transformer } from 'src/utils/entity-transformer';

@Entity('standard')
export class Standard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    framework_id: number;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'text', nullable: true })
    short_description?: string;

    @Column({ type: 'text', nullable: true })
    long_description?: string;

    @Column({ type: 'text', nullable: true,
        transformer: s3Transformer()
     })
    path?: string;

    @Column({ type: 'text', array: true, nullable: true })
    labels?: string[];

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @ManyToOne(() => Framework)
    @JoinColumn({ name: 'framework_id' })
    framework: Framework;

    @Column({ type: 'int', nullable: true })
    index: number;
}
