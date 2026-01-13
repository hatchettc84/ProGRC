import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('framework')
  export class Framework {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', nullable: false })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description?: string;
  
    @Column({ type: 'text', nullable: true })
    path?: string;
  
    @Column({ type: 'int', nullable: true })
    version?: number;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @Column({ type: 'boolean', default: true })
    active: boolean;
  }
  