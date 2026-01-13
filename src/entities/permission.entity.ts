import { Column, PrimaryGeneratedColumn } from "typeorm";
import { Entity, Unique } from "typeorm";

export enum ApiMethodType {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}

@Entity({ name: 'permissions' })
@Unique(['api_path', 'method'])
export class Permission {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: 'text', nullable: false })
    api_path: string;
    
    @Column({ type: 'enum', enum: ApiMethodType, nullable: false })
    method: ApiMethodType;
    
    @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
    allowed_licenses: number[];
    
    @Column({ type: 'jsonb', nullable: false, default: () => "'[]'" })
    allowed_roles: number[];
    
    @Column({ type: 'boolean', nullable: false, default: false })
    allow_all: boolean;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}