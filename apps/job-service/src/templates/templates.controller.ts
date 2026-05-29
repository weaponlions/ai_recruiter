import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantGuard, CurrentTenant } from '@hr-ai/tenant-guard';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Controller('templates')
@UseGuards(TenantGuard)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}
  @Get() findAll(@CurrentTenant() tenantId: string) { return this.service.findAll(tenantId); }
  @Post() create(@CurrentTenant() tenantId: string, @Body() dto: CreateTemplateDto) { return this.service.create(tenantId, dto); }
  @Get(':id') findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.findOne(tenantId, id); }
  @Patch(':id') update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) { return this.service.update(tenantId, id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.remove(tenantId, id); }
}
