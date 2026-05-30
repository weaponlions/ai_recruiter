# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g yarn --prefer-offline

COPY turbo.json package.json yarn.lock* ./
COPY packages/ ./packages/
COPY apps/communication-service/ ./apps/communication-service/

RUN yarn install --frozen-lockfile --network-concurrency 2
RUN yarn workspace @hr-ai/db:generate
RUN yarn workspace @hr-ai/communication-service build

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
