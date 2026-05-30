import { DynamicModule } from '@nestjs/common';
export interface LoggerModuleOptions {
    /** Service name injected into every log line */
    service: string;
    /** Set to true for local dev pretty printing, false for JSON in prod */
    pretty?: boolean;
}
export declare class LoggerModule {
    static forRoot(options: LoggerModuleOptions): DynamicModule;
}
//# sourceMappingURL=logger.module.d.ts.map