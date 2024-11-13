FROM redis:7-alpine

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development Redis Instance"

RUN apk add --no-cache \
  figlet \
  bash \
  htop \
  vim

COPY docker/banner.txt /etc/banner.txt
COPY docker/redis/redis.conf /usr/local/etc/redis/redis.conf

RUN mkdir -p /data && \
  chown redis:redis /data

RUN echo "cat /etc/banner.txt" >> /etc/profile

USER redis

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
