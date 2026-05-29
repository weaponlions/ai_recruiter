import { DynamicModule, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { EventBusOptions } from './event-bus.options';

@Module({})
export class EventBusModule {
  /**
   * Register the EventBus globally with Redis connection options.
   *
   * @example
   * EventBusModule.forRoot({ redisUrl: process.env.REDIS_URL, serviceName: 'identity-service' })
   */
  static forRoot(options: EventBusOptions): DynamicModule {
    return {
      module: EventBusModule,
      global: true,
      providers: [
        {
          provide: 'EVENT_BUS_OPTIONS',
          useValue: options,
        },
        EventBusService,
      ],
      exports: [EventBusService],
    };
  }
}
