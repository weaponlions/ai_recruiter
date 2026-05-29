import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { LogsModule } from './logs/logs.module';
import { ComplianceModule } from './compliance/compliance.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'audit-service' }),
    EventBusModule.forRoot({
      redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      serviceName: 'audit-service',
    }),
    LogsModule,
    ComplianceModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
