import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FilesRepository } from './files.repository';
import { StorageService } from '../storage/storage.service';
import { DocumentPublisher } from '../events/document.publisher';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = (process.env['ALLOWED_MIME_TYPES'] ?? 'application/pdf,image/png,image/jpeg').split(',');
const MAX_BYTES = parseInt(process.env['MAX_FILE_SIZE_MB'] ?? '10') * 1024 * 1024;

@Injectable()
export class FilesService {
  constructor(
    private readonly repo: FilesRepository,
    private readonly storage: StorageService,
    private readonly publisher: DocumentPublisher,
  ) {}

  async upload(tenantId: string, userId: string, file: { buffer: Buffer; originalname: string; mimetype: string; size: number }, candidateId?: string) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) throw new BadRequestException(`MIME type ${file.mimetype} not allowed`);
    if (file.size > MAX_BYTES) throw new BadRequestException(`File exceeds ${process.env['MAX_FILE_SIZE_MB'] ?? 10}MB limit`);

    const key = `${tenantId}/${candidateId ?? 'general'}/${crypto.randomUUID()}-${file.originalname}`;
    await this.storage.upload(key, file.buffer, file.mimetype);

    const record = await this.repo.create({ tenantId, candidateId, storageKey: key, originalName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, uploadedBy: userId });

    await this.publisher.fileUploaded(tenantId, { fileId: record.id, tenantId, candidateId: candidateId ?? '', storageKey: key, mimeType: file.mimetype });
    return record;
  }

  findAll(tenantId: string) { return this.repo.findAll(tenantId); }

  async findOne(tenantId: string, id: string) {
    const file = await this.repo.findOne(tenantId, id);
    if (!file) throw new NotFoundException(`File ${id} not found`);
    return file;
  }

  async getPresignedUrl(tenantId: string, id: string) {
    const file = await this.findOne(tenantId, id);
    const url = await this.storage.getPresignedUrl(file.storageKey);
    return { url, expiresIn: 3600 };
  }

  async triggerScan(tenantId: string, id: string) {
    const file = await this.findOne(tenantId, id);
    await this.repo.updateScanStatus(id, 'SCANNING');
    // In production: send to ClamAV daemon via TCP; simulate clean for Phase 1
    const verdict = 'clean';
    await this.repo.updateScanStatus(id, 'CLEAN');
    await this.repo.createScanResult(id, verdict);
    await this.publisher.fileScanned(tenantId, { fileId: id, tenantId, verdict });
    return { fileId: id, verdict };
  }

  async remove(tenantId: string, id: string) {
    const file = await this.findOne(tenantId, id);
    await this.storage.deleteObject(file.storageKey);
    return this.repo.delete(id);
  }
}
