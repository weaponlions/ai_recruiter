# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/communication-service/ ./apps/communication-service/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hr-ai/communication-service run db:generate
RUN pnpm --filter @hr-ai/communication-service run build

# ---- Production Stage ----
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/apps/communication-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/communication-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/communication-service/prisma ./prisma

USER nestjs
EXPOSE 3007
CMD ["node", "dist/main.js"]
