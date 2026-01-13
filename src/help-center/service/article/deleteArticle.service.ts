import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HelpCenterArticle } from "src/entities/helpCenterArticle.entity";
import { DeleteResult, EntityNotFoundError, Repository } from "typeorm";
import { SearchArticleService } from "./searchArticle.service";

@Injectable()
export class DeleteArticleService {
    constructor(
        @InjectRepository(HelpCenterArticle) private readonly articleRepository: Repository<HelpCenterArticle>,
        private readonly searchArticleService: SearchArticleService
    ) { }

    async deleteArticleById(id: number): Promise<void> {
        const result: DeleteResult = await this.articleRepository.delete({ id });

        if (result.affected === 0) {
            throw new EntityNotFoundError(HelpCenterArticle, id);
        }

        this.searchArticleService.removeDocument(id);
    }
}
