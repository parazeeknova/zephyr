FROM minio/minio:latest

# Expose MinIO API and Console ports
EXPOSE 9000 9001

# Create a directory for the initialization script
WORKDIR /opt/bin

# Copy and set up initialization script
COPY --chown=minio:minio docker/minio/init.sh ./
RUN chmod +x ./init.sh

# Start MinIO
ENTRYPOINT ["/usr/bin/docker-entrypoint.sh"]
CMD ["minio", "server", "/data", "--console-address", ":9001"]
