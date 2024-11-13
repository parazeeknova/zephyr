FROM postgres:16-alpine

# Install necessary packages including locale support
RUN apk add --no-cache \
  nodejs \
  npm \
  postgresql-contrib \
  build-base \
  python3 \
  bash \
  musl-locales \
  musl-locales-lang

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory and set permissions
WORKDIR /app

# Set pnpm to use different directory for global packages
ENV PNPM_HOME="/app/.pnpm-store"
ENV PATH="/app/.pnpm-store:${PATH}"

# Set locale environment variables
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Copy configuration files
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf

# Copy package files for installation
COPY package.json pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install prisma CLI
RUN pnpm install -g prisma

# Copy and set up init script
COPY docker/postgres/init-db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh && \
  chown -R postgres:postgres /app && \
  chown postgres:postgres /docker-entrypoint-initdb.d/init-db.sh && \
  mkdir -p /var/run/postgresql && \
  chown postgres:postgres /var/run/postgresql && \
  chmod 2777 /var/run/postgresql

USER postgres

# Set default command
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
