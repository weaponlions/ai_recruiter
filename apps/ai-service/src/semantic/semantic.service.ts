import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

export interface SemanticSearchResult {
  tenantId: string;
  query: string;
  embedding: number[];
  embeddingModel: string;
  dimensions: number;
  limit: number;
  // In a full implementation, this would include vector-search results from pgvector/Pinecone/Weaviate
  results: Array<{
    id: string;
    score: number;
    metadata: Record<string, unknown>;
  }>;
}

@Injectable()
export class SemanticService {
  private readonly logger = new Logger(SemanticService.name);

  constructor(private readonly llmService: LlmService) {}

  async semanticSearch(
    tenantId: string,
    query: string,
    limit: number,
  ): Promise<SemanticSearchResult> {
    this.logger.log(`Semantic search: tenant=${tenantId} query="${query.substring(0, 50)}..."`);

    const embedding = await this.llmService.generateEmbedding(query);

    // In production: perform vector similarity search in pgvector / Pinecone / Weaviate
    // and return top-k results scoped to the tenantId.
    // Here we return the embedding for downstream use by the caller.
    return {
      tenantId,
      query,
      embedding,
      embeddingModel: 'text-embedding-3-small',
      dimensions: embedding.length,
      limit,
      results: [], // Populated by vector store integration in production
    };
  }

  async generateEmbeddingForText(text: string): Promise<number[]> {
    return this.llmService.generateEmbedding(text);
  }
}
