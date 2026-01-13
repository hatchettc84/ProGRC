import { ForbiddenException, Injectable } from "@nestjs/common";
import { Templates } from "src/entities/template.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EntityNotFoundError } from "typeorm";
@Injectable()
export class TemplatePolicyService {
    constructor(
        @InjectRepository(Templates)
        private readonly templateRepo: Repository<Templates>,
    ) {
    }

    async canEditTemplate(templateId: number) {
        const template = await this.templateRepo.findOne({ where: { id: templateId } });
        if (!template) {
            throw new EntityNotFoundError(Templates, 'Template not found');
        }
        if (template.is_locked) {
            throw new ForbiddenException('Template is locked');
        }
    }
}