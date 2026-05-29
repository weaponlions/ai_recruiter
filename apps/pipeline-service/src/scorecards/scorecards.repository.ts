import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScorecardsRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: { candidateId: string; stageId: string; tenantId: string; scores: object; overallScore?: number; recommendation?: string; submittedBy: string }) {
    return this.prisma.scorecard.create({ data });
  }
  findByCandidate(tenantId: string, candidateId: string) {
    return this.prisma.scorecard.findMany({ where: { tenantId, candidateId }, orderBy: { submittedAt: 'desc' } });
  }
}
