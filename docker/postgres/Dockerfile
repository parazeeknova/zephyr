FROM postgres:16-alpine

# Install necessary packages
RUN apk add --no-cache \
  nodejs \
  npm \
  postgresql-contrib \
  build-base \
  python3

# Create app directory and set permissions
WORKDIR /app

# Set npm to use different directory for global packages
ENV NPM_CONFIG_PREFIX=/app/.npm-global
ENV PATH="/app/.npm-global/bin:${PATH}"

# Copy configuration files
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf
COPY packages/db /app/packages/db/

# Install prisma CLI and dependencies
RUN npm install -g prisma
RUN cd /app/packages/db && npm install

# Create and set permissions for init script
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
