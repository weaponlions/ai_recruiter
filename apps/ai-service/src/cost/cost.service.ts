import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordUsageDto {
  tenantId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  operation: string;
}

// Cost per 1000 tokens (USD) — approximate values
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
};

function computeCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const rates = MODEL_COSTS[model] ?? { input: 0.001, output: 0.002 };
  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
}

@Injectable()
export class CostService {
  private readonly logger = new Logger(CostService.name);
  private readonly monthlyLimit: number;

  constructor(private readonly prisma: PrismaService) {
    this.monthlyLimit = Number(process.env['MONTHLY_TOKEN_LIMIT_PER_TENANT'] ?? 1_000_000);
  }

  async recordUsage(dto: RecordUsageDto): Promise<void> {
    const costUsd = computeCostUsd(dto.model, dto.inputTokens, dto.outputTokens);

    await this.prisma.costLedger.create({
      data: {
        tenantId: dto.tenantId,
        model: dto.model,
        inputTokens: dto.inputTokens,
        outputTokens: dto.outputTokens,
        costUsd,
        operation: dto.operation,
      },
    });

    this.logger.log(
      `Recorded usage: tenant=${dto.tenantId} model=${dto.model} ` +
        `tokens=${dto.inputTokens + dto.outputTokens} cost=$${costUsd.toFixed(6)}`,
    );
  }

  async assertWithinLimit(tenantId: string): Promise<void> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.costLedger.aggregate({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
      },
    });

    const totalTokens =
      (result._sum.inputTokens ?? 0) + (result._sum.outputTokens ?? 0);

    if (totalTokens >= this.monthlyLimit) {
      throw new HttpException(
        `Monthly token limit of ${this.monthlyLimit.toLocaleString()} exceeded for tenant ${tenantId}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async getMonthlyUsage(tenantId: string): Promise<{
    tenantId: string;
    periodStart: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    monthlyLimit: number;
    utilizationPercent: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.prisma.costLedger.aggregate({
      where: { tenantId, createdAt: { gte: startOfMonth } },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        costUsd: true,
      },
    });

    const totalInputTokens = result._sum.inputTokens ?? 0;
    const totalOutputTokens = result._sum.outputTokens ?? 0;
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCostUsd = result._sum.costUsd ?? 0;

    return {
      tenantId,
      periodStart: startOfMonth.toISOString(),
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCostUsd: Math.round(totalCostUsd * 1_000_000) / 1_000_000,
      monthlyLimit: this.monthlyLimit,
      utilizationPercent: Math.round((totalTokens / this.monthlyLimit) * 10000) / 100,
    };
  }

  async getCostBreakdown(tenantId: string): Promise<
    Array<{
      model: string;
      operation: string;
      totalTokens: number;
      totalCostUsd: number;
      requestCount: number;
    }>
  > {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const breakdown = await this.prisma.costLedger.groupBy({
      by: ['model', 'operation'],
      where: { tenantId, createdAt: { gte: startOfMonth } },
      _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      _count: { id: true },
    });

    return breakdown.map((b) => ({
      model: b.model,
      operation: b.operation,
      totalTokens: (b._sum.inputTokens ?? 0) + (b._sum.outputTokens ?? 0),
      totalCostUsd: Math.round((b._sum.costUsd ?? 0) * 1_000_000) / 1_000_000,
      requestCount: b._count.id,
    }));
  }
}
