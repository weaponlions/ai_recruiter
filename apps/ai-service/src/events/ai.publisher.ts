import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';

@Injectable()
export class AiPublisher {
  private readonly logger = new Logger(AiPublisher.name);

  constructor(private readonly eventBus: EventBusService) {}

  async publishParsingStarted(
    tenantId: string,
    parseJobId: string,
    fileId: string,
  ): Promise<void> {
    await this.eventBus.publish('parsing.started', tenantId, {
      tenantId,
      parseJobId,
      fileId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Published parsing.started for parseJobId=${parseJobId}`);
  }

  async publishParsingCompleted(
    tenantId: string,
    parseJobId: string,
    fileId: string,
    result: object,
  ): Promise<void> {
    await this.eventBus.publish('parsing.completed', tenantId, {
      tenantId,
      parseJobId,
      fileId,
      result,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Published parsing.completed for parseJobId=${parseJobId}`);
  }

  async publishMatchGenerated(
    tenantId: string,
    matchJobId: string,
    jobId: string,
    candidateId: string,
    score: number,
  ): Promise<void> {
    await this.eventBus.publish('match.generated', tenantId, {
      tenantId,
      matchJobId,
      jobId,
      candidateId,
      score,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Published match.generated: score=${score} for jobId=${jobId}, candidateId=${candidateId}`);
  }
}
