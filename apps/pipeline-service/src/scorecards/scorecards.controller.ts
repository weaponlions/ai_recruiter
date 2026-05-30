import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantGuard, CurrentTenant, CurrentUser } from '@hr-ai/tenant-guard';
import { ScorecardsService } from './scorecards.service';
import { IsUUID, IsObject, IsOptional, IsNumber, IsString } from 'class-validator';

class CreateScorecardDto {
  @IsUUID() candidateId!: string;
  @IsUUID() stageId!: string;
  @IsObject() scores!: object;
  @IsNumber() @IsOptional() overallScore?: number;
  @IsString() @IsOptional() recommendation?: string;
}

@Controller('scorecards')
@UseGuards(TenantGuard)
export class ScorecardsController {
  constructor(private readonly service: ScorecardsService) {}
  @Post() create(@CurrentTenant() tenantId: string, @CurrentUser() userId: string, @Body() dto: CreateScorecardDto) { return this.service.create(tenantId, userId, dto); }
  @Get('candidate/:candidateId') findByCandidate(@CurrentTenant() tenantId: string, @Param('candidateId') cid: string) { return this.service.findByCandidate(tenantId, cid); }
}
