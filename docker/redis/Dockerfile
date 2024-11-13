FROM redis:7-alpine

# Copy custom Redis configuration
COPY docker/redis/redis.conf /usr/local/etc/redis/redis.conf

# Create directory for Redis data
RUN mkdir -p /data && chown redis:redis /data

# Switch to non-root user
USER redis

# Expose Redis port
EXPOSE 6379

# Start Redis with custom config
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
