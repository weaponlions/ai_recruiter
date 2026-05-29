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
import { IsString, IsUUID } from 'class-validator';
import { ParsingService } from './parsing.service';

class ParseRequestDto {
  @IsString()
  fileId!: string;

  @IsString()
  candidateId!: string;
}

@Controller('parse')
export class ParsingController {
  constructor(private readonly parsingService: ParsingService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueParseJob(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: ParseRequestDto,
  ) {
    const job = await this.parsingService.enqueueParseJob(req.tenantId, dto.fileId, dto.candidateId);
    return {
      jobId: job.id,
      status: job.status,
      message: 'Parse job queued successfully',
    };
  }

  @Get(':jobId')
  async getParseJobStatus(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('jobId') jobId: string,
  ) {
    return this.parsingService.getJobStatus(req.tenantId, jobId);
  }
}
