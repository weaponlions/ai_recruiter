import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PipelinesService, CreatePipelineDto, UpdatePipelineDto } from './pipelines.service';

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  findAll(@Req() req: FastifyRequest & { tenantId: string }) {
    return this.pipelinesService.findAll(req.tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: CreatePipelineDto,
  ) {
    return this.pipelinesService.create(req.tenantId, dto);
  }

  @Get(':id')
  findOne(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.pipelinesService.findById(id, req.tenantId);
  }

  @Patch(':id')
  update(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(id, req.tenantId, dto);
  }
}
