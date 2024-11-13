#!/bin/sh

echo "🚀 Setting up MinIO buckets..."

until docker exec zephyr-minio-dev mc alias set local http://localhost:9000 minioadmin minioadmin; do
    echo "⏳ Waiting for MinIO to be ready..."
    sleep 5
done

for bucket in "uploads" "temp" "backups"; do
    echo "📦 Creating bucket: $bucket"
    docker exec zephyr-minio-dev mc mb --ignore-existing "local/$bucket"
    docker exec zephyr-minio-dev mc policy set public "local/$bucket"
    docker exec zephyr-minio-dev mc version enable "local/$bucket"
    echo "✅ Bucket '$bucket' configured"
done

docker exec zephyr-minio-dev mc retention set --default compliance 7d local/backups

echo "✅ MinIO initialization completed"
