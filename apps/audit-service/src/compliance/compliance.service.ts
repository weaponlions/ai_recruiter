import { Injectable } from '@nestjs/common';
import { ComplianceRepository } from './compliance.repository';

export type ComplianceRequestType = 'DATA_EXPORT' | 'RIGHT_TO_ERASURE';

@Injectable()
export class ComplianceService {
  constructor(private readonly repo: ComplianceRepository) {}

  async createRequest(tenantId: string, data: { requestType: ComplianceRequestType; candidateEmail: string; requestedBy: string }) {
    return this.repo.create(tenantId, data);
  }

  findAll(tenantId: string) {
    return this.repo.findAll(tenantId);
  }

  /** Process a GDPR/DPDP data export or erasure request — async in production */
  async processRequest(tenantId: string, id: string) {
    // In production: generate export ZIP, upload to WORM S3, return URL
    // For Phase 1: mark as processed with a placeholder
    return this.repo.markProcessed(id, `s3://hr-ai-audit-exports/${tenantId}/${id}.zip`);
  }
}
