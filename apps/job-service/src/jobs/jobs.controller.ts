import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantGuard, CurrentTenant, CurrentUser } from '@hr-ai/tenant-guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobFilterDto } from './dto/job-filter.dto';

@Controller('jobs')
@UseGuards(TenantGuard)
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() filters: JobFilterDto) {
    return this.service.findAll(tenantId, filters);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser() userId: string, @Body() dto: CreateJobDto) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(':id/publish')
  publish(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.publish(tenantId, id);
  }

  @Post(':id/archive')
  archive(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.archive(tenantId, id);
  }

  @Get(':id/apply-link')
  applyLink(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.getApplyLink(tenantId, id);
  }
}
