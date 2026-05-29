import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

export interface LoggerModuleOptions {
  /** Service name injected into every log line */
  service: string;
  /** Set to true for local dev pretty printing, false for JSON in prod */
  pretty?: boolean;
}

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const isPretty = options.pretty ?? process.env['NODE_ENV'] === 'development';

    return {
      module: LoggerModule,
      global: true,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: {
            level: process.env['LOG_LEVEL'] ?? 'info',
            transport: isPretty
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
            serializers: {
              req: (req) => ({
                method: req.method,
                url: req.url,
                tenantId: (req.raw as { tenantId?: string }).tenantId,
              }),
              res: (res) => ({ statusCode: res.statusCode }),
            },
            customProps: (_req, _res) => ({
              service: options.service,
            }),
          },
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
