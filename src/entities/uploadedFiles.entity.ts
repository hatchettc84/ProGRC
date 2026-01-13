import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum FileStatus {
    VERIFIED = "VERIFIED",
    UNVERIFIED = "UNVERIFIED",
    DELETED = "DELETED",
  }

@Entity("uploaded_file_details")
export class UploadedFileDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    customerId: string;

    @Column({ type: "varchar" })
    s3FilePath: string;

    @Column({ type: "varchar" })
    status: string;

    @Column({ type: "uuid" })
    createdBy: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
}
