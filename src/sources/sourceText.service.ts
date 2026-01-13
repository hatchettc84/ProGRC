import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { SourceV1 } from 'src/entities/source/sourceV1.entity'; 
import { SourcePolicyService } from "./sourcePolicy.service";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { FileDownloadService } from "src/app/fileDownload.service";



@Injectable()
export class SourceTextService {
  constructor(
    @InjectRepository(SourceV1) private readonly sourceRepov1: Repository<SourceV1>,
    @InjectRepository(SourceChunkMapping) private readonly sourceChunkMappingRepo: Repository<SourceChunkMapping>,
    private readonly fileDownloadService: FileDownloadService,
    private readonly sourcePolicyService: SourcePolicyService,
  ) {}

  async getSourceText(user_data: any, app_id: number, source_id: number) {
 
    await this.sourcePolicyService.canDownloadSource(user_data, app_id);
    const source = await this.sourceRepov1.findOne({ where: { id: source_id }, relations: ['current_version_entity'] });
    if (!source) {
      throw new NotFoundException(`Source with ID ${source_id} not found.`);
    }

    if (!source.current_version_entity || !source.current_version_entity.is_text_available) {
      throw new NotFoundException(`Source text is not available for source with ID ${source_id}.`);
    }

    const sourceChunkMappings = await this.sourceChunkMappingRepo.find({ where: { source_id: source_id, app_id: app_id } });
    if (!sourceChunkMappings) {
      throw new NotFoundException(`Source with ID ${source_id} not found.`);
    }

    return {
      download_url: await this.fileDownloadService.generateSignedUrl(source.current_version_entity.text_s3_path),
      source_id: source.id,
      name: source.name,
      chunks: sourceChunkMappings.map(chunk => ({
        text: chunk.chunk_text,
        line_number: chunk.line_number,
        page_number: chunk.page_number,
      })) || [],
    };
  }

}