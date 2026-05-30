# ── Stage 1: Builder ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g yarn --prefer-offline

# Copy workspace manifests first (layer cache)
COPY turbo.json package.json yarn.lock* ./
COPY packages/ ./packages/
COPY apps/pipeline-service/ ./apps/pipeline-service/

RUN yarn install --frozen-lockfile --network-concurrency 2
RUN yarn workspace @hr-ai/db:generate
RUN yarn workspace @hr-ai/pipeline-service build

# ── Stage 2: Production ────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Create non-root user (uid 1001)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/pipeline-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/pipeline-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/pipeline-service/prisma ./prisma

USER nestjs

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3004/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
