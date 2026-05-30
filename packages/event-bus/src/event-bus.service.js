"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const shared_types_1 = require("@hr-ai/shared-types");
let EventBusService = EventBusService_1 = class EventBusService {
    options;
    logger = new common_1.Logger(EventBusService_1.name);
    connection;
    queues = new Map();
    workers = [];
    constructor(options) {
        this.options = options;
        this.connection = new ioredis_1.default(options.redisUrl, {
            maxRetriesPerRequest: null, // Required by BullMQ
        });
    }
    /**
     * Publish an event to the BullMQ queue for that event type.
     * Queue name pattern: events:{eventType}
     * Message includes CloudEvent envelope with tenant_id.
     */
    async publish(eventType, tenantId, payload) {
        const queueName = `events:${eventType}`;
        const queue = this.getOrCreateQueue(queueName);
        const cloudEvent = (0, shared_types_1.buildCloudEvent)(eventType, this.options.serviceName, tenantId, payload);
        await queue.add(eventType, cloudEvent, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        });
        this.logger.debug(`Published [${eventType}] tenant=${tenantId} id=${cloudEvent.id}`);
    }
    /**
     * Subscribe a handler to a specific event type.
     * Creates a BullMQ Worker that processes jobs from the queue.
     */
    subscribe(eventType, handler, concurrency = 5) {
        const queueName = `events:${eventType}`;
        const worker = new bullmq_1.Worker(queueName, async (job) => {
            this.logger.debug(`Processing [${eventType}] id=${job.data.id} tenant=${job.data.tenant_id}`);
            await handler(job.data);
        }, { connection: this.connection.duplicate(), concurrency });
        worker.on('failed', (job, err) => {
            this.logger.error(`Failed [${eventType}] id=${job?.data?.id} attempt=${job?.attemptsMade}: ${err.message}`);
        });
        this.workers.push(worker);
        this.logger.log(`Subscribed to [${eventType}]`);
    }
    async onModuleDestroy() {
        await Promise.all(this.workers.map((w) => w.close()));
        this.connection.disconnect();
    }
    getOrCreateQueue(queueName) {
        if (!this.queues.has(queueName)) {
            const q = new bullmq_1.Queue(queueName, { connection: this.connection.duplicate() });
            this.queues.set(queueName, q);
        }
        return this.queues.get(queueName);
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('EVENT_BUS_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map