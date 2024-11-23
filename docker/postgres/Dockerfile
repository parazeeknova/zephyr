FROM postgres:16-alpine

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development PostgreSQL Instance"

RUN apk add --no-cache \
  postgresql-contrib \
  bash \
  musl-locales \
  musl-locales-lang \
  dos2unix

WORKDIR /app

COPY --chmod=755 docker/postgres/init.sh /docker-entrypoint-initdb.d/
COPY docker/banner.txt /etc/banner.txt
COPY docker/postgres/postgresql.conf /etc/postgresql/postgresql.conf
COPY docker/postgres/pg_hba.conf /etc/postgresql/pg_hba.conf

RUN mkdir -p /var/run/postgresql && \
  chown -R postgres:postgres /app /var/run/postgresql /etc/banner.txt && \
  chmod 2777 /var/run/postgresql && \
  dos2unix /docker-entrypoint-initdb.d/init.sh

USER postgres

RUN echo "cat /etc/banner.txt" >> ~/.bashrc

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
