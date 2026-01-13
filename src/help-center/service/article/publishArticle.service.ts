import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HelpCenterArticle, HelpCenterArticleStatus } from "src/entities/helpCenterArticle.entity";
import { Repository } from "typeorm";
import { SearchArticleService } from "./searchArticle.service";

@Injectable()
export class PublishArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly articleRepository: Repository<HelpCenterArticle>,
        private readonly searchArticleServcice: SearchArticleService
    ) { }

    async publishArticle(userInfo: { userId: string }, id: number): Promise<void> {
        const article: HelpCenterArticle = await this.articleRepository.findOneOrFail({
            where: { id },
        });

        await this.articleRepository.update({ id }, {
            status: HelpCenterArticleStatus.PUBLISHED,
            published_content: article.drafted_content,
            published_metadata: article.drafted_metadata,
            published_at: new Date(),
            updated_at: new Date(),
            updated_by: userInfo.userId,
            published_by: userInfo.userId,
        });

        this.searchArticleServcice.addOrUpdateDocument(id)
    }
}
