import { Injectable, NotFoundException } from '@nestjs/common';
import { LogsRepository } from './logs.repository';

@Injectable()
export class LogsService {
  constructor(private readonly repo: LogsRepository) {}

  writeLog(data: { tenantId: string; eventType: string; source: string; actorId?: string; resourceId?: string; resourceType?: string; data: object }) {
    return this.repo.writeLog(data);
  }

  async findAll(tenantId: string, filters: { eventType?: string; from?: string; to?: string; page?: number; limit?: number }) {
    const [data, total] = await this.repo.findAll(tenantId, {
      eventType: filters.eventType,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
      page: filters.page,
      limit: filters.limit,
    });
    const page = filters.page ?? 1, limit = filters.limit ?? 50;
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const log = await this.repo.findOne(tenantId, id);
    if (!log) throw new NotFoundException(`Log ${id} not found`);
    return log;
  }
}
