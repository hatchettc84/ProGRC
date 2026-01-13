import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";
import { OllamaService } from "src/llms/ollama.service";
import { GeminiService } from "src/llms/gemini.service";
import { OpenAiService } from "src/llms/openAi.service";
import { GradientService } from "src/llms/gradient.service";
import { ConfigService } from "@nestjs/config";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AsyncTask, TaskOps, TaskStatus } from "src/entities/asyncTasks.entity";
import { SourceAsset } from "src/entities/source/applicationSourceType.entity";
import { Asset } from "src/entities/source/assets.entity";

interface ControlFamily {
  family_name: string;
  controls: Control[];
}

interface ChunkAnalysisResult {
  control_id: number;
  family_name: string;
  relevance_score: number;
  evidence: string;
  is_mentioned: boolean;
}

@Injectable()
export class LlmDocumentProcessorService {
  private readonly CHUNK_SIZE = 1000; // words per chunk
  private readonly CHUNK_OVERLAP = 200; // words overlap between chunks
  private readonly MIN_RELEVANCE_SCORE = 50; // Minimum score to create a mapping

  constructor(
    @InjectRepository(SourceV1)
    private readonly sourceRepo: Repository<SourceV1>,
    @InjectRepository(SourceVersion)
    private readonly sourceVersionRepo: Repository<SourceVersion>,
    @InjectRepository(SourceChunkMapping)
    private readonly sourceChunkRepo: Repository<SourceChunkMapping>,
    @InjectRepository(ControlChunkMapping)
    private readonly controlChunkRepo: Repository<ControlChunkMapping>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(Control)
    private readonly controlRepo: Repository<Control>,
    @InjectRepository(StandardControlMapping)
    private readonly standardControlRepo: Repository<StandardControlMapping>,
    @InjectRepository(AppStandard)
    private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(AsyncTask)
    private readonly asyncTaskRepo: Repository<AsyncTask>,
    @InjectRepository(SourceAsset)
    private readonly sourceAssetRepo: Repository<SourceAsset>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    private readonly ollamaService: OllamaService,
    private readonly geminiService: GeminiService,
    private readonly openAiService: OpenAiService,
    private readonly gradientService: GradientService,
    private readonly config: ConfigService,
    private readonly s3Service: AwsS3ConfigService,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Main entry point to process a document using LLM
   */
  async processDocument(
    appId: number,
    sourceId: number,
    customerId: string,
    sourceTypeId: number,
  ): Promise<void> {
    this.logger.log(`Starting LLM document processing for source ${sourceId}, app ${appId}`);

    await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Get source and version information
        const source = await manager.findOne(SourceV1, {
          where: { id: sourceId, app_id: appId },
          relations: ["current_version_entity"],
        });

        if (!source) {
          throw new NotFoundException(`Source ${sourceId} not found`);
        }

        if (!source.current_version_entity) {
          throw new NotFoundException(`Source ${sourceId} has no version`);
        }

        const sourceVersion = source.current_version_entity;
        
        // Check if text path is available
        // Note: text_s3_path might exist but file might not be in S3 yet if external text extraction hasn't completed
        const textPath = sourceVersion.text_s3_path || sourceVersion.file_bucket_key;
        
        if (!textPath) {
          this.logger.warn(`Source ${sourceId} has no text_s3_path or file_bucket_key, cannot perform LLM processing`);
          throw new Error(`Source ${sourceId} has no text file path available for LLM processing`);
        }

        // 2. Download document text from S3
        let documentText: string;
        try {
          documentText = await this.downloadDocumentText(textPath);
        } catch (error) {
          this.logger.warn(`Source ${sourceId} text file not found at ${textPath}, cannot perform LLM processing`);
          throw new Error(`Text file not available for source ${sourceId} at path ${textPath}`);
        }
        
        if (!documentText || documentText.trim().length === 0) {
          this.logger.warn(`Source ${sourceId} document text is empty, cannot perform LLM processing`);
          throw new Error(`Document text is empty for source ${sourceId}`);
        }

        // 3. Get standards for this application
        const appStandards = await manager.find(AppStandard, {
          where: { app_id: appId },
        });

        if (appStandards.length === 0) {
          this.logger.warn(`App ${appId} has no standards, cannot perform LLM processing`);
          throw new Error(`App ${appId} has no standards configured`);
        }

        // 4. Chunk the document
        const chunks = this.chunkDocument(documentText);
        this.logger.log(`Document chunked into ${chunks.length} chunks`);

        // 5. Process each standard
        for (const appStandard of appStandards) {
          const standardId = appStandard.standard_id;

          // Get control families for this standard
          const controlFamilies = await this.getControlFamiliesForStandard(standardId, manager);

          if (controlFamilies.length === 0) {
            this.logger.warn(`Standard ${standardId} has no controls, skipping`);
            continue;
          }

          // 6. Create source chunks
          const sourceChunks = await this.createSourceChunks(
            sourceId,
            customerId,
            appId,
            chunks,
            manager,
          );

          // 7. Analyze chunks against controls using LLM
          const chunkAnalyses = await this.analyzeChunksAgainstControls(
            sourceChunks,
            controlFamilies,
            standardId,
          );

          // 8. Create control chunk mappings
          await this.createControlChunkMappings(
            sourceChunks,
            chunkAnalyses,
            appId,
            standardId,
            manager,
          );
        }

        // 9. Calculate and update percentage completeness for control families
        for (const appStandard of appStandards) {
          await this.updateControlFamilyCompleteness(
            appId,
            appStandard.standard_id,
            manager,
          );
        }

        // 10. Update source version to mark text as available
        sourceVersion.is_text_available = true;
        sourceVersion.text_updated_at = new Date();
        await manager.save(sourceVersion);

        // 11. Update async task status - update the specific task for this source
        // Note: entity_id is stored as string in the database
        await manager.update(
          AsyncTask,
          { app_id: appId, ops: TaskOps.CREATE_ASSETS, status: TaskStatus.PENDING, entity_id: sourceId.toString() },
          { status: TaskStatus.PROCESSED },
        );

        // 12. Update app standard to indicate compliance needs update
        await manager.update(
          AppStandard,
          { app_id: appId },
          { have_pending_compliance: true, updated_at: new Date(), source_updated_at: new Date() },
        );

        this.logger.log(`LLM document processing completed for source ${sourceId}`);
      } catch (error) {
        this.logger.error(`Error processing document for source ${sourceId}:`, error);
        throw error;
      }
    });
  }

  /**
   * Download document text from S3
   */
  private async downloadDocumentText(textS3Path: string): Promise<string> {
    try {
      const s3Client = this.s3Service.getS3();
      const command = this.s3Service.getObjectCommand(textS3Path);
      const response = await s3Client.send(command);

      if (!response.Body) {
        throw new Error("Empty response body from S3");
      }

      // Convert stream to string
      const bodyContents = await response.Body.transformToByteArray();
      const text = Buffer.from(bodyContents).toString("utf-8");
      
      return text;
    } catch (error) {
      this.logger.error(`Error downloading document from S3 (${textS3Path}):`, error);
      throw error;
    }
  }

  /**
   * Chunk document into smaller pieces
   */
  private chunkDocument(text: string): Array<{ text: string; page: number; line: number }> {
    const chunks: Array<{ text: string; page: number; line: number }> = [];
    const words = text.split(/\s+/);
    const totalWords = words.length;
    let currentChunkStart = 0;
    let page = 1;
    let line = 1;

    while (currentChunkStart < totalWords) {
      const chunkEnd = Math.min(currentChunkStart + this.CHUNK_SIZE, totalWords);
      const chunkWords = words.slice(currentChunkStart, chunkEnd);
      const chunkText = chunkWords.join(" ");

      // Simple page estimation (assume ~500 words per page)
      page = Math.floor(currentChunkStart / 500) + 1;
      line = Math.floor((currentChunkStart % 500) / 20) + 1;

      chunks.push({
        text: chunkText,
        page,
        line,
      });

      // Move to next chunk with overlap
      currentChunkStart = chunkEnd - this.CHUNK_OVERLAP;
    }

    return chunks;
  }

  /**
   * Get control families for a standard
   */
  private async getControlFamiliesForStandard(
    standardId: number,
    manager: any,
  ): Promise<ControlFamily[]> {
    const standardControls = await manager.find(StandardControlMapping, {
      where: { standard_id: standardId },
    });

    const controlIds = standardControls.map((sc: StandardControlMapping) => sc.control_id);
    
    if (controlIds.length === 0) {
      return [];
    }

    const controls = await manager.find(Control, {
      where: { id: In(controlIds), active: true },
    });

    // Group controls by family
    const familyMap = new Map<string, Control[]>();
    
    for (const control of controls) {
      const familyName = control.family_name;
      if (!familyMap.has(familyName)) {
        familyMap.set(familyName, []);
      }
      familyMap.get(familyName)!.push(control);
    }

    // Convert to array
    const families: ControlFamily[] = [];
    for (const [familyName, familyControls] of familyMap.entries()) {
      families.push({
        family_name: familyName,
        controls: familyControls,
      });
    }

    return families;
  }

  /**
   * Create source chunk mappings with embeddings
   */
  private async createSourceChunks(
    sourceId: number,
    customerId: string,
    appId: number,
    chunks: Array<{ text: string; page: number; line: number }>,
    manager: any,
  ): Promise<SourceChunkMapping[]> {
    const sourceChunks: SourceChunkMapping[] = [];

    // Get available embedding service
    const embeddingService = await this.getAvailableEmbeddingService();
    if (!embeddingService) {
      this.logger.warn("No embedding service available, creating chunks without embeddings");
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding for the chunk
      let embeddingVector: string | null = null;
      if (embeddingService && chunk.text.trim().length > 0) {
        try {
          const embedding = await this.generateEmbedding(chunk.text, embeddingService);
          if (embedding && embedding.length > 0) {
            // Format as pgvector: "[1,2,3,...]"
            embeddingVector = `[${embedding.join(',')}]`;
            this.logger.log(`Generated embedding for chunk ${i + 1}/${chunks.length} (${embedding.length} dimensions)`);
          }
        } catch (error) {
          this.logger.warn(`Failed to generate embedding for chunk ${i + 1}: ${error.message}`);
        }
      }

      // Use raw query to properly insert vector type
      const sourceChunk = manager.create(SourceChunkMapping, {
        chunk_id: 0, // Will be updated after save to use the auto-generated id
        source_id: sourceId,
        customer_id: customerId,
        app_id: appId,
        chunk_text: chunk.text,
        chunk_emb: embeddingVector, // Will be cast to vector type by PostgreSQL
        page_number: chunk.page,
        line_number: chunk.line,
        offset: i * this.CHUNK_SIZE,
        limit: chunk.text.length,
        is_active: true,
      });

      const savedChunk = await manager.save(sourceChunk);
      
      // Update the embedding using raw SQL to ensure proper vector type casting
      if (embeddingVector) {
        await manager.query(
          `UPDATE source_chunk_mapping SET chunk_emb = $1::vector WHERE id = $2`,
          [embeddingVector, savedChunk.id]
        );
      }
      // Update chunk_id to match the auto-generated id
      savedChunk.chunk_id = savedChunk.id;
      const updatedChunk = await manager.save(savedChunk);
      sourceChunks.push(updatedChunk);
    }

    return sourceChunks;
  }

  /**
   * Get the best available embedding service (priority: Ollama > Gemini > OpenAI)
   * Ollama is prioritized to eliminate external API calls
   */
  private async getAvailableEmbeddingService(): Promise<'gemini' | 'openai' | 'ollama' | null> {
    // ✅ PRIORITY 1: Check Ollama FIRST (local, no API calls)
    try {
      const useOllama = await this.ollamaService.isAvailable();
      if (useOllama) {
        this.logger.log("Using Ollama for embedding generation (local, no API calls)");
        return 'ollama';
      }
    } catch (error) {
      this.logger.warn("Ollama embedding check failed:", error.message);
    }

    // Fallback to cloud services only if Ollama is unavailable
    const useGemini = await this.geminiService.isAvailable();
    if (useGemini) {
      this.logger.log("Using Gemini for embedding generation (fallback)");
      return 'gemini';
    }

    const openaiApiKey = this.config.get<string>("OPENAI_API_KEY");
    if (openaiApiKey) {
      this.logger.log("Using OpenAI for embedding generation (fallback)");
      return 'openai';
    }

    return null;
  }

  /**
   * Generate embedding for text using the best available service
   */
  private async generateEmbedding(text: string, service: 'gemini' | 'gradient' | 'openai' | 'ollama'): Promise<number[] | null> {
    switch (service) {
      case 'gemini':
        return await this.geminiService.generateEmbedding(text);
      case 'gradient':
        return await this.gradientService.generateEmbedding(text);
      case 'openai':
        // OpenAI text-embedding-3-small returns 1536 dimensions by default
        // But we need 768 to match control embeddings, so we'll use dimensions parameter
        return await this.openAiService.generateEmbedding(text, 768);
      case 'ollama':
        return await this.ollamaService.generateEmbedding(text);
      default:
        return null;
    }
  }

  /**
   * Get the best available LLM service (priority: Gemini > Gradient > OpenAI > Ollama)
   */
  private async getAvailableLLMService(): Promise<'gemini' | 'gradient' | 'openai' | 'ollama' | null> {
    // Priority order: Gemini > Gradient > OpenAI > Ollama
    const useGemini = await this.geminiService.isAvailable();
    if (useGemini) {
      this.logger.log("Using Gemini for LLM processing");
      return 'gemini';
    }

    const useGradient = await this.gradientService.isAvailable();
    if (useGradient) {
      this.logger.log("Using Gradient AI for LLM processing");
      return 'gradient';
    }

    const openaiApiKey = this.config.get<string>("OPENAI_API_KEY");
    if (openaiApiKey) {
      this.logger.log("Using OpenAI for LLM processing");
      return 'openai';
    }

    const useOllama = await this.ollamaService.isAvailable();
    if (useOllama) {
      this.logger.log("Using Ollama for LLM processing");
      return 'ollama';
    }

    return null;
  }

  /**
   * Analyze chunks against controls using available LLM service
   */
  private async analyzeChunksAgainstControls(
    sourceChunks: SourceChunkMapping[],
    controlFamilies: ControlFamily[],
    standardId: number,
  ): Promise<Map<number, ChunkAnalysisResult[]>> {
    const chunkAnalyses = new Map<number, ChunkAnalysisResult[]>();

    // Get the best available LLM service
    const llmService = await this.getAvailableLLMService();
    
    if (!llmService) {
      this.logger.warn("No LLM service available (Gemini, OpenAI, or Ollama), skipping LLM analysis");
      return chunkAnalyses;
    }

    // Process chunks in batches to avoid overwhelming the LLM
    const BATCH_SIZE = 5;
    for (let i = 0; i < sourceChunks.length; i += BATCH_SIZE) {
      const batch = sourceChunks.slice(i, i + BATCH_SIZE);

      for (const sourceChunk of batch) {
        const analyses: ChunkAnalysisResult[] = [];

        // Analyze chunk against each control family
        for (const family of controlFamilies) {
        try {
          const analysis = await this.analyzeChunkAgainstFamily(
            sourceChunk.chunk_text,
            family,
            llmService,
          );

          analyses.push(...analysis);
          } catch (error) {
            this.logger.error(
              `Error analyzing chunk ${sourceChunk.id} against family ${family.family_name}:`,
              error,
            );
          }
        }

        chunkAnalyses.set(sourceChunk.chunk_id, analyses);
      }
    }

    return chunkAnalyses;
  }

  /**
   * Analyze a single chunk against a control family
   */
  private async analyzeChunkAgainstFamily(
    chunkText: string,
    family: ControlFamily,
    serviceType: 'gemini' | 'gradient' | 'openai' | 'ollama',
  ): Promise<ChunkAnalysisResult[]> {
    // Build prompt for Ollama
    const controlsDescription = family.controls
      .map(
        (c) =>
          `- ${c.control_name} (ID: ${c.id}): ${c.control_text.substring(0, 200)}...`,
      )
      .join("\n");

    const prompt = `You are a GRC (Governance, Risk, and Compliance) analyst. Analyze the following document chunk against the control family "${family.family_name}".

Control Family: ${family.family_name}
Controls in this family:
${controlsDescription}

Document Chunk:
${chunkText.substring(0, 2000)}...

For each control in the family, provide a JSON response with:
1. control_id: The control ID
2. family_name: "${family.family_name}"
3. relevance_score: A number from 0-100 indicating how relevant the chunk is to this control
4. evidence: A brief quote or summary of evidence found in the chunk (empty string if none)
5. is_mentioned: true if the control requirement is mentioned or implemented in the chunk, false otherwise

Return ONLY a valid JSON array of objects, one per control. Example format:
[
  {
    "control_id": 123,
    "family_name": "${family.family_name}",
    "relevance_score": 75,
    "evidence": "The document mentions authentication requirements...",
    "is_mentioned": true
  }
]`;

    const messages = [
      {
        role: "system",
        content: "You are a GRC analyst. Always respond with valid JSON arrays only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const options = {
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000,
    };

    try {
      let response: string;

      // Use the appropriate service
      switch (serviceType) {
        case 'gemini':
          response = await this.geminiService.chatCompletion(messages, options);
          break;
        case 'gradient':
          response = await this.gradientService.chatCompletion(messages, options);
          break;
        case 'openai':
          response = await this.openAiService.chatCompletion(messages, options);
          break;
        case 'ollama':
          response = await this.ollamaService.chatCompletion(messages, options);
          break;
        default:
          throw new Error(`Unknown service type: ${serviceType}`);
      }

      // Parse JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        this.logger.warn(`Could not parse JSON from ${serviceType} response: ${response.substring(0, 200)}`);
        return [];
      }

      const analyses = JSON.parse(jsonMatch[0]) as ChunkAnalysisResult[];
      
      // Validate and filter results
      return analyses
        .filter((a) => a.control_id && a.relevance_score >= 0 && a.relevance_score <= 100)
        .map((a) => ({
          ...a,
          family_name: family.family_name,
        }));
    } catch (error) {
      this.logger.error(`Error calling ${serviceType} for family ${family.family_name}:`, error);
      return [];
    }
  }

  /**
   * Create control chunk mappings based on analysis
   */
  private async createControlChunkMappings(
    sourceChunks: SourceChunkMapping[],
    chunkAnalyses: Map<number, ChunkAnalysisResult[]>,
    appId: number,
    standardId: number,
    manager: any,
  ): Promise<void> {
    for (const sourceChunk of sourceChunks) {
      const analyses = chunkAnalyses.get(sourceChunk.chunk_id) || [];

      for (const analysis of analyses) {
        // Only create mapping if relevance score is above threshold
        if (analysis.relevance_score >= this.MIN_RELEVANCE_SCORE) {
          const controlChunk = manager.create(ControlChunkMapping, {
            app_id: appId,
            control_id: analysis.control_id,
            chunk_id: sourceChunk.chunk_id,
            reference_data: {
              relevance_score: analysis.relevance_score,
              evidence: analysis.evidence,
              is_mentioned: analysis.is_mentioned,
            },
            is_active: true,
            is_tagged: false,
          });

          await manager.save(controlChunk);
        }
      }
    }
  }

  /**
   * Calculate and update percentage completeness for control families
   */
  private async updateControlFamilyCompleteness(
    appId: number,
    standardId: number,
    manager: any,
  ): Promise<void> {
    // Get all controls for this standard
    const standardControls = await manager.find(StandardControlMapping, {
      where: { standard_id: standardId },
    });

    const controlIds = standardControls.map((sc: StandardControlMapping) => sc.control_id);

    if (controlIds.length === 0) {
      return;
    }

    // Get application control mappings
    const appControls = await manager.find(ApplicationControlMapping, {
      where: {
        app_id: appId,
        control_id: In(controlIds),
      },
    });

    // Group controls by family
    const controls = await manager.find(Control, {
      where: { id: In(controlIds), active: true },
    });

    const familyMap = new Map<string, number[]>();
    for (const control of controls) {
      const familyName = control.family_name;
      if (!familyMap.has(familyName)) {
        familyMap.set(familyName, []);
      }
      familyMap.get(familyName)!.push(control.id);
    }

    // Calculate percentage for each family
    for (const [familyName, familyControlIds] of familyMap.entries()) {
      // Get chunks mapped to controls in this family
      const controlChunks = await manager.find(ControlChunkMapping, {
        where: {
          app_id: appId,
          control_id: In(familyControlIds),
          is_active: true,
        },
      });

      if (controlChunks.length === 0) {
        // No chunks found, set percentage to 0
        await manager.update(
          ApplicationControlMapping,
          { app_id: appId, control_id: In(familyControlIds) },
          { percentage_completion: 0 },
        );
        continue;
      }

      // Calculate average relevance score for this family
      const relevanceScores = controlChunks
        .map((cc: ControlChunkMapping) => {
          const refData = cc.reference_data as any;
          return refData?.relevance_score || 0;
        })
        .filter((score: number) => score > 0);

      const avgRelevance =
        relevanceScores.length > 0
          ? relevanceScores.reduce((a: number, b: number) => a + b, 0) / relevanceScores.length
          : 0;

      // Calculate coverage (percentage of controls in family that have chunks)
      const controlsWithChunks = new Set(
        controlChunks.map((cc: ControlChunkMapping) => cc.control_id),
      );
      const coverage = (controlsWithChunks.size / familyControlIds.length) * 100;

      // Final percentage: average of relevance and coverage
      const percentage = Math.round((avgRelevance + coverage) / 2);

      // Update all controls in this family
      await manager.update(
        ApplicationControlMapping,
        { app_id: appId, control_id: In(familyControlIds) },
        { percentage_completion: percentage },
      );
    }
  }
}

