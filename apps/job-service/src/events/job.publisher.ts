import { Injectable } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { EventType, JobPublishedPayload, JobArchivedPayload, ApplicationSubmittedPayload } from '@hr-ai/shared-types';

@Injectable()
export class JobPublisher {
  constructor(private readonly bus: EventBusService) {}

  async jobPublished(tenantId: string, payload: JobPublishedPayload) {
    return this.bus.publish(EventType.JOB_PUBLISHED, tenantId, payload);
  }

  async jobArchived(tenantId: string, payload: JobArchivedPayload) {
    return this.bus.publish(EventType.JOB_ARCHIVED, tenantId, payload);
  }

  async applicationSubmitted(tenantId: string, payload: ApplicationSubmittedPayload) {
    return this.bus.publish(EventType.APPLICATION_SUBMITTED, tenantId, payload);
  }
}
