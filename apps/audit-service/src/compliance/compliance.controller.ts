import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantGuard, CurrentTenant, CurrentUser } from '@hr-ai/tenant-guard';
import { ComplianceService, ComplianceRequestType } from './compliance.service';
import { IsEmail, IsEnum, IsString } from 'class-validator';

class CreateComplianceRequestDto {
  @IsEnum(['DATA_EXPORT', 'RIGHT_TO_ERASURE']) requestType!: ComplianceRequestType;
  @IsEmail() candidateEmail!: string;
  @IsString() reason!: string;
}

@Controller('compliance')
@UseGuards(TenantGuard)
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Post('requests')
  createRequest(@CurrentTenant() tenantId: string, @CurrentUser() userId: string, @Body() dto: CreateComplianceRequestDto) {
    return this.service.createRequest(tenantId, { ...dto, requestedBy: userId });
  }

  @Get('requests')
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Post('requests/:id/process')
  processRequest(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.processRequest(tenantId, id);
  }
}
