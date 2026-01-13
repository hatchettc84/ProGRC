import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
// import { AssessmentInfo } from "./assessmentInfo.entity";
// import { Controls } from "./controls.entity";
// import { Sections } from "./section.entity";
// import { User } from "./user.entity";

@Entity('comments')
export class Comments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @ManyToOne(() => Sections)
    // @JoinColumn({
    //     name: 'section_id'
    // })
    // section: Sections;

    @Column()
    doc_id: string;

    @Column()
    section_id: string;

    @Column({ nullable: true })
    element_id: string;

    @Column()
    comment: string;

    @Column({ nullable: true })
    selected_text: string;

    @Column()
    created_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id'
    })
    user: User;
    @Column()
    user_id: string;
}
