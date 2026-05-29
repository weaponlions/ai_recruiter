import { Injectable } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { EventType, EmailSentPayload, EmailOpenedPayload, InterviewBookedPayload, CloudEvent, InterviewScheduledPayload } from '@hr-ai/shared-types';

@Injectable()
export class CommunicationPublisher {
  constructor(private readonly bus: EventBusService) {}
  async emailSent(tenantId: string, payload: EmailSentPayload) { return this.bus.publish(EventType.EMAIL_SENT, tenantId, payload); }
  async emailOpened(tenantId: string, payload: EmailOpenedPayload) { return this.bus.publish(EventType.EMAIL_OPENED, tenantId, payload); }
  async interviewBooked(tenantId: string, payload: InterviewBookedPayload) { return this.bus.publish(EventType.INTERVIEW_BOOKED, tenantId, payload); }
}

@Injectable()
export class CommunicationConsumer {
  constructor(private readonly bus: EventBusService) {
    // On interview.scheduled: auto-send interview invite email
    this.bus.subscribe<InterviewScheduledPayload>(EventType.INTERVIEW_SCHEDULED, async (event: CloudEvent<InterviewScheduledPayload>) => {
      console.info(`[communication-service] interview.scheduled received — auto-sending invite for candidateId=${event.data.candidateId}`);
      // In production: look up candidate email, render template, dispatch via EmailService
    });
  }
}
