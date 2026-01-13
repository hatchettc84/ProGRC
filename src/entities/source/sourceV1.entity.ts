import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user.entity";
import { SourceType } from "./sourceType.entity";
import { SourceVersion } from "./sourceVersion.entity";

@Entity('source')
export class SourceV1 {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    customer_id: string;

    @Column()
    app_id: number;


    @Column({ type: 'json' })
    data: any;

    @Column()
    name: string;

    @Column({ type: 'json' })
    summary: any;

    @Column()
    is_active: boolean;

    @Column()
    source_type: number;

    @Column()
    current_version: number;

    @Column()
    created_by: string;

    @Column()
    updated_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => SourceType)
    @JoinColumn({ name: 'source_type' })
    type_source: SourceType

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'updated_by' })
    updated_by_user: User;

    @Column({ type: 'varchar', nullable: true })
    file_bucket_key: string;

    @Column({ type: 'text', array: true, nullable: true })
    tags: string[];

    @Column({ nullable: true })
    is_available: boolean;

    @Column({ type: 'uuid', nullable: true })
    uuid: string;

    @Column({ type: 'json', nullable: true })
    control_mapping: any;

    @OneToMany(() => SourceVersion, (sourceVersion) => sourceVersion.source)
    source_versions: SourceVersion[];

    @OneToOne(() => SourceVersion, (sourceVersion) => sourceVersion.source)
    @JoinColumn({ name: 'current_version' })
    current_version_entity: SourceVersion;

}
