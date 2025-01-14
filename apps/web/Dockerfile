FROM node:latest AS base

ARG UNSEND_API_KEY
ARG NEXT_PUBLIC_STREAM_KEY
ARG STREAM_SECRET
ARG NODE_ENV=production
ARG NEXT_PHASE=phase-production-build
ARG NEXT_PUBLIC_SKIP_VALIDATION=true

ENV NODE_ENV=$NODE_ENV
ENV NEXT_PHASE=$NEXT_PHASE
ENV NEXT_PUBLIC_SKIP_VALIDATION=$NEXT_PUBLIC_SKIP_VALIDATION
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp

FROM base AS builder
RUN apt-get update && apt-get install -y git
WORKDIR /app
RUN npm install -g pnpm@latest turbo@latest

ENV UNSEND_API_KEY=$UNSEND_API_KEY
ENV NEXT_PUBLIC_STREAM_KEY=$NEXT_PUBLIC_STREAM_KEY
ENV STREAM_SECRET=$STREAM_SECRET
ENV CI=true

COPY . .
RUN turbo prune --scope=@zephyr/web --docker

FROM base AS installer
RUN apt-get update && apt-get install -y

WORKDIR /app

ENV UNSEND_API_KEY=$UNSEND_API_KEY
ENV NEXT_PUBLIC_STREAM_KEY=$NEXT_PUBLIC_STREAM_KEY
ENV STREAM_SECRET=$STREAM_SECRET
ENV CI=true
ENV SKIP_ENV_VALIDATION=true

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json

COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

RUN npm install -g pnpm@latest turbo@latest && \
  pnpm install --frozen-lockfile --ignore-scripts

RUN cd packages/db && pnpm dlx prisma generate

COPY --from=builder /app/out/full/ .

RUN NEXT_PUBLIC_SKIP_VALIDATION=true \
  SKIP_ENV_VALIDATION=true \
  CI=true \
  pnpm exec turbo build --filter=@zephyr/web... --force

FROM base AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && \
  useradd --system --uid 1001 --gid nodejs nextjs

RUN mkdir -p /app/packages/db/prisma && \
  chown -R nextjs:nodejs /app

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/packages/db/prisma ./packages/db/prisma

ENV PATH="/app/node_modules/.bin:${PATH}"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/tmp/node_modules/sharp
ENV CI=true

ENV UNSEND_API_KEY=$UNSEND_API_KEY
ENV NEXT_PUBLIC_STREAM_KEY=$NEXT_PUBLIC_STREAM_KEY
ENV STREAM_SECRET=$STREAM_SECRET

USER nextjs

CMD ["node", "apps/web/server.js"]
