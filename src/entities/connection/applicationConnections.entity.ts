import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("application_connections")
export class ApplicationConnection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  application_id: number;

  @Column({ type: "int" })
  source_type: number;

  @Column({ type: "json", nullable: false, default: {} })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "timestamp", nullable: true })
  last_synced_at: Date;

  @Column({ type: "int", nullable: true })
  source_id: number;
}
