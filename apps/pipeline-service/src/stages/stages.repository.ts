import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stage, Prisma } from '@prisma/client';

@Injectable()
export class StagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPipelineId(pipelineId: string, tenantId: string): Promise<Stage[]> {
    return this.prisma.stage.findMany({
      where: { pipelineId, tenantId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string, tenantId: string): Promise<Stage | null> {
    return this.prisma.stage.findFirst({ where: { id, tenantId } });
  }

  async create(data: Prisma.StageCreateInput): Promise<Stage> {
    return this.prisma.stage.create({ data });
  }

  async update(id: string, tenantId: string, data: Prisma.StageUpdateInput): Promise<Stage> {
    return this.prisma.stage.update({ where: { id }, data });
  }

  async delete(id: string, tenantId: string): Promise<Stage> {
    return this.prisma.stage.delete({ where: { id } });
  }

  async reorderStages(
    updates: { id: string; order: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.stage.update({
          where: { id: u.id },
          data: { order: u.order },
        }),
      ),
    );
  }
}
