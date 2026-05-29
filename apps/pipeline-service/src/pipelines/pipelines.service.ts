import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesRepository } from './pipelines.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';
import { Pipeline } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@Injectable()
export class PipelinesService {
  constructor(
    private readonly repo: PipelinesRepository,
    private readonly publisher: PipelinePublisher,
  ) {}

  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.repo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string): Promise<Pipeline> {
    const pipeline = await this.repo.findById(id, tenantId);
    if (!pipeline) throw new NotFoundException(`Pipeline ${id} not found`);
    return pipeline;
  }

  async create(tenantId: string, dto: CreatePipelineDto): Promise<Pipeline> {
    const pipeline = await this.repo.create({
      tenantId,
      jobId: dto.jobId,
      name: dto.name,
    });
    return pipeline;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdatePipelineDto,
  ): Promise<Pipeline> {
    await this.findById(id, tenantId);
    return this.repo.update(id, tenantId, { name: dto.name });
  }

  async createForJob(jobId: string, tenantId: string, name: string): Promise<Pipeline> {
    const existing = await this.repo.findByJobId(jobId, tenantId);
    if (existing) return existing;
    const pipeline = await this.repo.create({ tenantId, jobId, name });
    return pipeline;
  }
}
