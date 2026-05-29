import { Injectable, NotFoundException } from '@nestjs/common';
import { StagesRepository } from './stages.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';
import { Stage } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsHexColor } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  order!: number;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateStageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsString()
  color?: string;
}

export class ReorderStageDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  order!: number;
}

@Injectable()
export class StagesService {
  constructor(
    private readonly repo: StagesRepository,
    private readonly publisher: PipelinePublisher,
  ) {}

  async findByPipelineId(pipelineId: string, tenantId: string): Promise<Stage[]> {
    return this.repo.findByPipelineId(pipelineId, tenantId);
  }

  async create(
    pipelineId: string,
    tenantId: string,
    dto: CreateStageDto,
  ): Promise<Stage> {
    const stage = await this.repo.create({
      pipeline: { connect: { id: pipelineId } },
      tenantId,
      name: dto.name,
      order: dto.order,
      color: dto.color ?? '#6366f1',
    });
    await this.publisher.publishStageCustomized(stage.id, pipelineId, tenantId);
    return stage;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateStageDto,
  ): Promise<Stage> {
    const stage = await this.repo.findById(id, tenantId);
    if (!stage) throw new NotFoundException(`Stage ${id} not found`);
    const updated = await this.repo.update(id, tenantId, dto);
    await this.publisher.publishStageCustomized(updated.id, updated.pipelineId, tenantId);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<{ deleted: boolean }> {
    const stage = await this.repo.findById(id, tenantId);
    if (!stage) throw new NotFoundException(`Stage ${id} not found`);
    await this.repo.delete(id, tenantId);
    return { deleted: true };
  }

  async reorder(
    tenantId: string,
    updates: ReorderStageDto[],
  ): Promise<{ reordered: boolean }> {
    await this.repo.reorderStages(updates);
    return { reordered: true };
  }
}
