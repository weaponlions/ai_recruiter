import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class LogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Append-only insert — never UPDATE or DELETE */
  async writeLog(data: {
    tenantId: string;
    eventType: string;
    source: string;
    actorId?: string;
    resourceId?: string;
    resourceType?: string;
    data: object;
  }) {
    // Get last log for hash chaining
    const last = await this.prisma.auditLog.findFirst({
      where: { tenantId: data.tenantId },
      orderBy: { sequenceNumber: 'desc' },
      select: { hash: true, sequenceNumber: true },
    });

    const previousHash = last?.hash ?? 'GENESIS';
    const sequenceNumber = (last?.sequenceNumber ?? 0) + 1;
    const id = crypto.randomUUID();
    const hashInput = `${id}${data.tenantId}${data.eventType}${JSON.stringify(data.data)}${previousHash}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    return this.prisma.auditLog.create({
      data: { id, ...data, hash, previousHash, sequenceNumber },
    });
  }

  findAll(tenantId: string, filters: { eventType?: string; from?: Date; to?: Date; page?: number; limit?: number }) {
    const { eventType, from, to, page = 1, limit = 50 } = filters;
    const where = {
      tenantId,
      ...(eventType && { eventType }),
      ...(from || to ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } } : {}),
    };
    const skip = (page - 1) * limit;
    return Promise.all([
      this.prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.auditLog.findFirst({ where: { id, tenantId } });
  }
}
