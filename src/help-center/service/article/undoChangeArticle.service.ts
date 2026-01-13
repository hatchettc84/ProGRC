import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { Repository } from "typeorm";

@Injectable()
export class UndoChangeArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly helpCenterArticleRepo: Repository<HelpCenterArticle>,
    ) { }

    async undoChangeArticle(userInfo: { userId: string }, id: number): Promise<void> {
        const article = await this.helpCenterArticleRepo.findOneOrFail({
            where: { id },
        });
        await this.helpCenterArticleRepo.update(id, {
            drafted_metadata: article?.published_metadata,
            drafted_content: article?.published_content,
            updated_at: new Date(),
            updated_by: userInfo.userId,
        });
    }
}
