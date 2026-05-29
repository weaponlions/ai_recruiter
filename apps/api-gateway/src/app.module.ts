import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@hr-ai/logger';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './health/health.module';

/**
 * AppModule for api-gateway.
 *
 * NOTE: The api-gateway does NOT apply TenantMiddleware — it IS the
 * origin that injects X-Tenant-ID into downstream requests after
 * extracting the tenant from the validated JWT.
 * EventBusModule is also not required here.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    LoggerModule.forRoot({ service: 'api-gateway' }),
    GatewayModule,
    HealthModule,
  ],
})
export class AppModule {}
