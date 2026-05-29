import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { buildCloudEvent, CloudEvent } from '@hr-ai/shared-types';
import { EventBusOptions } from './event-bus.options';

type HandlerFn<T = unknown> = (event: CloudEvent<T>) => Promise<void>;

@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly connection: IORedis;
  private readonly queues = new Map<string, Queue>();
  private readonly workers: Worker[] = [];

  constructor(
    @Inject('EVENT_BUS_OPTIONS') private readonly options: EventBusOptions,
  ) {
    this.connection = new IORedis(options.redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
    });
  }

  /**
   * Publish an event to the BullMQ queue for that event type.
   * Queue name pattern: events:{eventType}
   * Message includes CloudEvent envelope with tenant_id.
   */
  async publish<T>(
    eventType: string,
    tenantId: string,
    payload: T,
  ): Promise<void> {
    const queueName = `events:${eventType}`;
    const queue = this.getOrCreateQueue(queueName);

    const cloudEvent = buildCloudEvent(
      eventType,
      this.options.serviceName,
      tenantId,
      payload,
    );

    await queue.add(eventType, cloudEvent, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });

    this.logger.debug(
      `Published [${eventType}] tenant=${tenantId} id=${cloudEvent.id}`,
    );
  }

  /**
   * Subscribe a handler to a specific event type.
   * Creates a BullMQ Worker that processes jobs from the queue.
   */
  subscribe<T>(
    eventType: string,
    handler: HandlerFn<T>,
    concurrency = 5,
  ): void {
    const queueName = `events:${eventType}`;

    const worker = new Worker(
      queueName,
      async (job: Job<CloudEvent<T>>) => {
        this.logger.debug(
          `Processing [${eventType}] id=${job.data.id} tenant=${job.data.tenant_id}`,
        );
        await handler(job.data);
      },
      { connection: this.connection.duplicate(), concurrency },
    );

    worker.on('failed', (job, err) => {
      this.logger.error(
        `Failed [${eventType}] id=${job?.data?.id} attempt=${job?.attemptsMade}: ${err.message}`,
      );
    });

    this.workers.push(worker);
    this.logger.log(`Subscribed to [${eventType}]`);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()));
    this.connection.disconnect();
  }

  private getOrCreateQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const q = new Queue(queueName, { connection: this.connection.duplicate() });
      this.queues.set(queueName, q);
    }
    return this.queues.get(queueName)!;
  }
}
