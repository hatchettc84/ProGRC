import { CloudFrontService } from 'src/app/cloudfront.service';
import { s3Transformer } from "src/utils/entity-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CustomerCsm } from './customerCsm.entity';
import { User } from "./user.entity";
import { LicenseType } from './lincenseType.entity';

@Entity('customers')
export class Customer {//also called organisation
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ nullable: true, transformer: s3Transformer() })
    logo_image_key: string;

    @Column({ nullable: true })
    owner_id: string;

    @Column({ default: 'N/A', nullable: true })
    organization_name: string;

    @Column({ nullable: true })
    license_type: string;//may be json array or may need a separate table.

    @ManyToOne(() => LicenseType)
    @JoinColumn({
        name: 'license_type_id'
    })
    licenseType: LicenseType;

    @Column({ nullable: true })
    license_type_id: number;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'created_by'
    })
    created_by_user: User;
    @Column({ type: 'uuid', nullable: true })
    created_by: string;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'updated_by'
    })
    updated: User;
    @Column({ type: 'uuid', nullable: true })
    updated_by: string;

    @OneToMany(() => User, member => member.customer)
    members: User[];

    @Column({ nullable: true, default: false })
    is_onboarding_complete: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true })
    deleted: boolean;

    @Column({ nullable: true })
    is_logo_available: boolean;

    @UpdateDateColumn({ nullable: true , name: 'logo_updated_at' })
    logo_updated_at: Date;

    @Column({ nullable: true })
    temp_logo_image_key: string;

    @OneToMany(() => CustomerCsm, customerCsm => customerCsm.customer)
    customer_csms: CustomerCsm[];

    @Column({ type: 'timestamp', nullable: true })
    license_start_date: Date;

    @Column({ type: 'timestamp', nullable: true })
    license_end_date: Date;

    @Column({ type: 'boolean',nullable: true })
    enable_calendly: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    calendly_url: string;

}
