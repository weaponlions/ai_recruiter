-- ─────────────────────────────────────────────────────────────────────────────
-- Create per-service databases for local development
-- Run by the init-db container on first start
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE identity_db;
CREATE DATABASE job_db;
CREATE DATABASE candidate_db;
CREATE DATABASE pipeline_db;
CREATE DATABASE document_db;
CREATE DATABASE ai_db;
CREATE DATABASE communication_db;
CREATE DATABASE audit_db;

-- Enable pgvector extension in candidate_db
\connect candidate_db
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp in all databases
\connect identity_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\connect job_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect candidate_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect pipeline_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect document_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect ai_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect communication_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\connect audit_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
