import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(tenantId: string, data: { jobId: string; candidateId: string; coverLetter?: string }) {
    return this.prisma.application.create({ data: { ...data, tenantId } });
  }
  findByJob(tenantId: string, jobId: string) {
    return this.prisma.application.findMany({ where: { tenantId, jobId }, orderBy: { appliedAt: 'desc' } });
  }
}
