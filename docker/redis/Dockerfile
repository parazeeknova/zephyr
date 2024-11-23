FROM redis:7-alpine

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development Redis Instance"

RUN apk add --no-cache \
  bash \
  && mkdir -p /data \
  && chown redis:redis /data

COPY docker/banner.txt /etc/banner.txt
COPY docker/redis/redis.conf /usr/local/etc/redis/redis.conf

RUN echo "cat /etc/banner.txt" >> /etc/profile && \
  chown redis:redis /etc/banner.txt

USER redis

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
