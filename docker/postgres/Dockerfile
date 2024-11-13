FROM postgres:16-alpine

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development PostgreSQL Instance"

RUN apk add --no-cache \
  nodejs \
  npm \
  postgresql-contrib \
  build-base \
  python3 \
  bash \
  musl-locales \
  musl-locales-lang \
  figlet \
  htop \
  vim \
  dos2unix

# Install pnpm and prisma globally
RUN npm install -g pnpm prisma

WORKDIR /app


ENV PNPM_HOME="/app/.pnpm-store" \
  PATH="/app/.pnpm-store:/app/node_modules/.bin:${PATH}" \
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US:en \
  LC_ALL=en_US.UTF-8 \
  POSTGRES_MAX_CONNECTIONS=200 \
  POSTGRES_SHARED_BUFFERS=512MB \
  POSTGRES_WORK_MEM=128MB \
  POSTGRES_MAINTENANCE_WORK_MEM=256MB \
  POSTGRES_EFFECTIVE_CACHE_SIZE=2GB \
  DATABASE_URL="postgresql://postgres:postgres@%2Fvar%2Frun%2Fpostgresql/zephyr?schema=public" \
  POSTGRES_PRISMA_URL="postgresql://postgres:postgres@%2Fvar%2Frun%2Fpostgresql/zephyr?schema=public" \
  POSTGRES_URL_NON_POOLING="postgresql://postgres:postgres@%2Fvar%2Frun%2Fpostgresql/zephyr?schema=public"

# Copy configuration files
COPY docker/banner.txt /etc/banner.txt
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf

# Copy only required packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config ./packages/config
COPY packages/db ./packages/db

# Setup init script
COPY docker/postgres/init-db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh && \
  dos2unix /docker-entrypoint-initdb.d/init-db.sh

# Setup directories and permissions
RUN mkdir -p /var/run/postgresql /app/.pnpm-store && \
  chown -R postgres:postgres /app /var/run/postgresql && \
  chmod 2777 /var/run/postgresql

# Switch to postgres user and install dependencies
USER postgres
RUN pnpm install --frozen-lockfile && \
  cd /app/packages/db && \
  pnpm install prisma --save-dev && \
  pnpm prisma generate

# Verify Prisma installation and paths
RUN which prisma || echo "Prisma not found in PATH" && \
  ls -la /app/packages/db/node_modules/.bin/prisma || echo "Prisma not found in local node_modules" && \
  echo "PATH=$PATH"

# Setup banner
RUN echo "cat /etc/banner.txt" >> ~/.bashrc

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
