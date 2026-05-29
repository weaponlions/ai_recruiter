import { Controller, Get, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CostService } from './cost.service';

@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Get()
  async getMonthlyUsage(@Req() req: FastifyRequest) {
    const tenantId = (req as FastifyRequest & { tenantId: string }).tenantId;
    return this.costService.getMonthlyUsage(tenantId);
  }

  @Get('breakdown')
  async getCostBreakdown(@Req() req: FastifyRequest) {
    const tenantId = (req as FastifyRequest & { tenantId: string }).tenantId;
    return this.costService.getCostBreakdown(tenantId);
  }
}
