import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { PrismaModule } from './prisma/prisma.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { StagesModule } from './stages/stages.module';
import { MovementsModule } from './movements/movements.module';
import { ScorecardsModule } from './scorecards/scorecards.module';
import { HealthModule } from './health/health.module';

const config = {
  REDIS_URL: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
};

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'pipeline-service' }),
    EventBusModule.forRoot({ redisUrl: config.REDIS_URL, serviceName: 'pipeline-service' }),
    PrismaModule,
    PipelinesModule,
    StagesModule,
    MovementsModule,
    ScorecardsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
