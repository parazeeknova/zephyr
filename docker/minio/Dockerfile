FROM minio/minio:RELEASE.2025-04-22T22-12-26Z

LABEL maintainer="Parazeeknova"
LABEL description="Zephyr Development MinIO Instance"

EXPOSE 9000 9001

ENV MINIO_ROOT_USER=minioadmin \
  MINIO_ROOT_PASSWORD=minioadmin \
  MINIO_BROWSER_REDIRECT_URL=http://localhost:9001

VOLUME ["/data"]

ENTRYPOINT ["minio"]
CMD ["server", "--console-address", ":9001", "--address", ":9000", "/data"]
