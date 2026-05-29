import { Injectable } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CommunicationPublisher } from '../events/communication.publisher';

@Injectable()
export class CalendarService {
  constructor(
    private readonly repo: CalendarRepository,
    private readonly publisher: CommunicationPublisher,
  ) {}

  async create(tenantId: string, data: { candidateId: string; interviewerId: string; jobId?: string; title: string; startAt: string; endAt: string; meetingUrl?: string }) {
    const event = await this.repo.create({ ...data, tenantId, startAt: new Date(data.startAt), endAt: new Date(data.endAt) });
    await this.publisher.interviewBooked(tenantId, {
      calendarEventId: event.id, tenantId, candidateId: event.candidateId,
      startAt: event.startAt.toISOString(), endAt: event.endAt.toISOString(),
    });
    return event;
  }

  findAll(tenantId: string) { return this.repo.findAll(tenantId); }

  async remove(tenantId: string, id: string) { return this.repo.delete(id); }
}
