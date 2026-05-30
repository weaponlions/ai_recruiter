"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Event type constants — all inter-service events
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
exports.EventType = {
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
};
//# sourceMappingURL=events.js.map