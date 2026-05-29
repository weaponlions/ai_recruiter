import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IsString, IsOptional } from 'class-validator';
import { TemplatesService } from './templates.service';

class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  htmlBody!: string;

  @IsOptional()
  @IsString()
  textBody?: string;
}

class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  htmlBody?: string;

  @IsOptional()
  @IsString()
  textBody?: string;
}

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(@Req() req: FastifyRequest & { tenantId: string }) {
    return this.templatesService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(req.tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(req.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    await this.templatesService.remove(req.tenantId, id);
  }
}
