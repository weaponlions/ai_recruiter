import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  authorId!: string;
}

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  findAll(
    @Req() req: FastifyRequest & { tenantId: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.candidatesService.findAll(req.tenantId, page, limit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: CreateCandidateDto,
  ) {
    return this.candidatesService.create(req.tenantId, dto);
  }

  @Get(':id')
  findOne(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.candidatesService.findById(id, req.tenantId);
  }

  @Patch(':id')
  update(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, req.tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.candidatesService.delete(id, req.tenantId);
  }

  // ── Notes endpoints ────────────────────────────────────────────────────────

  @Get(':id/notes')
  getNotes(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.candidatesService.findNotes(id, req.tenantId);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  createNote(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.candidatesService.createNote(id, req.tenantId, dto.content, dto.authorId);
  }

  // ── Consent endpoints ──────────────────────────────────────────────────────

  @Get(':id/consent')
  getConsent(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.candidatesService.getConsentStatus(id, req.tenantId);
  }

  @Post(':id/consent/revoke')
  @HttpCode(HttpStatus.OK)
  revokeConsent(
    @Req() req: FastifyRequest & { tenantId: string },
    @Param('id') id: string,
  ) {
    const ipAddress = (req as any).ip as string | undefined;
    return this.candidatesService.revokeConsent(id, req.tenantId, ipAddress);
  }
}
