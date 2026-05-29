import { Injectable } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { EventType, CloudEvent } from '@hr-ai/shared-types';
import { LogsService } from '../logs/logs.service';

/**
 * AuditConsumer — subscribes to ALL event types and writes each as an immutable AuditLog entry.
 * This is the "*.*" subscriber described in the architecture.
 */
@Injectable()
export class AuditConsumer {
  constructor(
    private readonly bus: EventBusService,
    private readonly logsService: LogsService,
  ) {
    this.registerAllSubscriptions();
  }

  private registerAllSubscriptions(): void {
    // Subscribe to every known event type
    Object.values(EventType).forEach((eventType) => {
      this.bus.subscribe(eventType, async (event: CloudEvent<Record<string, unknown>>) => {
        await this.logsService.writeLog({
          tenantId: event.tenant_id,
          eventType: event.type,
          source: event.source,
          data: event.data as object,
        });
      });
    });
  }
}
