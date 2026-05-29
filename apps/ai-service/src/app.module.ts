import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { ParsingModule } from './parsing/parsing.module';
import { MatchingModule } from './matching/matching.module';
import { SemanticModule } from './semantic/semantic.module';
import { CostModule } from './cost/cost.module';
import { LlmModule } from './llm/llm.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'ai-service' }),
    EventBusModule.forRoot({
      redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      serviceName: 'ai-service',
    }),
    LlmModule,
    ParsingModule,
    MatchingModule,
    SemanticModule,
    CostModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
