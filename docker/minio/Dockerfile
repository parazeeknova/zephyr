FROM minio/minio:latest

LABEL maintainer="Parazeeknova" 
LABEL description="Zephyr Development MinIO Instance"

EXPOSE 9000 9001

ENV MINIO_ROOT_USER=minioadmin \
  MINIO_ROOT_PASSWORD=minioadmin

VOLUME ["/data"]

ENTRYPOINT ["minio"]
CMD ["server", "--console-address", ":9001", "/data"]
