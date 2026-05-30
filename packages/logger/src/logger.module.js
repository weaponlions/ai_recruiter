"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
let LoggerModule = LoggerModule_1 = class LoggerModule {
    static forRoot(options) {
        const isPretty = options.pretty ?? process.env['NODE_ENV'] === 'development';
        return {
            module: LoggerModule_1,
            global: true,
            imports: [
                nestjs_pino_1.LoggerModule.forRoot({
                    pinoHttp: {
                        level: process.env['LOG_LEVEL'] ?? 'info',
                        transport: isPretty
                            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
                            : undefined,
                        serializers: {
                            req: (req) => ({
                                method: req.method,
                                url: req.url,
                                tenantId: req.raw.tenantId,
                            }),
                            res: (res) => ({ statusCode: res.statusCode }),
                        },
                        customProps: (_req, _res) => ({
                            service: options.service,
                        }),
                    },
                }),
            ],
            exports: [nestjs_pino_1.LoggerModule],
        };
    }
};
exports.LoggerModule = LoggerModule;
exports.LoggerModule = LoggerModule = LoggerModule_1 = __decorate([
    (0, common_1.Module)({})
], LoggerModule);
//# sourceMappingURL=logger.module.js.map