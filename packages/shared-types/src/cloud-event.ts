// ─────────────────────────────────────────────────────────────────────────────
// CloudEvents 1.0 base interface
// All inter-service events MUST conform to this schema.
// ─────────────────────────────────────────────────────────────────────────────
export interface CloudEvent<T = unknown> {
  /** Always "1.0" */
  specversion: '1.0';
  /** Reverse-DNS namespaced event type, e.g. "candidate.created" */
  type: string;
  /** Originating service, e.g. "candidate-service" */
  source: string;
  /** Unique event ID (UUID v4 recommended) */
  id: string;
  /** RFC3339 timestamp */
  time: string;
  /** Tenant isolation — REQUIRED on every event */
  tenant_id: string;
  /** Content type of data field */
  datacontenttype: 'application/json';
  /** Event payload */
  data: T;
}

/**
 * Factory to build a CloudEvent with sane defaults.
 */
export function buildCloudEvent<T>(
  type: string,
  source: string,
  tenantId: string,
  data: T,
): CloudEvent<T> {
  return {
    specversion: '1.0',
    type,
    source,
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    tenant_id: tenantId,
    datacontenttype: 'application/json',
    data,
  };
}
