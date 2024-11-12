#!/bin/sh

# Wait for MinIO to be ready
until mc ready local; do
    echo 'Waiting for MinIO to be ready...'
    sleep 1
done

# Configure MinIO client
mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Create default bucket if it doesn't exist
mc mb --ignore-existing local/uploads

# Set bucket policy to allow public read access
mc policy set public local/uploads

echo "MinIO initialization completed"
