import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { JobsModule } from './jobs/jobs.module';
import { TemplatesModule } from './templates/templates.module';
import { ApplicationsModule } from './applications/applications.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'job-service' }),
    EventBusModule.forRoot({
      redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      serviceName: 'job-service',
    }),
    PrismaModule,
    JobsModule,
    TemplatesModule,
    ApplicationsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
