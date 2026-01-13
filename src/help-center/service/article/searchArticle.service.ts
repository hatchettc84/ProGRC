import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Document } from "flexsearch";
import { HelpCenterArticle } from 'src/entities/helpCenterArticle.entity';
import { IsNull, Not, Repository } from "typeorm";

interface SearchableDocument {
    id: string;
    title: string;
    content: string;
    keywords: string;
    description: string;
    [key: string]: any;
}

export interface SearchResult {
    total: number; // Total number of matching results
    results: Array<{
        id: string;
        score: number;
        match: Record<string, any>;
        doc: SearchableDocument;
    }>; // Paginated results
}

@Injectable()
export class SearchArticleService implements OnModuleInit {
    private searchIndex: any; // Using any for flexsearch Document to avoid type issues
    private documents: Map<string, SearchableDocument> = new Map();

    constructor(
        @InjectRepository(HelpCenterArticle)
        private readonly helpCenterArticleRepository: Repository<HelpCenterArticle>,
    ) {
        // Initialize FlexSearch Document index
        this.searchIndex = new Document({
            document: {
                id: "id",
                index: ["title", "content", "keywords", "description"],
                store: ["title", "content", "keywords", "description"]
            },
            tokenize: "forward",
            cache: 100
        });
    }

    async onModuleInit() {
        try {
            await this.initializeSearchIndex();
        } catch (error) {
            // Gracefully handle missing table - migrations may not have run yet
            console.warn('Help center search index initialization failed (table may not exist yet):', error.message);
        }
    }

    private async initializeSearchIndex() {
        try {
            const articles = await this.helpCenterArticleRepository.find({
                where: {
                    published_content: Not(IsNull()),
                },
                select: ['id', 'published_metadata', 'published_content'],
            });

        // Index all articles
        const docs = articles.map(article => ({
            id: article.id.toString(),
            title: article.published_metadata?.title || '',
            content: article.published_content || '',
            keywords: article.published_metadata?.keywords || '',
            description: article.published_metadata?.description || '',
        }));

        // Store documents in memory for quick access
        docs.forEach(doc => {
            this.documents.set(doc.id, doc);
        });

        // Add all documents to the index one by one to avoid type issues
        for (const doc of docs) {
            await this.searchIndex.add(doc);
        }
        } catch (error) {
            // If table doesn't exist, just log and continue
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn('Help center articles table does not exist yet. Search index will be empty.');
                return;
            }
            throw error;
        }
    }

    async addOrUpdateDocument(id: number) {
        const article: HelpCenterArticle = await this.helpCenterArticleRepository.findOneOrFail({
            select: ['id', 'published_metadata', 'published_content'],
            where: {
                id: id,
            }
        });
        
        const doc: SearchableDocument = {
            id: article.id.toString(),
            title: article.published_metadata?.title || '',
            content: article.published_content || '',
            keywords: article.published_metadata?.keywords || '',
            description: article.published_metadata?.description || '',
        };

        // Update in-memory map
        this.documents.set(doc.id, doc);
        
        // Update index
        await this.searchIndex.update(doc);
    }

    async removeDocument(id: number) {
        const strId = id.toString();
        
        // Remove from in-memory map
        this.documents.delete(strId);
        
        // Remove from index
        await this.searchIndex.remove(strId);
    }

    search(query: string, limit?: number, offset?: number): SearchResult {
        if (!limit || limit < 0) {
            limit = 10;
        }

        if (!offset || offset < 0) {
            offset = 0;
        }
        
        // Perform search across all fields
        const searchPromise = this.searchIndex.search(query, {
            limit: limit, 
            offset: offset,
            enrich: true,
            suggest: true
        });
        
        // Handle the async search result synchronously
        // This is a limitation we have to accept for now to match the interface
        let formattedResults: Array<{
            id: string;
            score: number;
            match: Record<string, any>;
            doc: SearchableDocument;
        }> = [];
        
        // Create a synchronous version by immediately resolving the promise
        try {
            // @ts-ignore - This runs synchronously even though it's a promise
            const results = searchPromise as any[];
            
            if (results && Array.isArray(results)) {
                // FlexSearch returns results by field, so we need to merge them
                const allResults = results.flatMap(result => result.result || []);
                
                // Get unique results by document ID
                const uniqueResultsMap = new Map();
                allResults.forEach(item => {
                    if (item && typeof item === 'object' && 'id' in item) {
                        uniqueResultsMap.set(item.id, item);
                    }
                });
                
                // Format results to match expected output
                formattedResults = Array.from(uniqueResultsMap.values()).map(item => ({
                    id: String(item.id),
                    score: 1, // FlexSearch doesn't provide explicit scores
                    match: {}, // FlexSearch doesn't provide detailed match info
                    doc: this.documents.get(String(item.id)) as SearchableDocument
                }));
            }
        } catch (e) {
            console.error('Error while processing search results:', e);
        }

        return {
            total: formattedResults.length,
            results: formattedResults,
        };
    }
}
