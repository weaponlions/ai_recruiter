import { Injectable } from '@nestjs/common';
import { CandidatesRepository, SemanticSearchResult } from '../candidates/candidates.repository';
import { Candidate } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly repo: CandidatesRepository) {}

  async keywordSearch(tenantId: string, q: string): Promise<Candidate[]> {
    return this.repo.keywordSearch(tenantId, q);
  }

  async semanticSearch(
    tenantId: string,
    embedding: number[],
    limit: number,
  ): Promise<SemanticSearchResult[]> {
    return this.repo.semanticSearch(tenantId, embedding, limit);
  }
}
