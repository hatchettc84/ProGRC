import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { DataSource, In, Repository } from "typeorm";

@Injectable()
export class GetSourceV2Service {
    constructor(
        @InjectRepository(SourceV1) private readonly sourceV1repo: Repository<SourceV1>,
        @InjectRepository(SourceVersion) private readonly sourceVersionRepo: Repository<SourceVersion>,
        private readonly dataSource: DataSource,
    ) { }

    async getSourceForApplicationStandard(
        userInfo: { userId: string, customerId: string },
        appId: number,
        standardId: number
    ) {
        const distinctSourceIds: { source_id: number }[] = await this.dataSource.query(`
            SELECT DISTINCT sc.source_id AS source_id
            FROM standard_control_mapping scm
            JOIN control_chunk_mapping ccm ON scm.control_id = ccm.control_id
            JOIN source_chunk_mapping sc ON sc.chunk_id = ccm.chunk_id
            WHERE ccm.app_id = $1 AND scm.standard_id = $2;
        `, [appId, standardId]);

        const sourceIds = distinctSourceIds.map(row => row.source_id);

        if (sourceIds.length === 0) {
            return [];
        }

        const sources = await this.sourceV1repo.find({
            select: ['id', 'source_type', 'name', 'updated_at', 'type_source'],
            where: {
                id: In(sourceIds),
            },
            relations: ['type_source']
        });

        const sourceVersions = await this.sourceVersionRepo
            .createQueryBuilder('sv')
            .select(['sv.source_id', 'sv.file_bucket_key'])
            .where('sv.source_id IN (:...sourceIds)', { sourceIds })
            .orderBy('sv.created_at', 'DESC')
            .getMany();

        const latestVersionMap = sourceVersions.reduce((acc, version) => {
            if (!acc.has(version.source_id)) {
                acc.set(version.source_id, version.file_bucket_key);
            }
            return acc;
        }, new Map<number, string>());

        return sources.map(source => ({
            ...source,
            source_file: latestVersionMap.get(source.id) || null,
        }));
    }

}
