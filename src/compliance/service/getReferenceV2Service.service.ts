import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class GetReferenceV2Service {
    constructor(
        @InjectRepository(ControlChunkMapping) private readonly controlChunkMapRepo: Repository<ControlChunkMapping>,
        @InjectRepository(SourceChunkMapping) private readonly sourceChunkMapRepo: Repository<SourceChunkMapping>,
        @InjectRepository(ApplicationControlMapping) private readonly appControlRepo: Repository<ApplicationControlMapping>,
        @InjectRepository(SourceVersion) private readonly sourceVersionRepo: Repository<SourceVersion>,
    ) { }

    async getForApplicationControl(
        userInfo: { userId: string; customerId: string },
        appId: number,
        controlId: number,
        childControlId: number,
    ): Promise<SourceChunkMapping[]> {
        const appControl = await this.appControlRepo.findOneOrFail({
            select: ['id', 'control_id'],
            where: { app_id: appId, id: childControlId },
        });

        const chunks = await this.controlChunkMapRepo.find({
            select: ['chunk_id'],
            where: { app_id: appId, control_id: appControl.control_id },
        });

        if (!chunks.length) return [];

        const chunkSources = await this.sourceChunkMapRepo.find({
            select: {
                id: true,
                chunk_text: true,
                source_id: true,
                line_number: true,  
                page_number: true,
                source: { name: true },
            },
            where: { chunk_id: In(chunks.map(chunk => chunk.chunk_id)) },
            relations: ['source'],
        });

        if (!chunkSources.length) return [];

        // Batch fetch latest source versions
        const sourceIds = [...new Set(chunkSources.map(cs => cs.source_id))];
        const sourceVersions = await this.sourceVersionRepo
            .createQueryBuilder('sv')
            .select(['sv.source_id', 'sv.file_bucket_key'])
            .where('sv.source_id IN (:...sourceIds)', { sourceIds })
            .orderBy('sv.created_at', 'DESC')
            .getMany();

        // Create lookup map for efficient access
        const latestVersionMap = sourceVersions.reduce((acc, version) => {
            if (!acc.has(version.source_id)) {
                if(version.is_text_available) {
                    acc.set(version.source_id, version.text_s3_path);
                } else {
                    acc.set(version.source_id, version.file_bucket_key);
                }
            }
            return acc;
        }, new Map<number, string>());

        // Assign file keys in a single pass
        return chunkSources.map(chunkSource => ({
            ...chunkSource,
            source_file: latestVersionMap.get(chunkSource.source_id) || null,
        }));
    }
}
