import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@hr-ai/logger';
import { EventBusModule } from '@hr-ai/event-bus';
import { TenantMiddleware } from '@hr-ai/tenant-guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { RolesModule } from './roles/roles.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    LoggerModule.forRoot({ service: 'identity-service' }),
    EventBusModule.forRoot({
      redisUrl: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      serviceName: 'identity-service',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    RolesModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Apply TenantMiddleware to all routes EXCEPT public auth endpoints.
   * /api/v1/auth/* routes are exempt — they are pre-authentication.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'api/v1/auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/v1/health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
