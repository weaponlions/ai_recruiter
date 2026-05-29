import { Injectable } from '@nestjs/common';
import { ScorecardsRepository } from './scorecards.repository';

@Injectable()
export class ScorecardsService {
  constructor(private readonly repo: ScorecardsRepository) {}
  create(tenantId: string, userId: string, data: { candidateId: string; stageId: string; scores: object; overallScore?: number; recommendation?: string }) {
    return this.repo.create({ ...data, tenantId, submittedBy: userId });
  }
  findByCandidate(tenantId: string, candidateId: string) { return this.repo.findByCandidate(tenantId, candidateId); }
}
