import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MovementsService, MoveCandidateDto } from './movements.service';

@Controller()
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  moveCandidate(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: MoveCandidateDto,
  ) {
    return this.movementsService.moveCandidateToStage(req.tenantId, dto);
  }

  @Get('candidates/:candidateId/timeline')
  getTimeline(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('candidateId') candidateId: string,
  ) {
    return this.movementsService.getCandidateTimeline(candidateId, req.tenantId);
  }
}
