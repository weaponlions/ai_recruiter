import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IsString } from 'class-validator';
import { MatchingService } from './matching.service';

class MatchRequestDto {
  @IsString()
  jobId!: string;

  @IsString()
  candidateId!: string;
}

@Controller('match')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async computeMatch(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: MatchRequestDto,
  ) {
    return this.matchingService.computeMatch(req.tenantId, dto.jobId, dto.candidateId);
  }

  @Get(':matchJobId')
  async getMatchJob(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('matchJobId') matchJobId: string,
  ) {
    return this.matchingService.getMatchJob(req.tenantId, matchJobId);
  }
}
