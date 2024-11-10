# Base image
FROM node:20-alpine AS base

# Builder stage
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat git curl postgresql-client

WORKDIR /app
RUN npm install -g pnpm@latest turbo@latest

# Set consistent pnpm config
RUN pnpm config set public-hoist-pattern="*"

# Copy root package files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy all package.json files maintaining directory structure
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and generate client
COPY packages/db/prisma ./packages/db/prisma
RUN cd packages/db && pnpm dlx prisma generate

# Copy remaining source code
COPY . .

# Build packages in order
RUN pnpm turbo run build --filter=@zephyr/db --force && \
  pnpm turbo run build --filter=@zephyr/auth --force && \
  pnpm turbo run build --filter=@zephyr/ui --force

# Prune for web app
RUN turbo prune --scope=@zephyr/web --docker

# Installer stage
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat curl postgresql-client
RUN npm install -g pnpm@latest

WORKDIR /app

# Set same pnpm config
RUN pnpm config set public-hoist-pattern="*"

# Copy pruned files in correct order
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/out/full/ .

# Install dependencies fresh in installer stage
RUN pnpm install --frozen-lockfile

# Install Next.js explicitly in web app
RUN cd apps/web && pnpm add next@latest --save-exact

# Copy built packages
COPY --from=builder /app/packages ./packages

# Build web app
ENV SKIP_PRISMA_GENERATE=true
RUN pnpm turbo build --filter=@zephyr/web... --force

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories and set permissions
RUN mkdir -p /app/packages/db/prisma && \
  chown -R nextjs:nodejs /app

# Copy necessary files
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/packages/db/prisma ./packages/db/prisma
COPY --from=installer --chown=nextjs:nodejs /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PATH="/app/node_modules/.bin:${PATH}"
ENV SKIP_PRISMA_GENERATE=true

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
