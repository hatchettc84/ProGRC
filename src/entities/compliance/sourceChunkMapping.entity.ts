import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SourceV1 } from "../source/sourceV1.entity";
import { ControlChunkMapping } from "./controlChunkMapping.entity";

@Entity('source_chunk_mapping')
export class SourceChunkMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chunk_id: number;

    @Column()
    source_id: number;

    @Column()
    customer_id: string;

    @Column()
    app_id: number;

    @Column()
    chunk_text: string;

    @Column({ type: 'text', nullable: true })
    chunk_emb: string | null; // Stored as pgvector format: "[1,2,3,...]"

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => SourceV1)
    @JoinColumn({ name: 'source_id', referencedColumnName: 'id' })
    source: SourceV1;

    @Column({ default: true })
    is_active: boolean;

    source_file: string;

    @Column()
    line_number: number;

    @Column()
    page_number: number;

    @Column()
    offset: number;

    @Column()
    limit: number;
    
    @OneToOne(() => ControlChunkMapping, (controlChunkMapping) => controlChunkMapping.source_chunk_mapping)
    @JoinColumn({ name: 'chunk_id',  referencedColumnName: 'chunk_id' })
    control_chunk_mapping: ControlChunkMapping;

}
