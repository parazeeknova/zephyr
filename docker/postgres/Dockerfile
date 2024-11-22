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

RUN npm install -g pnpm prisma

WORKDIR /app

COPY docker/banner.txt /etc/banner.txt
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf
COPY docker/postgres/init.sh /docker-entrypoint-initdb.d/init.sh

RUN mkdir -p /app/scripts /var/run/postgresql /app/.pnpm-store /app/packages/db/node_modules && \
  chmod +x /docker-entrypoint-initdb.d/init.sh && \
  dos2unix /docker-entrypoint-initdb.d/init.sh && \
  chown -R postgres:postgres /app /var/run/postgresql /etc/banner.txt && \
  chmod 2777 /var/run/postgresql

COPY --chown=postgres:postgres package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=postgres:postgres packages/config ./packages/config
COPY --chown=postgres:postgres packages/db ./packages/db

USER postgres

RUN cd /app && \
  pnpm install --frozen-lockfile && \
  cd packages/db && \
  pnpm prisma generate && \
  echo "cat /etc/banner.txt" >> ~/.bashrc

RUN rm -rf /app/.pnpm-store

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
