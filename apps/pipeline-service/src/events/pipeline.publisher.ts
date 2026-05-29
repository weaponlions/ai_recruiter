import { Injectable } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { EventType, CandidateMovedPayload, InterviewScheduledPayload, CloudEvent, JobPublishedPayload } from '@hr-ai/shared-types';

@Injectable()
export class PipelinePublisher {
  constructor(private readonly bus: EventBusService) {}
  async candidateMoved(tenantId: string, payload: CandidateMovedPayload) { return this.bus.publish(EventType.CANDIDATE_MOVED, tenantId, payload); }
  async interviewScheduled(tenantId: string, payload: InterviewScheduledPayload) { return this.bus.publish(EventType.INTERVIEW_SCHEDULED, tenantId, payload); }
}

@Injectable()
export class PipelineConsumer {
  constructor(private readonly bus: EventBusService) {
    // On job.published: a pipeline can be auto-created for that job
    this.bus.subscribe<JobPublishedPayload>(EventType.JOB_PUBLISHED, async (event: CloudEvent<JobPublishedPayload>) => {
      console.info(`[pipeline-service] job.published received for jobId=${event.data.jobId} — auto-pipeline creation hook ready`);
    });
  }
}
