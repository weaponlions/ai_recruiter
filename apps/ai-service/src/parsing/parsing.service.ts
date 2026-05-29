import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Worker, Job } from 'bullmq';
import * as crypto from 'crypto';
import { PARSE_QUEUE } from './parsing.module';
import { ParsingRepository } from './parsing.repository';
import { LlmService } from '../llm/llm.service';
import { AiPublisher } from '../events/ai.publisher';
import { ParseJob } from '@prisma/client';

export interface ParseJobData {
  tenantId: string;
  fileId: string;
  candidateId: string;
  parseJobId: string;
}

const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert HR resume parser. 
Extract the following fields from the resume text and return as valid JSON:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "city, state/country",
  "summary": "professional summary",
  "skills": ["array", "of", "skills"],
  "experience": [{"company": "", "title": "", "startDate": "", "endDate": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "field": "", "graduationYear": ""}],
  "totalYearsExperience": 0,
  "languages": ["array of languages"]
}
Return ONLY the JSON object, no markdown or extra text.`;

@Injectable()
export class ParsingService {
  private readonly logger = new Logger(ParsingService.name);

  constructor(
    @InjectQueue(PARSE_QUEUE) private readonly parseQueue: Queue<ParseJobData>,
    private readonly parsingRepo: ParsingRepository,
    private readonly llmService: LlmService,
    private readonly aiPublisher: AiPublisher,
  ) {
    this.registerWorker();
  }

  async enqueueParseJob(
    tenantId: string,
    fileId: string,
    candidateId: string,
  ): Promise<ParseJob> {
    // Check cache first by fileId hash
    const fileHash = crypto.createHash('sha256').update(fileId).digest('hex');
    const cached = await this.parsingRepo.findCacheByHash(fileHash);

    if (cached && cached.expiresAt > new Date()) {
      this.logger.log(`Cache hit for fileId=${fileId}`);
      // Create a completed ParseJob from cache
      const job = await this.parsingRepo.createParseJob({
        tenantId,
        fileId,
        status: 'COMPLETED',
        result: cached.result as object,
        modelUsed: 'cache',
      });
      return job;
    }

    // Create queued job record
    const parseJob = await this.parsingRepo.createParseJob({ tenantId, fileId, status: 'QUEUED' });

    // Enqueue async processing
    await this.parseQueue.add(
      'parse-resume',
      { tenantId, fileId, candidateId, parseJobId: parseJob.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    await this.aiPublisher.publishParsingStarted(tenantId, parseJob.id, fileId);
    this.logger.log(`Enqueued parse job ${parseJob.id} for fileId=${fileId}`);

    return parseJob;
  }

  async getJobStatus(tenantId: string, parseJobId: string): Promise<ParseJob> {
    const job = await this.parsingRepo.findById(parseJobId);
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundException(`Parse job ${parseJobId} not found`);
    }
    return job;
  }

  private registerWorker(): void {
    const redisUrl = new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379');

    const worker = new Worker<ParseJobData>(
      PARSE_QUEUE,
      async (job: Job<ParseJobData>) => {
        await this.processParseJob(job.data);
      },
      {
        connection: {
          host: redisUrl.hostname,
          port: Number(redisUrl.port || 6379),
        },
        concurrency: 5,
      },
    );

    worker.on('completed', (job) => {
      this.logger.log(`Parse worker completed job ${job.id}`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`Parse worker failed job ${job?.id}: ${err.message}`);
    });
  }

  private async processParseJob(data: ParseJobData): Promise<void> {
    const { tenantId, fileId, parseJobId } = data;

    try {
      await this.parsingRepo.updateParseJob(parseJobId, { status: 'PROCESSING' });

      // In production: fetch file content from file-service/storage
      // For now we use fileId as a placeholder content to demonstrate flow
      const resumeContent = `Resume content for fileId: ${fileId}`;

      const fileHash = crypto.createHash('sha256').update(fileId).digest('hex');

      const llmResponse = await this.llmService.complete({
        tenantId,
        prompt: `Parse the following resume:\n\n${resumeContent}`,
        systemPrompt: RESUME_PARSE_SYSTEM_PROMPT,
        operation: 'resume-parse',
      });

      let parsedResult: object;
      try {
        parsedResult = JSON.parse(llmResponse.content) as object;
      } catch {
        parsedResult = { raw: llmResponse.content };
      }

      // Cache the result for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await this.parsingRepo.upsertResumeCache(fileHash, parsedResult, expiresAt);

      await this.parsingRepo.updateParseJob(parseJobId, {
        status: 'COMPLETED',
        modelUsed: llmResponse.modelUsed,
        tokensUsed: llmResponse.totalTokens,
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
        result: parsedResult,
      });

      await this.aiPublisher.publishParsingCompleted(tenantId, parseJobId, fileId, parsedResult);
      this.logger.log(`Parse job ${parseJobId} completed successfully`);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Parse job ${parseJobId} failed: ${error.message}`);
      await this.parsingRepo.updateParseJob(parseJobId, {
        status: 'FAILED',
        error: error.message,
      });
      throw err;
    }
  }
}
