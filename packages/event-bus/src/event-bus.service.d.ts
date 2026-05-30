import { OnModuleDestroy } from '@nestjs/common';
import { CloudEvent } from '@hr-ai/shared-types';
import { EventBusOptions } from './event-bus.options';
type HandlerFn<T = unknown> = (event: CloudEvent<T>) => Promise<void>;
export declare class EventBusService implements OnModuleDestroy {
    private readonly options;
    private readonly logger;
    private readonly connection;
    private readonly queues;
    private readonly workers;
    constructor(options: EventBusOptions);
    /**
     * Publish an event to the BullMQ queue for that event type.
     * Queue name pattern: events:{eventType}
     * Message includes CloudEvent envelope with tenant_id.
     */
    publish<T>(eventType: string, tenantId: string, payload: T): Promise<void>;
    /**
     * Subscribe a handler to a specific event type.
     * Creates a BullMQ Worker that processes jobs from the queue.
     */
    subscribe<T>(eventType: string, handler: HandlerFn<T>, concurrency?: number): void;
    onModuleDestroy(): Promise<void>;
    private getOrCreateQueue;
}
export {};
//# sourceMappingURL=event-bus.service.d.ts.map