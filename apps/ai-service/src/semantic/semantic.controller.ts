import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SemanticService } from './semantic.service';

class SemanticSearchDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

@Controller('search')
export class SemanticController {
  constructor(private readonly semanticService: SemanticService) {}

  @Post('semantic')
  @HttpCode(HttpStatus.OK)
  async semanticSearch(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: SemanticSearchDto,
  ) {
    return this.semanticService.semanticSearch(req.tenantId, dto.query, dto.limit ?? 10);
  }
}
