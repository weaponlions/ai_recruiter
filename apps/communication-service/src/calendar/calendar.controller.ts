import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TenantGuard, CurrentTenant } from '@hr-ai/tenant-guard';
import { CalendarService } from './calendar.service';
import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

class CreateCalendarEventDto {
  @IsUUID() candidateId!: string;
  @IsUUID() interviewerId!: string;
  @IsUUID() @IsOptional() jobId?: string;
  @IsString() title!: string;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;
  @IsString() @IsOptional() meetingUrl?: string;
}

@Controller('calendar/events')
@UseGuards(TenantGuard)
export class CalendarController {
  constructor(private readonly service: CalendarService) {}
  @Post() create(@CurrentTenant() tenantId: string, @Body() dto: CreateCalendarEventDto) { return this.service.create(tenantId, dto); }
  @Get() findAll(@CurrentTenant() tenantId: string) { return this.service.findAll(tenantId); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.remove(tenantId, id); }
}
