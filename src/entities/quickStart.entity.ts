import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("check_list")
export class CheckList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    check_list_item: string;

    @Column({ type: "varchar", nullable: true })
    user_email: string | null;

    @Column({ type: "integer", nullable: true })
    app_id: number | null;

    @Column({ type: "varchar", nullable: true })
    customer_id: string | null;

    @CreateDateColumn({ type: "timestamp", default: () => "now() AT TIME ZONE 'UTC'" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "now() AT TIME ZONE 'UTC'", onUpdate: "now() AT TIME ZONE 'UTC'" })
    updated_at: Date;
}
