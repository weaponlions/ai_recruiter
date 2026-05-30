import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';
import { ParsingService } from '../parsing/parsing.service';

interface FileScannedPayload {
  tenantId: string;
  fileId: string;
  candidateId: string;
  verdict: 'CLEAN' | 'INFECTED' | 'ERROR';
  timestamp: string;
}

@Injectable()
export class AiConsumer implements OnModuleInit {
  private readonly logger = new Logger(AiConsumer.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly parsingService: ParsingService,
  ) {}

  onModuleInit(): void {
    this.subscribeToFileScanned();
  }

  private subscribeToFileScanned(): void {
    this.eventBus.subscribe<FileScannedPayload>(
      'file.scanned',
      async (event) => {
        const payload = event.data;
        this.logger.log(
          `Received file.scanned event: fileId=${payload.fileId} verdict=${payload.verdict}`,
        );

        // Only trigger parse when file is confirmed clean
        if (payload.verdict === 'CLEAN') {
          try {
            await this.parsingService.enqueueParseJob(
              payload.tenantId,
              payload.fileId,
              payload.candidateId,
            );
            this.logger.log(
              `Auto-triggered parse job for clean file: fileId=${payload.fileId}`,
            );
          } catch (err) {
            const error = err as Error;
            this.logger.error(
              `Failed to trigger parse for fileId=${payload.fileId}: ${error.message}`,
            );
          }
        } else {
          this.logger.warn(
            `Skipping parse for fileId=${payload.fileId} with verdict=${payload.verdict}`,
          );
        }
      },
    );

    this.logger.log('Subscribed to file.scanned events');
  }
}
