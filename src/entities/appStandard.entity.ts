import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { App } from "./app.entity";
import { Standard } from "./standard_v1.entity";

@Entity('app_standards')
export class AppStandard {
    @ManyToOne(() => App)
    @JoinColumn({
        name: 'app_id'
    })
    app: App;

    @PrimaryColumn({ type: 'bigint' })
    app_id: number;

    @PrimaryColumn({ type: 'int' })
    standard_id: number;

    @ManyToOne(() => Standard)
    @JoinColumn({
        name: 'standard_id',
    })
    standardV1: Standard;

    @Column({ type: 'boolean', default: false })
    have_pending_compliance: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ type: 'timestamp' })
    updated_at: Date;

    @Column({ type: 'timestamp' })
    source_updated_at: Date;

    @Column({ type: 'timestamp' })
    compliance_updated_at: Date;

    @Column({ type: 'boolean', default: false })
    is_crm_available: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    crm_file_path: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    temp_crm_file_path: string;

    @Column({ type: 'timestamp', nullable: true })
    crm_file_uploaded_at: Date;
}
