import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, data: { requestType: string; candidateEmail: string; requestedBy: string }) {
    return this.prisma.complianceRequest.create({ data: { ...data, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.complianceRequest.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.complianceRequest.findFirst({ where: { id, tenantId } });
  }

  markProcessed(id: string, exportUrl?: string) {
    return this.prisma.complianceRequest.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date(), ...(exportUrl && { exportUrl }) },
    });
  }
}
