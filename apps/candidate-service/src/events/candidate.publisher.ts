import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { Candidate } from '@prisma/client';

@Injectable()
export class CandidatePublisher {
  private readonly logger = new Logger(CandidatePublisher.name);

  constructor(private readonly eventBus: EventBusService) {}

  async publishCandidateCreated(candidate: Candidate): Promise<void> {
    try {
      await this.eventBus.publish('candidate.created', {
        candidateId: candidate.id,
        tenantId: candidate.tenantId,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        source: candidate.source,
        createdAt: candidate.createdAt.toISOString(),
      });
      this.logger.log(`Published candidate.created for ${candidate.id}`);
    } catch (err) {
      this.logger.error('Failed to publish candidate.created', err);
    }
  }

  async publishCandidateUpdated(candidate: Candidate): Promise<void> {
    try {
      await this.eventBus.publish('candidate.updated', {
        candidateId: candidate.id,
        tenantId: candidate.tenantId,
        updatedAt: candidate.updatedAt.toISOString(),
      });
      this.logger.log(`Published candidate.updated for ${candidate.id}`);
    } catch (err) {
      this.logger.error('Failed to publish candidate.updated', err);
    }
  }

  async publishConsentRevoked(candidateId: string, tenantId: string): Promise<void> {
    try {
      await this.eventBus.publish('consent.revoked', {
        candidateId,
        tenantId,
        revokedAt: new Date().toISOString(),
      });
      this.logger.log(`Published consent.revoked for candidate ${candidateId}`);
    } catch (err) {
      this.logger.error('Failed to publish consent.revoked', err);
    }
  }
}
