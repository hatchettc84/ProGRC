import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApplicationControlMapping } from "./applicationControlMapping.entity";

@Entity('application_control_evidence')
export class ApplicationControlEvidence {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    application_control_mapping_id: number;

    @Column('text')
    description: string;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    document: string;

    @Column('timestamp')
    created_at: Date;

    @Column('timestamp')
    updated_at: Date;

    @Column({ nullable: true })
    is_available: boolean;

    @Column({ type: 'uuid', nullable: true })
    uuid: string;

    @ManyToOne(() => ApplicationControlMapping, appControlMapping => appControlMapping.evidences)
    @JoinColumn({ name: 'application_control_mapping_id', referencedColumnName: 'id' })
    application_control_mapping: ApplicationControlMapping;
}
