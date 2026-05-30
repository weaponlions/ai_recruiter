# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g yarn --prefer-offline

COPY turbo.json package.json yarn.lock* ./
COPY packages/ ./packages/
COPY apps/identity-service/ ./apps/identity-service/

RUN yarn install --frozen-lockfile --network-concurrency 2
RUN yarn workspace @hr-ai/prisma:generate
RUN yarn workspace @hr-ai/identity-service build

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
