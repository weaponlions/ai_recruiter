import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import fastifyRateLimit from '@fastify/rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  // Use pino structured logger
  app.useLogger(app.get(Logger));

  // Register rate limiting at Fastify level
  await app.register(fastifyRateLimit as any, {
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
    timeWindow: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    errorResponseBuilder: (_req: any, context: any) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry after ${context.after}`,
    }),
  });

  // Global route prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for browser clients
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'X-User-ID',
      'X-User-Role',
      'X-Request-ID',
    ],
  });

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`API Gateway is listening on port ${port}`, 'Bootstrap');
}

bootstrap();
