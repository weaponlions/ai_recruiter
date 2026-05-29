import { Injectable } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { EventType, FileUploadedPayload, FileScannedPayload, FileExpiredPayload, CloudEvent, ConsentRevokedPayload } from '@hr-ai/shared-types';

@Injectable()
export class DocumentPublisher {
  constructor(private readonly bus: EventBusService) {}
  async fileUploaded(tenantId: string, payload: FileUploadedPayload) { return this.bus.publish(EventType.FILE_UPLOADED, tenantId, payload); }
  async fileScanned(tenantId: string, payload: FileScannedPayload) { return this.bus.publish(EventType.FILE_SCANNED, tenantId, payload); }
  async fileExpired(tenantId: string, payload: FileExpiredPayload) { return this.bus.publish(EventType.FILE_EXPIRED, tenantId, payload); }
}

@Injectable()
export class DocumentConsumer {
  constructor(private readonly bus: EventBusService) {
    // On consent.revoked: schedule file deletion for that candidate
    this.bus.subscribe<ConsentRevokedPayload>(EventType.CONSENT_REVOKED, async (event: CloudEvent<ConsentRevokedPayload>) => {
      // In production: query all files for candidateId and soft-delete or flag for retention review
      console.info(`[document-service] Consent revoked for candidate in tenant ${event.tenant_id} — flagging files for retention review`);
    });
  }
}
