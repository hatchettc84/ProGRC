import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';

@Entity('related_controls_mapping')
export class RelatedControlsMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    a_control_id: number;

    @Column({ type: 'int', nullable: true })
    b_control_id: number;
}
