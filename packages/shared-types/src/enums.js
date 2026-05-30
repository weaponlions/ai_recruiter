"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Shared enums across all services
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = exports.EmailStatus = exports.ParseJobStatus = exports.ScanStatus = exports.ConsentStatus = exports.JobStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["RECRUITER"] = "RECRUITER";
    UserRole["HIRING_MANAGER"] = "HIRING_MANAGER";
    UserRole["INTERVIEWER"] = "INTERVIEWER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "DRAFT";
    JobStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["CLOSED"] = "CLOSED";
    JobStatus["ARCHIVED"] = "ARCHIVED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["PENDING"] = "PENDING";
    ConsentStatus["GRANTED"] = "GRANTED";
    ConsentStatus["REVOKED"] = "REVOKED";
    ConsentStatus["EXPIRED"] = "EXPIRED";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
var ScanStatus;
(function (ScanStatus) {
    ScanStatus["PENDING"] = "PENDING";
    ScanStatus["SCANNING"] = "SCANNING";
    ScanStatus["CLEAN"] = "CLEAN";
    ScanStatus["INFECTED"] = "INFECTED";
    ScanStatus["ERROR"] = "ERROR";
})(ScanStatus || (exports.ScanStatus = ScanStatus = {}));
var ParseJobStatus;
(function (ParseJobStatus) {
    ParseJobStatus["QUEUED"] = "QUEUED";
    ParseJobStatus["PROCESSING"] = "PROCESSING";
    ParseJobStatus["COMPLETED"] = "COMPLETED";
    ParseJobStatus["FAILED"] = "FAILED";
})(ParseJobStatus || (exports.ParseJobStatus = ParseJobStatus = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["QUEUED"] = "QUEUED";
    EmailStatus["SENT"] = "SENT";
    EmailStatus["BOUNCED"] = "BOUNCED";
    EmailStatus["FAILED"] = "FAILED";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
var Plan;
(function (Plan) {
    Plan["STARTER"] = "STARTER";
    Plan["GROWTH"] = "GROWTH";
    Plan["ENTERPRISE"] = "ENTERPRISE";
})(Plan || (exports.Plan = Plan = {}));
//# sourceMappingURL=enums.js.map