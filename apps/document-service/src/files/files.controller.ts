import { Controller, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { TenantGuard, CurrentTenant, CurrentUser } from '@hr-ai/tenant-guard';
import { FilesService } from './files.service';
import { FastifyRequest } from 'fastify';

@Controller('files')
@UseGuards(TenantGuard)
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  async upload(@Req() req: FastifyRequest, @CurrentTenant() tenantId: string, @CurrentUser() userId: string) {
    // Fastify multipart — handled via @fastify/multipart registered in main.ts
    const data = await (req as any).file();
    const buffer = await data.toBuffer();
    return this.service.upload(tenantId, userId, {
      buffer, originalname: data.filename, mimetype: data.mimetype, size: buffer.length,
    }, req.query && (req.query as any).candidateId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) { return this.service.findAll(tenantId); }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.findOne(tenantId, id); }

  @Get(':id/presign')
  getPresignedUrl(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.getPresignedUrl(tenantId, id); }

  @Post(':id/scan')
  triggerScan(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.triggerScan(tenantId, id); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) { return this.service.remove(tenantId, id); }
}
