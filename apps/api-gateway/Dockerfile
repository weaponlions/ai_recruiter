# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests
COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml* ./

# Copy shared packages
COPY packages/ ./packages/

# Copy the service source
COPY apps/api-gateway/ ./apps/api-gateway/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the service
RUN pnpm --filter @hr-ai/api-gateway run build

# ---- Production Stage ----
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Copy built artifacts and runtime deps from builder
COPY --from=builder --chown=nestjs:nodejs /app/apps/api-gateway/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api-gateway/node_modules ./node_modules

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
