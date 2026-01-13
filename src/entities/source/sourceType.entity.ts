import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('source_types')
export class SourceType {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'json', nullable: true })
  template_schema: any;

  @Column({ type: 'int', nullable: true })
  source_count: number;

  @Column({ type: 'int', nullable: true })
  assets_count: number;
}
