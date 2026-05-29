import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { TemplatesModule } from './templates/templates.module';
import { EmailModule } from './email/email.module';
import { TrackingModule } from './tracking/tracking.module';
import { CalendarModule } from './calendar/calendar.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'communication-service' }),
    EventBusModule.forRoot({
      redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      serviceName: 'communication-service',
    }),
    TemplatesModule,
    EmailModule,
    TrackingModule,
    CalendarModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
