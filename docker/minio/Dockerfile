FROM minio/minio:latest

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development MinIO Instance"

COPY docker/banner.txt /banner.txt
COPY docker/minio/init.sh /init.sh

RUN chmod +x /init.sh

EXPOSE 9000 9001

ENV MINIO_ROOT_USER=minioadmin \
  MINIO_ROOT_PASSWORD=minioadmin

ENTRYPOINT ["minio"]
CMD ["server", "--console-address", ":9001", "/data"]
