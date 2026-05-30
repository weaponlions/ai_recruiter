# ---- Builder Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g yarn --prefer-offline

# Copy workspace manifests
COPY turbo.json package.json yarn.lock* ./

# Copy shared packages
COPY packages/ ./packages/

# Copy the service source
COPY apps/api-gateway/ ./apps/api-gateway/

# Install all dependencies
RUN yarn install --frozen-lockfile --network-concurrency 2

# Build the service
RUN yarn workspace @hr-ai/api-gateway build

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
