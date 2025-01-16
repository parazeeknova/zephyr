FROM node:latest AS base

ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1

ARG UNSEND_API_KEY
ARG NEXT_PUBLIC_STREAM_KEY
ARG STREAM_SECRET

ENV UNSEND_API_KEY=$UNSEND_API_KEY
ENV NEXT_PUBLIC_STREAM_KEY=$NEXT_PUBLIC_STREAM_KEY
ENV STREAM_SECRET=$STREAM_SECRET

FROM base AS builder
RUN apt-get update && apt-get install -y git
WORKDIR /app

RUN npm install -g pnpm@latest turbo@latest && \
  pnpm config set enable-pre-post-scripts true && \
  turbo telemetry disable

COPY . .
RUN turbo prune --scope=@zephyr/web --docker

FROM base AS installer
RUN apt-get update && apt-get install -y

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

RUN npm install -g pnpm@latest turbo@latest && \
  pnpm config set enable-pre-post-scripts true && \
  turbo telemetry disable && \
  pnpm install --frozen-lockfile --ignore-scripts

RUN cd packages/db && pnpm dlx prisma generate

COPY --from=builder /app/out/full/ .

RUN if [ -n "$NEXT_PUBLIC_STREAM_KEY" ]; then \
  echo "Building with Stream key configured"; \
  else \
  echo "Building without Stream key"; \
  fi

RUN NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1 pnpm exec turbo build --filter=@zephyr/web... --force

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
ENV UNSEND_API_KEY=$UNSEND_API_KEY
ENV NEXT_PUBLIC_STREAM_KEY=$NEXT_PUBLIC_STREAM_KEY
ENV STREAM_SECRET=$STREAM_SECRET

USER nextjs

CMD ["node", "apps/web/server.js"]
