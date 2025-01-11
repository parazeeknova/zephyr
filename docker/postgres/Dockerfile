FROM postgres:16-alpine

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development PostgreSQL Instance"

# Install required packages
RUN apk add --no-cache \
  postgresql-contrib \
  bash \
  musl-locales \
  musl-locales-lang

# Create necessary directories
RUN mkdir -p /var/run/postgresql /var/log/postgresql/pg_log && \
  chown -R postgres:postgres /var/run/postgresql /var/log/postgresql && \
  chmod 2777 /var/run/postgresql && \
  chmod 700 /var/log/postgresql/pg_log

# Copy configuration files
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf

# Set proper permissions
RUN chown postgres:postgres /etc/postgresql/postgresql.conf /etc/postgresql/pg_hba.conf && \
  chmod 600 /etc/postgresql/postgresql.conf /etc/postgresql/pg_hba.conf

USER postgres

EXPOSE 5432

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
