import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Control } from "./control.entity";
import { SourceChunkMapping } from "./sourceChunkMapping.entity";

@Entity('control_chunk_mapping')
export class ControlChunkMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    app_id: number;

    @Column()
    control_id: number;

    @Column()
    chunk_id: number;

    @Column({ type: 'json' })
    reference_data: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: false })
    is_tagged: boolean;

    
    @ManyToOne(() => Control, (control) => control.control_chunk_mapping)
    @JoinColumn({ name: 'control_id' })
    control: Control;
    
    @OneToOne(() => SourceChunkMapping, (sourceChunkMapping) => sourceChunkMapping.control_chunk_mapping)
    source_chunk_mapping: SourceChunkMapping;
}
