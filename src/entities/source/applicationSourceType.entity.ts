import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('application_source_type')
export class SourceAsset {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({ type: 'int' })
  source_type: number;


  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'int', nullable: true })
  source_count: number;

  @Column({ type: 'int', nullable: true })
  assets_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

}
