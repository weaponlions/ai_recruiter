import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { CandidatesRepository, PaginatedResult, SemanticSearchResult } from './candidates.repository';
import { CandidatePublisher } from '../events/candidate.publisher';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate, CandidateNote, ConsentLog } from '@prisma/client';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(
    private readonly repo: CandidatesRepository,
    private readonly publisher: CandidatePublisher,
  ) {}

  // ── SHA-256 email dedup helper ─────────────────────────────────────────────

  private hashEmail(email: string): string {
    return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<Candidate>> {
    return this.repo.findAll(tenantId, page, limit);
  }

  async findById(id: string, tenantId: string): Promise<Candidate> {
    const candidate = await this.repo.findById(id, tenantId);
    if (!candidate) {
      throw new NotFoundException(`Candidate ${id} not found`);
    }
    // Mask PII if consent is revoked
    if (candidate.consentStatus === 'REVOKED') {
      return {
        ...candidate,
        email: '[REDACTED]',
        phone: null,
        firstName: '[REDACTED]',
        lastName: '[REDACTED]',
        linkedinUrl: null,
        resumeUrl: null,
      };
    }
    return candidate;
  }

  async create(tenantId: string, dto: CreateCandidateDto): Promise<Candidate> {
    const emailHash = this.hashEmail(dto.email);

    // Dedup check
    const existing = await this.repo.findByEmailHash(tenantId, emailHash);
    if (existing) {
      throw new ConflictException(
        `Candidate with this email already exists in this tenant`,
      );
    }

    const candidate = await this.repo.create({
      tenantId,
      email: dto.email,
      emailHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      linkedinUrl: dto.linkedinUrl,
      resumeUrl: dto.resumeUrl,
      tags: dto.tags ?? [],
      consentStatus: dto.consentStatus ?? 'PENDING',
      source: dto.source ?? 'MANUAL',
    });

    await this.publisher.publishCandidateCreated(candidate);
    this.logger.log(`Candidate created: ${candidate.id} for tenant ${tenantId}`);
    return candidate;
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateCandidateDto,
  ): Promise<Candidate> {
    await this.findById(id, tenantId); // ensure exists + tenant scoped

    // If email is changing, recompute hash and re-dedup
    let updateData: Record<string, unknown> = { ...dto };
    if (dto.email) {
      const newHash = this.hashEmail(dto.email);
      const existing = await this.repo.findByEmailHash(tenantId, newHash);
      if (existing && existing.id !== id) {
        throw new ConflictException('Another candidate already has this email');
      }
      updateData['emailHash'] = newHash;
    }

    const updated = await this.repo.update(id, tenantId, updateData);
    await this.publisher.publishCandidateUpdated(updated);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<{ deleted: boolean }> {
    await this.findById(id, tenantId);
    await this.repo.delete(id, tenantId);
    return { deleted: true };
  }

  // ── Notes ──────────────────────────────────────────────────────────────────

  async findNotes(candidateId: string, tenantId: string): Promise<CandidateNote[]> {
    await this.findById(candidateId, tenantId);
    return this.repo.findNotesByCandidateId(candidateId, tenantId);
  }

  async createNote(
    candidateId: string,
    tenantId: string,
    content: string,
    authorId: string,
  ): Promise<CandidateNote> {
    await this.findById(candidateId, tenantId);
    return this.repo.createNote(candidateId, tenantId, content, authorId);
  }

  // ── Consent ────────────────────────────────────────────────────────────────

  async getConsentStatus(
    candidateId: string,
    tenantId: string,
  ): Promise<{ status: string; logs: ConsentLog[] }> {
    const candidate = await this.repo.findById(candidateId, tenantId);
    if (!candidate) throw new NotFoundException(`Candidate ${candidateId} not found`);
    const logs = await this.repo.findConsentLogs(candidateId, tenantId);
    return { status: candidate.consentStatus, logs };
  }

  async revokeConsent(
    candidateId: string,
    tenantId: string,
    ipAddress?: string,
  ): Promise<{ revoked: boolean }> {
    const candidate = await this.repo.findById(candidateId, tenantId);
    if (!candidate) throw new NotFoundException(`Candidate ${candidateId} not found`);

    await this.repo.revokeConsent(candidateId, tenantId);
    await this.repo.createConsentLog(candidateId, tenantId, 'REVOKED', ipAddress);
    await this.publisher.publishConsentRevoked(candidateId, tenantId);
    this.logger.log(`Consent revoked for candidate ${candidateId}`);
    return { revoked: true };
  }

  // ── Semantic search (delegated to repo) ───────────────────────────────────

  async semanticSearch(
    tenantId: string,
    embedding: number[],
    limit: number,
  ): Promise<SemanticSearchResult[]> {
    return this.repo.semanticSearch(tenantId, embedding, limit);
  }

  async keywordSearch(tenantId: string, q: string): Promise<Candidate[]> {
    return this.repo.keywordSearch(tenantId, q);
  }
}
