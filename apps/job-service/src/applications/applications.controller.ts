import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TenantGuard, CurrentTenant } from '@hr-ai/tenant-guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
@UseGuards(TenantGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateApplicationDto) {
    return this.service.create(tenantId, dto);
  }

  @Get('job/:jobId')
  findByJob(@CurrentTenant() tenantId: string, @Param('jobId') jobId: string) {
    return this.service.findByJob(tenantId, jobId);
  }
}
