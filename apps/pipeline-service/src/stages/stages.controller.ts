import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  StagesService,
  CreateStageDto,
  UpdateStageDto,
  ReorderStageDto,
} from './stages.service';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderStagesBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderStageDto)
  stages!: ReorderStageDto[];
}

@Controller()
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get('pipelines/:pipelineId/stages')
  findAll(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.stagesService.findByPipelineId(pipelineId, req.tenantId);
  }

  @Post('pipelines/:pipelineId/stages')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('pipelineId') pipelineId: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.stagesService.create(pipelineId, req.tenantId, dto);
  }

  @Patch('stages/:id')
  update(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.stagesService.update(id, req.tenantId, dto);
  }

  @Delete('stages/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.stagesService.delete(id, req.tenantId);
  }

  @Post('stages/reorder')
  @HttpCode(HttpStatus.OK)
  reorder(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() body: ReorderStagesBody,
  ) {
    return this.stagesService.reorder(req.tenantId, body.stages);
  }
}
