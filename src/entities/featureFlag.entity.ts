import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  description: string;

  @Column({ type: 'boolean', default: false, name: 'is_enabled' })
  isEnabled: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_globally_enabled' })
  isGloballyEnabled: boolean;

  @Column({ type: 'text', array: true, default: '[]', name: 'whitelist' })
  whitelist: string[];

  @Column({ type: 'text', array: true, default: '[]', name: 'blacklist' })
  blacklist: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
