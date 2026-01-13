import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
  UseGuards,
  Res,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import { AuthGuard } from "src/guards/authGuard";
import { join } from "path";
import { Response } from "express";
import { promises as fs } from "fs";

@Controller("poc/")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get("docs/:doc_id")
  async getDocumentDetails(@Request() req: any) {
    return await this.documentService.getDocument(req.params.doc_id);
  }

  @Get("docs/:doc_id/section/:section_id")
  async getDocumentSection(@Request() req: any) {
    return await this.documentService.getDocumentSection(
      req.params.doc_id,
      req.params.section_id
    );
  }
}
