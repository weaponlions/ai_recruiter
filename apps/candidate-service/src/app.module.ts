import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatesModule } from './candidates/candidates.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';

const config = {
  REDIS_URL: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
};

@Module({
  imports: [
    LoggerModule.forRoot({ service: 'candidate-service' }),
    EventBusModule.forRoot({ redisUrl: config.REDIS_URL, serviceName: 'candidate-service' }),
    PrismaModule,
    CandidatesModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
