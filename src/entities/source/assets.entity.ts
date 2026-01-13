import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SourceType } from './sourceType.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  source_version: number;

  @Column({ type: 'uuid' })
  asset_id: string;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'int' })
  app_id: number;


  @Column({ type: 'int' })
  source_id: number;

  @ManyToOne(() => SourceType)
  @JoinColumn({ name: 'source_type_id' })
  source_type: SourceType;

  @Column({ type: 'int' })
  source_type_id: number;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'text', nullable: true })
  llm_summary: string;

  @Column({ type: 'tsvector', nullable: true })
  llm_embeddings_small: number[];

  @Column({ type: 'tsvector', nullable: true })
  llm_embeddings_large: number[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;
}
