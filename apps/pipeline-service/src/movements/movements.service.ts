import { Injectable, Logger } from '@nestjs/common';
import { MovementsRepository } from './movements.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';
import { CandidateStage, ActivityLog } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MoveCandidateDto {
  @IsString()
  @IsNotEmpty()
  candidateId!: string;

  @IsString()
  @IsNotEmpty()
  stageId!: string;

  @IsString()
  @IsNotEmpty()
  pipelineId!: string;

  @IsString()
  @IsNotEmpty()
  movedBy!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class MovementsService {
  private readonly logger = new Logger(MovementsService.name);

  constructor(
    private readonly repo: MovementsRepository,
    private readonly publisher: PipelinePublisher,
  ) {}

  async moveCandidateToStage(
    tenantId: string,
    dto: MoveCandidateDto,
  ): Promise<CandidateStage> {
    // Record the stage movement
    const movement = await this.repo.createCandidateStage({
      candidateId: dto.candidateId,
      stage: { connect: { id: dto.stageId } },
      pipelineId: dto.pipelineId,
      tenantId,
      movedBy: dto.movedBy,
      notes: dto.notes,
    });

    // Create an activity log entry
    await this.repo.createActivityLog({
      tenantId,
      candidateId: dto.candidateId,
      type: 'STAGE_MOVED',
      description: `Candidate moved to stage ${dto.stageId}`,
      actorId: dto.movedBy,
      metadata: {
        stageId: dto.stageId,
        pipelineId: dto.pipelineId,
        notes: dto.notes ?? null,
      },
    });

    // Publish event
    await this.publisher.publishCandidateMoved(
      dto.candidateId,
      dto.stageId,
      dto.pipelineId,
      tenantId,
    );

    this.logger.log(
      `Candidate ${dto.candidateId} moved to stage ${dto.stageId} in pipeline ${dto.pipelineId}`,
    );

    return movement;
  }

  async getCandidateTimeline(
    candidateId: string,
    tenantId: string,
  ): Promise<ActivityLog[]> {
    return this.repo.getTimeline(candidateId, tenantId);
  }
}
