// ─────────────────────────────────────────────────────────────────────────────
// Event type constants — all inter-service events
// ─────────────────────────────────────────────────────────────────────────────

export const EventType = {
  // Identity Service
  TENANT_CREATED: 'tenant.created',
  USER_INVITED: 'user.invited',
  ROLE_CHANGED: 'role.changed',

  // Job Service
  JOB_PUBLISHED: 'job.published',
  JOB_ARCHIVED: 'job.archived',
  APPLICATION_SUBMITTED: 'application.submitted',

  // Candidate Service
  CANDIDATE_CREATED: 'candidate.created',
  CANDIDATE_UPDATED: 'candidate.updated',
  CONSENT_REVOKED: 'consent.revoked',

  // Pipeline Service
  CANDIDATE_MOVED: 'candidate.moved',
  STAGE_CUSTOMIZED: 'stage.customized',
  INTERVIEW_SCHEDULED: 'interview.scheduled',

  // Document Service
  FILE_UPLOADED: 'file.uploaded',
  FILE_SCANNED: 'file.scanned',
  FILE_EXPIRED: 'file.expired',

  // AI Service
  PARSING_STARTED: 'parsing.started',
  PARSING_COMPLETED: 'parsing.completed',
  MATCH_GENERATED: 'match.generated',

  // Communication Service
  EMAIL_SENT: 'email.sent',
  EMAIL_OPENED: 'email.opened',
  INTERVIEW_BOOKED: 'interview.booked',
} as const;

export type EventTypeValue = (typeof EventType)[keyof typeof EventType];

// ─────────────────────────────────────────────────────────────────────────────
// Event payload types
// ─────────────────────────────────────────────────────────────────────────────

export interface TenantCreatedPayload {
  tenantId: string;
  name: string;
  plan: string;
  seatQuota: number;
}

export interface UserInvitedPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface RoleChangedPayload {
  userId: string;
  tenantId: string;
  oldRole: string;
  newRole: string;
}

export interface JobPublishedPayload {
  jobId: string;
  tenantId: string;
  title: string;
}

export interface JobArchivedPayload {
  jobId: string;
  tenantId: string;
}

export interface ApplicationSubmittedPayload {
  applicationId: string;
  jobId: string;
  candidateId: string;
  tenantId: string;
}

export interface CandidateCreatedPayload {
  candidateId: string;
  tenantId: string;
  email: string;
}

export interface CandidateUpdatedPayload {
  candidateId: string;
  tenantId: string;
  changedFields: string[];
}

export interface ConsentRevokedPayload {
  candidateId: string;
  tenantId: string;
  revokedAt: string;
}

export interface CandidateMovedPayload {
  candidateId: string;
  tenantId: string;
  fromStageId: string | null;
  toStageId: string;
  movedBy: string;
}

export interface InterviewScheduledPayload {
  candidateId: string;
  stageId: string;
  tenantId: string;
  scheduledAt: string;
  interviewerId: string;
}

export interface FileUploadedPayload {
  fileId: string;
  tenantId: string;
  candidateId: string;
  storageKey: string;
  mimeType: string;
}

export interface FileScannedPayload {
  fileId: string;
  tenantId: string;
  verdict: 'clean' | 'infected';
}

export interface FileExpiredPayload {
  fileId: string;
  tenantId: string;
}

export interface ParsingStartedPayload {
  parseJobId: string;
  tenantId: string;
  fileId: string;
}

export interface ParsingCompletedPayload {
  parseJobId: string;
  tenantId: string;
  result: Record<string, unknown>;
  tokensUsed: number;
  modelUsed: string;
}

export interface MatchGeneratedPayload {
  matchJobId: string;
  jobId: string;
  candidateId: string;
  tenantId: string;
  score: number;
  confidence: number;
}

export interface EmailSentPayload {
  emailLogId: string;
  tenantId: string;
  recipientEmail: string;
}

export interface EmailOpenedPayload {
  emailLogId: string;
  tenantId: string;
  occurredAt: string;
}

export interface InterviewBookedPayload {
  calendarEventId: string;
  tenantId: string;
  candidateId: string;
  startAt: string;
  endAt: string;
}
