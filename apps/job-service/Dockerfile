FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml turbo.json package.json ./
COPY packages/ ./packages/
COPY apps/job-service/ ./apps/job-service/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @hr-ai/job-service run build

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/apps/job-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/job-service/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/job-service/prisma ./prisma
USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
