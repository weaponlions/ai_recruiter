import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParseJob, ResumeCache } from '@prisma/client';

interface CreateParseJobData {
  tenantId: string;
  fileId: string;
  status: string;
  result?: object;
  modelUsed?: string;
}

interface UpdateParseJobData {
  status?: string;
  modelUsed?: string;
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  result?: object;
  error?: string;
}

@Injectable()
export class ParsingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createParseJob(data: CreateParseJobData): Promise<ParseJob> {
    return this.prisma.parseJob.create({
      data: {
        tenantId: data.tenantId,
        fileId: data.fileId,
        status: data.status,
        result: data.result ?? undefined,
        modelUsed: data.modelUsed ?? undefined,
      },
    });
  }

  async findById(id: string): Promise<ParseJob | null> {
    return this.prisma.parseJob.findUnique({ where: { id } });
  }

  async findByFileId(tenantId: string, fileId: string): Promise<ParseJob | null> {
    return this.prisma.parseJob.findFirst({
      where: { tenantId, fileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateParseJob(id: string, data: UpdateParseJobData): Promise<ParseJob> {
    return this.prisma.parseJob.update({
      where: { id },
      data: {
        status: data.status,
        modelUsed: data.modelUsed,
        tokensUsed: data.tokensUsed,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        result: data.result ?? undefined,
        error: data.error,
      },
    });
  }

  async findCacheByHash(fileHash: string): Promise<ResumeCache | null> {
    return this.prisma.resumeCache.findUnique({ where: { fileHash } });
  }

  async upsertResumeCache(
    fileHash: string,
    result: object,
    expiresAt: Date,
  ): Promise<ResumeCache> {
    return this.prisma.resumeCache.upsert({
      where: { fileHash },
      create: { fileHash, result, expiresAt },
      update: { result, expiresAt },
    });
  }
}
