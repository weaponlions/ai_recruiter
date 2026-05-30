import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TenantGuard, CurrentTenant } from '@hr-ai/tenant-guard';
import { LogsService } from './logs.service';

@Controller('logs')
@UseGuards(TenantGuard)
export class LogsController {
  constructor(private readonly service: LogsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('eventType') eventType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(tenantId, { eventType, from, to, page, limit });
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }
}
