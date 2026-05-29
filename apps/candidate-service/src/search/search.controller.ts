import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { SearchService } from './search.service';
import { IsArray, IsInt, IsNumber, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SemanticSearchDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  embedding!: number[];

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 10;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  keywordSearch(
    @Req() req: FastifyRequest & { tenantId: string },
    @Query('q') q: string,
  ) {
    if (!q || q.trim().length === 0) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.searchService.keywordSearch(req.tenantId, q.trim());
  }

  @Post('semantic')
  semanticSearch(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: SemanticSearchDto,
  ) {
    return this.searchService.semanticSearch(req.tenantId, dto.embedding, dto.limit);
  }
}
