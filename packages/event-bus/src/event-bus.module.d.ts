import { DynamicModule } from '@nestjs/common';
import { EventBusOptions } from './event-bus.options';
export declare class EventBusModule {
    /**
     * Register the EventBus globally with Redis connection options.
     *
     * @example
     * EventBusModule.forRoot({ redisUrl: process.env.REDIS_URL, serviceName: 'identity-service' })
     */
    static forRoot(options: EventBusOptions): DynamicModule;
}
//# sourceMappingURL=event-bus.module.d.ts.map