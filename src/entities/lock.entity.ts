import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity("locks")
export class Lock {
  @PrimaryColumn()
  name: string;

  @CreateDateColumn({ name: "acquired_at" })
  acquiredAt: Date;
}
