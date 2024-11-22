#!/bin/sh
set -e

cat /opt/zephyr/banner.txt

echo "🚀 Initializing Zephyr MinIO Development Instance..."

/usr/bin/minio server --console-address ":9001" --address ":9000" /data &
SERVER_PID=$!

echo "⏳ Waiting for MinIO..."
until curl -sf http://localhost:9000/minio/health/live; do
    sleep 2
    echo "Still waiting for MinIO..."
done
echo "✅ MinIO server is ready"

echo "🔧 Setting up MinIO client..."
/usr/bin/mc config host add local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

for bucket in "uploads" "temp" "backups"; do
    echo "📦 Creating bucket: $bucket"
    /usr/bin/mc mb --ignore-existing "local/$bucket" || true
    /usr/bin/mc policy set public "local/$bucket"
    /usr/bin/mc version enable "local/$bucket"
    
    if [ "$bucket" = "backups" ]; then
        /usr/bin/mc retention set --default compliance 7d "local/$bucket"
    fi
    echo "✅ Bucket '$bucket' configured"
done

echo "
🎉 MinIO initialization completed!
====================================
🔗 Console: http://localhost:9001
🔐 Credentials:
   Username: ${MINIO_ROOT_USER}
   Password: ${MINIO_ROOT_PASSWORD}
🪣 Buckets: uploads, temp, backups
"

wait $SERVER_PID
