// ─────────────────────────────────────────────────────────────────────────────
// Shared enums across all services
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  HIRING_MANAGER = 'HIRING_MANAGER',
  INTERVIEWER = 'INTERVIEWER',
  VIEWER = 'VIEWER',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum ConsentStatus {
  PENDING = 'PENDING',
  GRANTED = 'GRANTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum ScanStatus {
  PENDING = 'PENDING',
  SCANNING = 'SCANNING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  ERROR = 'ERROR',
}

export enum ParseJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum EmailStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

export enum Plan {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}
