import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationPublisher } from '../events/communication.publisher';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: CommunicationPublisher,
  ) {}

  async recordOpen(
    trackingId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const emailLog = await this.prisma.emailLog.findUnique({ where: { trackingId } });
    if (!emailLog) {
      this.logger.warn(`Unknown trackingId for open event: ${trackingId}`);
      return;
    }

    await this.prisma.trackingEvent.create({
      data: {
        emailLogId: emailLog.id,
        type: 'OPEN',
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
      },
    });

    await this.publisher.emailOpened(
      emailLog.tenantId,
      {
        emailLogId: emailLog.id,
        tenantId: emailLog.tenantId,
        occurredAt: new Date().toISOString(),
      },
    );

    this.logger.log(`Email open recorded: emailLogId=${emailLog.id} trackingId=${trackingId}`);
  }

  async recordClick(
    trackingId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const emailLog = await this.prisma.emailLog.findUnique({ where: { trackingId } });
    if (!emailLog) {
      this.logger.warn(`Unknown trackingId for click event: ${trackingId}`);
      return;
    }

    await this.prisma.trackingEvent.create({
      data: {
        emailLogId: emailLog.id,
        type: 'CLICK',
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
      },
    });

    this.logger.log(`Email click recorded: emailLogId=${emailLog.id} trackingId=${trackingId}`);
  }
}
