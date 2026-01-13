import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { ApplicationControlMapping } from './applicationControlMapping.entity';
import { StandardControlMapping } from './standardControlMapping.entity';
import { ControlChunkMapping } from './controlChunkMapping.entity';

@Entity('control')
export class Control {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    framework_id: number;

    @Column({ type: 'int', nullable: true })
    control_parent_id: number | null;

    @Column({ type: 'varchar' })
    control_name: string;

    @Column({ type: 'varchar' })
    family_name: string;

    @Column({ type: 'varchar' })
    control_long_name: string;

    @Column({ type: 'text' })
    control_text: string;

    @Column({ type: 'text' })
    control_discussion: string | null;

    @Column({ type: 'text' })
    control_summary: string;

    @Column({ type: 'text' })
    control_eval_criteria: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column()
    order_index: number;

    @Column({ type: 'text' })
    control_short_summary: string;


    @OneToOne(() => StandardControlMapping, (standardControlMapping) => standardControlMapping.control)
    standard_control_mapping: StandardControlMapping

    @OneToOne(() => ApplicationControlMapping, (applicationControlMapping) => applicationControlMapping.control)
    @JoinColumn({ name: 'id', referencedColumnName: 'control_id' })
    application_control_mapping: ApplicationControlMapping

    @OneToMany(() => ControlChunkMapping, (controlChunkMapping) => controlChunkMapping.control)
    control_chunk_mapping: ControlChunkMapping[]

    getControlFullName(): string {
        return this.control_name + ' ' + this.control_long_name
    }
}
