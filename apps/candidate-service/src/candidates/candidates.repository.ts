import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Candidate, CandidateNote, ConsentLog, Prisma } from '@prisma/client';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SemanticSearchResult {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  distance: number;
}

@Injectable()
export class CandidatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Candidate>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.candidate.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.candidate.count({ where: { tenantId } }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string, tenantId: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({ where: { id, tenantId } });
  }

  async findByEmailHash(tenantId: string, emailHash: string): Promise<Candidate | null> {
    return this.prisma.candidate.findFirst({ where: { tenantId, emailHash } });
  }

  async create(data: Prisma.CandidateCreateInput): Promise<Candidate> {
    return this.prisma.candidate.create({ data });
  }

  async update(id: string, tenantId: string, data: Prisma.CandidateUpdateInput): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string): Promise<Candidate> {
    return this.prisma.candidate.delete({ where: { id } });
  }

  // ── Notes ──────────────────────────────────────────────────────────────────

  async findNotesByCandidateId(
    candidateId: string,
    tenantId: string,
  ): Promise<CandidateNote[]> {
    return this.prisma.candidateNote.findMany({
      where: { candidateId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(
    candidateId: string,
    tenantId: string,
    content: string,
    authorId: string,
  ): Promise<CandidateNote> {
    return this.prisma.candidateNote.create({
      data: { candidateId, tenantId, content, authorId },
    });
  }

  // ── Consent ────────────────────────────────────────────────────────────────

  async findConsentLogs(
    candidateId: string,
    tenantId: string,
  ): Promise<ConsentLog[]> {
    return this.prisma.consentLog.findMany({
      where: { candidateId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createConsentLog(
    candidateId: string,
    tenantId: string,
    action: string,
    ipAddress?: string,
  ): Promise<ConsentLog> {
    return this.prisma.consentLog.create({
      data: { candidateId, tenantId, action, ipAddress },
    });
  }

  async revokeConsent(id: string, tenantId: string): Promise<Candidate> {
    return this.prisma.candidate.update({
      where: { id },
      data: { consentStatus: 'REVOKED' },
    });
  }

  // ── pgvector semantic search via raw SQL ───────────────────────────────────

  async semanticSearch(
    tenantId: string,
    embedding: number[],
    limit: number,
  ): Promise<SemanticSearchResult[]> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const results = await this.prisma.$queryRawUnsafe<SemanticSearchResult[]>(
      `SELECT id, "tenantId", "firstName", "lastName", email,
              embedding <-> $1::vector AS distance
       FROM "Candidate"
       WHERE "tenantId" = $2
         AND embedding IS NOT NULL
       ORDER BY embedding <-> $1::vector
       LIMIT $3`,
      vectorLiteral,
      tenantId,
      limit,
    );
    return results;
  }

  // ── Keyword search ─────────────────────────────────────────────────────────

  async keywordSearch(tenantId: string, q: string): Promise<Candidate[]> {
    const term = `%${q}%`;
    return this.prisma.$queryRawUnsafe<Candidate[]>(
      `SELECT * FROM "Candidate"
       WHERE "tenantId" = $1
         AND (LOWER("firstName") LIKE LOWER($2)
              OR LOWER("lastName") LIKE LOWER($2)
              OR LOWER(email) LIKE LOWER($2)
              OR $2 = ANY(tags))
       ORDER BY "createdAt" DESC
       LIMIT 50`,
      tenantId,
      term,
    );
  }
}
