# ── Stage 1: Builder ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests first (layer cache)
COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/candidate-service/ ./apps/candidate-service/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hr-ai/candidate-service run db:generate
RUN pnpm --filter @hr-ai/candidate-service run build

# ── Stage 2: Production ────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Create non-root user (uid 1001)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/candidate-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/candidate-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/candidate-service/prisma ./prisma

USER nestjs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3003/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
