Phase 1, designed for multi-tenant AI SaaS. I’ve aligned boundaries using Domain-Driven Design (DDD), specified data ownership, communication patterns, and provided a realistic deployment strategy to avoid startup over-engineering.

---
## 🏗️ TARGET MICROSERVICE ARCHITECTURE

```
┌─────────────────┐
│   API Gateway   │ ← Rate limiting, tenant routing, response aggregation
└───────┬─────────┘
        │ REST / gRPC (sync)
┌───────┼─────────────────────────────────────────────────────────┐
│       ▼                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ identity-   │ │  job-       │ │ candidate-  │ │  pipeline-  │ │
│ │ service     │ │ service     │ │ service     │ │  service    │ │
│ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │
│        │               │               │               │        │
│ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ │
│ │  document-  │ │    ai-      │ │communication│ │   audit-    │ │
│ │  service    │ │  service    │ │  service    │ │  service    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
        ▲                                                         ▲
        └────────────── Redis / Message Broker (async) ───────────┘
```

---
## 📦 MICROSERVICE BREAKDOWN

| Service | Responsibility | Data Store | Key APIs | Publishes/Consumes Events |
|---------|----------------|------------|----------|---------------------------|
| **`api-gateway`** | Request routing, tenant context injection (`X-Tenant-ID`), rate limiting, auth validation, BFF aggregation | None (stateless) | `/api/v1/*` | Consumes auth tokens, forwards to downstream |
| **`identity-service`** | User auth, JWT/refresh, MFA, RBAC, tenant setup, team invites, seat quotas | PostgreSQL | `/auth/*`, `/users/*`, `/tenants/*`, `/roles/*` | `tenant.created`, `user.invited`, `role.changed` |
| **`job-service`** | Job CRUD, templates, approval toggle, public apply links, board export | PostgreSQL | `/jobs/*`, `/templates/*`, `/publish` | `job.published`, `job.archived`, `application.submitted` |
| **`candidate-service`** | Candidate profiles, tags, notes, consent status, dedup (email/hash), search indexes | PostgreSQL + pgvector | `/candidates/*`, `/search/*`, `/consent/*` | `candidate.created`, `candidate.updated`, `consent.revoked` |
| **`pipeline-service`** | Kanban stages, candidate-stage mapping, movements, scorecards, activity timeline | PostgreSQL | `/pipelines/*`, `/stages/*`, `/movements/*`, `/scorecards/*` | `candidate.moved`, `stage.customized`, `interview.scheduled` |
| **`document-service`** | File upload, ClamAV virus scan, S3/R2 metadata, presigned URLs, retention lifecycle | PostgreSQL + S3/R2 | `/upload/*`, `/files/*`, `/scan/*`, `/presign` | `file.uploaded`, `file.scanned`, `file.expired` |
| **`ai-service`** | Resume parsing, match scoring, semantic search, LLM routing, cost tracking, confidence UI data | PostgreSQL + Redis (queue/cache) | `/parse`, `/match`, `/search/semantic`, `/cost` | `parsing.started`, `parsing.completed`, `match.generated` |
| **`communication-service`** | Email templates, Resend/SendGrid dispatch, open/click tracking, Google/Outlook calendar sync | PostgreSQL | `/templates/*`, `/send`, `/calendar/*`, `/track` | `email.sent`, `email.opened`, `interview.booked` |
| **`audit-service`** | Immutable activity logs, DPDP/GDPR requests, data retention scheduler, compliance exports | PostgreSQL + WORM S3 | `/logs/*`, `/compliance/*`, `/exports/*` | Subscribes to `*.*` events, writes append-only logs |

---
## 🔗 INTER-SERVICE COMMUNICATION PATTERNS

| Pattern | Use Case | Tech |
|---------|----------|------|
| **Sync REST/gRPC** | Direct queries (e.g., Gateway → Services, Pipeline → Candidate for profile) | NestJS Fastify + gRPC (internal) |
| **Async Events** | Decoupled workflows (upload → scan → parse → create candidate → add to pipeline) | Redis Streams / BullMQ (Phase 1) → RabbitMQ/Kafka (Phase 2+) |
| **Data Consistency** | Cross-service transactions (e.g., candidate creation + pipeline entry + audit log) | Saga pattern with compensating actions |
| **Tenant Isolation** | Every service enforces `tenant_id` at query level | PostgreSQL Row-Level Security (RLS) + middleware injection |
| **Event Schema** | Standardized, versioned, tenant-scoped | CloudEvents format: `{"specversion":"1.0","type":"candidate.created","source":"candidate-service","tenant_id":"...","data":{...}}` |

---
## 📅 PHASE 1 DEPLOYMENT STRATEGY (Realistic for Startups)

Microservices add operational overhead. **Start modular, extract later.**

| Phase | Deployable Units | Why |
|-------|------------------|-----|
| **MVP (Weeks 1–8)** | `core-app` (identity + job + candidate + pipeline) + `worker-app` (document + ai + communication + audit) + `gateway` | Reduces CI/CD, DB migrations, and monitoring complexity. Internal module boundaries are already microservice-ready. |
| **Scale (Weeks 9–12)** | Extract `ai-service` & `document-service` as independent pods | AI parsing & file I/O are CPU/memory heavy. Independent scaling prevents pipeline bottlenecks. |
| **Growth (Weeks 13–16)** | Extract `communication-service` & `audit-service` | High I/O, external API dependencies, compliance isolation requirements. |
| **Enterprise (Year 2)** | Full independent deployment per service + K8s + service mesh | Team ownership, per-service SLAs, zero-downtime updates, advanced observability. |

---
## ⚙️ INFRASTRUCTURE & DEVOPS SETUP

| Component | Recommendation |
|-----------|----------------|
| **Containerization** | Docker + multi-stage builds, non-root users, slim images |
| **Orchestration** | Docker Compose (dev) → Render/Railway (MVP) → Kubernetes/EKS (scale) |
| **Service Discovery** | Internal DNS / K8s Services / Consul (later) |
| **CI/CD** | GitHub Actions per service, preview envs, automated DB migrations (Prisma/Drizzle) |
| **Observability** | OpenTelemetry SDK in all services → Tempo/Jaeger (traces), Loki (logs), Prometheus (metrics), Grafana dashboards |
| **Secrets** | HashiCorp Vault / AWS Secrets Manager / Doppler |
| **Backups** | Daily PostgreSQL snapshots, weekly S3 lifecycle, immutable audit logs (Object Lock) |

---
## 🚨 CRITICAL IMPLEMENTATION RULES

1. **Never share databases.** Each service owns its schema. Cross-service data is fetched via API or replicated via events.
2. **Enforce tenant isolation at every layer.** DB: RLS + `tenant_id` indexes. API: Gateway injects `X-Tenant-ID`. Cache/Queue: Prefix keys with `tenant:{id}:`.
3. **AI must be async-first.** Never block HTTP requests for parsing/matching. Use job queues, return `job_id`, poll or webhook on completion.
4. **Audit logs are immutable.** Use append-only tables, hash-chain verification, or WORM storage. Never allow `UPDATE`/`DELETE` on audit records.
5. **Design for graceful degradation.** If AI service is down, fallback to keyword search + manual parsing. If calendar sync fails, fall back to manual slot selection.
6. **Cost-aware AI routing.** Cache identical resume hashes, batch LLM calls, use smaller models for confidence <90%, enforce per-tenant monthly token limits.

---