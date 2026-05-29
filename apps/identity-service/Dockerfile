# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/identity-service/ ./apps/identity-service/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hr-ai/identity-service run prisma:generate
RUN pnpm --filter @hr-ai/identity-service run build

# ---- Production Stage ----
FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/identity-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/identity-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/identity-service/prisma ./prisma

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
