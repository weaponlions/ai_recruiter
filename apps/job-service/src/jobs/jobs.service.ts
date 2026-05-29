import { Injectable, NotFoundException } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { JobPublisher } from '../events/job.publisher';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFilterDto } from './dto/job-filter.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly repo: JobsRepository,
    private readonly publisher: JobPublisher,
  ) {}

  async findAll(tenantId: string, filters: JobFilterDto) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.location && { location: { contains: filters.location, mode: 'insensitive' as const } }),
      ...(filters.type && { type: filters.type }),
      ...(filters.q && { OR: [{ title: { contains: filters.q, mode: 'insensitive' as const } }, { description: { contains: filters.q, mode: 'insensitive' as const } }] }),
    };
    const [data, total] = await this.repo.findAll(tenantId, where, filters.page, filters.limit);
    return { data, meta: { page: filters.page ?? 1, limit: filters.limit ?? 20, total, totalPages: Math.ceil(total / (filters.limit ?? 20)) } };
  }

  async findOne(tenantId: string, id: string) {
    const job = await this.repo.findOne(tenantId, id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  async create(tenantId: string, userId: string, dto: CreateJobDto) {
    const job = await this.repo.create(tenantId, { ...dto, tenantId, createdBy: userId });
    return job;
  }

  async update(tenantId: string, id: string, dto: UpdateJobDto) {
    await this.findOne(tenantId, id);
    return this.repo.update(tenantId, id, dto);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.repo.delete(tenantId, id);
  }

  async publish(tenantId: string, id: string) {
    const job = await this.findOne(tenantId, id);
    const updated = await this.repo.update(tenantId, id, { status: 'PUBLISHED', publishedAt: new Date() });
    await this.publisher.jobPublished(tenantId, { jobId: id, tenantId, title: job.title });
    return updated;
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    const updated = await this.repo.update(tenantId, id, { status: 'ARCHIVED', closedAt: new Date() });
    await this.publisher.jobArchived(tenantId, { jobId: id, tenantId });
    return updated;
  }

  getApplyLink(tenantId: string, id: string) {
    return { url: `${process.env['PUBLIC_BASE_URL'] ?? 'https://app.hr-ai.io'}/apply/${id}?t=${tenantId}` };
  }
}
