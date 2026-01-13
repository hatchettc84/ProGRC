import { s3Transformer } from 'src/utils/entity-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { SourceV1 } from './sourceV1.entity';

@Entity('source_version')
export class SourceVersion {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ type: 'int' })
  source_id: number;

  @ManyToOne(() => SourceV1, (source) => source.source_versions)
  @JoinColumn({ name: 'source_id' })
  source: SourceV1;

  @Column({ type: 'varchar', nullable: true, transformer: s3Transformer()  })
  file_bucket_key: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'int', nullable: true })
  text_version: number;

  @Column({ type: 'boolean', default: false })
  is_text_available: boolean;

  @Column({ type: 'varchar', nullable: true })
  text_s3_path: string;

  @Column({ type: 'varchar', nullable: true })
  text_config: string;

  @CreateDateColumn({ type: 'timestamp' })
  text_created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  text_updated_at: Date;
}
