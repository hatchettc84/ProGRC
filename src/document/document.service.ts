import { BadRequestException, Injectable, Request } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { promises as fs } from "fs";
import { join } from "path";
import { LoggerService } from "src/logger/logger.service";
@Injectable()
export class DocumentService {
  constructor(
    private readonly logger: LoggerService
  ) { }
  async getDocument(docId: string) {
    const htmlPath = join(`${process.cwd()}/src/public/fedramp2.metadata.json`);

    let html = "";
    try {
      html = await fs.readFile(htmlPath, "utf8");
    } catch (error) {
      this.logger.info(error);
      return [];
    }

    return JSON.parse(html);
  }

  async getDocumentSection(docId: string, sectionId: string) {
    const htmlPath = join(`${process.cwd()}/src/public/sections/${sectionId}.txt`);

    let html = "";
    try {
      html = await fs.readFile(htmlPath, "utf8");
    } catch (error) {
      this.logger.info(error);
      return [];
    }

    return {
      result: html.trim()
    };
  }
}
