import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CandidateStage, ActivityLog, Prisma } from '@prisma/client';

@Injectable()
export class MovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCandidateStage(
    data: Prisma.CandidateStageCreateInput,
  ): Promise<CandidateStage> {
    return this.prisma.candidateStage.create({ data });
  }

  async getTimeline(
    candidateId: string,
    tenantId: string,
  ): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: { candidateId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createActivityLog(data: Prisma.ActivityLogCreateInput): Promise<ActivityLog> {
    return this.prisma.activityLog.create({ data });
  }

  async getLatestStage(
    candidateId: string,
    tenantId: string,
  ): Promise<CandidateStage | null> {
    return this.prisma.candidateStage.findFirst({
      where: { candidateId, tenantId },
      orderBy: { movedAt: 'desc' },
      include: { stage: true },
    });
  }
}
