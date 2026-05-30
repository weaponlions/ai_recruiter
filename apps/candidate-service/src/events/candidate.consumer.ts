import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { CloudEvent, FileScannedPayload, ParsingCompletedPayload } from '@hr-ai/shared-types';
import { CandidatesRepository } from '../candidates/candidates.repository';

@Injectable()
export class CandidateConsumer implements OnModuleInit {
  private readonly logger = new Logger(CandidateConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly repo: CandidatesRepository,
  ) {}

  onModuleInit(): void {
    this.subscribeToFileScanned();
    this.subscribeToParsingCompleted();
  }

  /**
   * Subscribes to file.scanned events.
   * When a file scan completes with CLEAN verdict, updates the candidate resumeUrl.
   */
  private subscribeToFileScanned(): void {
    this.eventBus.subscribe<FileScannedPayload>(
      'file.scanned',
      async (event: CloudEvent<FileScannedPayload>) => {
        const payload = event.data;
        if (!payload.candidateId || !payload.tenantId || payload.verdict !== 'CLEAN') {
          return;
        }
        try {
          const candidate = await this.repo.findById(payload.candidateId, payload.tenantId);
          if (!candidate) return;

          await this.repo.update(payload.candidateId, payload.tenantId, {
            resumeUrl: payload.fileUrl ?? candidate.resumeUrl,
          });
          this.logger.log(`Updated resumeUrl for candidate ${payload.candidateId} after file scan`);
        } catch (err) {
          this.logger.error(`Error handling file.scanned for candidate ${payload.candidateId}`, err);
        }
      },
    );
  }

  /**
   * Subscribes to parsing.completed events.
   * When resume parsing is done, updates candidate fields with extracted data.
   */
  private subscribeToParsingCompleted(): void {
    this.eventBus.subscribe<ParsingCompletedPayload>(
      'parsing.completed',
      async (event: CloudEvent<ParsingCompletedPayload>) => {
        const payload = event.data;
        if (!payload.candidateId || !payload.tenantId) return;
        try {
          const updateData: Record<string, unknown> = {};
          if (payload.firstName) updateData['firstName'] = payload.firstName;
          if (payload.lastName) updateData['lastName'] = payload.lastName;
          if (payload.phone) updateData['phone'] = payload.phone;
          if (payload.tags) updateData['tags'] = payload.tags;
          if (payload.linkedinUrl) updateData['linkedinUrl'] = payload.linkedinUrl;

          if (Object.keys(updateData).length > 0) {
            await this.repo.update(payload.candidateId, payload.tenantId, updateData);
            this.logger.log(`Updated candidate ${payload.candidateId} after parsing.completed`);
          }
        } catch (err) {
          this.logger.error(
            `Error handling parsing.completed for candidate ${payload.candidateId}`,
            err,
          );
        }
      },
    );
  }
}
