#!/bin/sh

cat /banner.txt

echo "🚀 Initializing Zephyr MinIO Development Instance..."

minio server --console-address ":9001" --address ":9000" /data &
SERVER_PID=$!

echo "⏳ Waiting for MinIO to be ready..."
until curl -sf http://localhost:9000/minio/health/live; do
    sleep 2
    echo "Still waiting for MinIO..."
done
echo "✅ MinIO server is ready"
echo "🔧 Setting up MinIO client..."
mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

setup_bucket() {
    local bucket_name=$1
    echo "📦 Creating bucket: $bucket_name"
    mc mb --ignore-existing "local/$bucket_name"
    mc policy set public "local/$bucket_name"
    mc version enable "local/$bucket_name"
    echo "✅ Bucket '$bucket_name' configured"
}

setup_bucket "uploads"
setup_bucket "temp"
setup_bucket "backups"

mc retention set --default compliance 7d local/backups

echo "✅ MinIO initialization completed"

wait $SERVER_PID
