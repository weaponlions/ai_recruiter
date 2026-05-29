import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pipeline, Prisma } from '@prisma/client';

@Injectable()
export class PipelinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { stages: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findFirst({
      where: { id, tenantId },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  async findByJobId(jobId: string, tenantId: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findFirst({ where: { jobId, tenantId } });
  }

  async create(data: Prisma.PipelineCreateInput): Promise<Pipeline> {
    return this.prisma.pipeline.create({
      data,
      include: { stages: true },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: Prisma.PipelineUpdateInput,
  ): Promise<Pipeline> {
    return this.prisma.pipeline.update({
      where: { id },
      data,
      include: { stages: true },
    });
  }
}
