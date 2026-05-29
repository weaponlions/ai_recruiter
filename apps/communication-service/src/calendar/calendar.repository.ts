import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: { tenantId: string; candidateId: string; interviewerId: string; jobId?: string; title: string; startAt: Date; endAt: Date; provider?: string; meetingUrl?: string }) {
    return this.prisma.calendarEvent.create({ data });
  }
  findAll(tenantId: string) { return this.prisma.calendarEvent.findMany({ where: { tenantId }, orderBy: { startAt: 'asc' } }); }
  findOne(tenantId: string, id: string) { return this.prisma.calendarEvent.findFirst({ where: { id, tenantId } }); }
  delete(id: string) { return this.prisma.calendarEvent.delete({ where: { id } }); }
}
