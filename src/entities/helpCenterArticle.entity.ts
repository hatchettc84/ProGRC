import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum HelpCenterArticleStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
}

export interface Article {
    title: string;
    description: string;
    thumbnail: string;
    slug: string;
    keywords: string;
}

@Entity('help_center_articles')
export class HelpCenterArticle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'jsonb',
        default: {},
    })
    published_metadata: Article;

    @Column()
    published_content: string;

    @Column({
        type: 'jsonb',
        default: {},
    })
    drafted_metadata: Article;

    @Column()
    drafted_content: string;

    @Column()
    status: HelpCenterArticleStatus;

    @Column()
    order_index: number;

    @Column()
    category_key: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    created_by: string;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    updated_by: string;

    @Column()
    published_at: Date;

    @Column()
    published_by: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;

    thumbnail_url: string;

    @Column({default: false, nullable: true})
    use_as_guide: boolean;


    isDraftAndPublishedSame(): boolean {
        if (!this.published_metadata || !this.published_content) {
            return true;
        }
        return this.isDraftedMetadataSameAsPublished() && this.isDraftedContentSameAsPublished();
    }

    private isDraftedMetadataSameAsPublished(): boolean {
        return JSON.stringify(this.drafted_metadata) === JSON.stringify(this.published_metadata);
    }

    private isDraftedContentSameAsPublished(): boolean {
        return this.drafted_content === this.published_content;
    }
}
