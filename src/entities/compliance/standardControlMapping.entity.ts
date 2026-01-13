import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Control } from "./control.entity";

@Entity('standard_control_mapping')
export class StandardControlMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    standard_id: number;

    @Column()
    control_id: number;

    @Column()
    additional_selection_parameters: string;

    @Column()
    additional_guidance: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => Control, (control) => control.standard_control_mapping)
    @JoinColumn({ name: 'control_id' })
    control: Control;
}
