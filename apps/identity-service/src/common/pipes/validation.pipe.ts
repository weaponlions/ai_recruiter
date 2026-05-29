import { Injectable, ArgumentMetadata, ValidationPipe as NestValidationPipe } from '@nestjs/common';

/**
 * Re-exports NestJS ValidationPipe with project-standard defaults.
 * Registered globally in main.ts; also available as a standalone pipe.
 */
@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }
}
