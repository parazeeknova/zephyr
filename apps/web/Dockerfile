FROM node:20-alpine AS base

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat git curl postgresql-client
WORKDIR /app
RUN npm install -g pnpm@latest turbo@latest

COPY . .

RUN turbo prune --scope=@zephyr/web --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat curl postgresql-client
RUN npm install -g pnpm@latest

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_TYPE_CHECK=1
ENV HUSKY=0
ENV CI=1

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
RUN cd packages/db && pnpm dlx prisma generate

RUN pnpm turbo build --filter=@zephyr/web... --force

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/packages/db/prisma && \
  chown -R nextjs:nodejs /app

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/packages/db/prisma ./packages/db/prisma

ENV PATH="/app/node_modules/.bin:${PATH}"

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
