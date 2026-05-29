import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { tenantId: string; candidateId?: string; storageKey: string; originalName: string; mimeType: string; sizeBytes: number; uploadedBy: string; }) {
    return this.prisma.file.create({ data });
  }

  findAll(tenantId: string) {
    return this.prisma.file.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.file.findFirst({ where: { id, tenantId }, include: { scanResult: true } });
  }

  updateScanStatus(id: string, status: string) {
    return this.prisma.file.update({ where: { id }, data: { scanStatus: status, updatedAt: new Date() } });
  }

  createScanResult(fileId: string, verdict: string, details?: string) {
    return this.prisma.scanResult.create({ data: { fileId, verdict, details } });
  }

  delete(id: string) {
    return this.prisma.file.delete({ where: { id } });
  }
}
