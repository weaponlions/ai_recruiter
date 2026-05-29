# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/ai-service/ ./apps/ai-service/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hr-ai/ai-service run db:generate
RUN pnpm --filter @hr-ai/ai-service run build

# ---- Production Stage ----
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/ai-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/ai-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/ai-service/prisma ./prisma

USER nestjs
EXPOSE 3006
CMD ["node", "dist/main.js"]
