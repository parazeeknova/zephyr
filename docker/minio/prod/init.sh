#!/bin/bash
set -e

MINIO_CLIENT="mc"
RETRY_ATTEMPTS=5
RETRY_INTERVAL=10

wait_for_minio() {
    echo "⏳ Waiting for MinIO to be ready..."
    for i in $(seq 1 $RETRY_ATTEMPTS); do
        if curl -sf "${MINIO_ENDPOINT}/minio/health/live" > /dev/null; then
            echo "✅ MinIO is ready"
            return 0
        fi
        echo "⏳ Attempt $i/$RETRY_ATTEMPTS - Waiting ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    echo "❌ MinIO failed to start"
    return 1
}

setup_bucket() {
    local bucket_name=$1
    local retention_days=$2
    
    echo "🔧 Setting up bucket: $bucket_name"
    
    if ! $MINIO_CLIENT ls myminio/$bucket_name > /dev/null 2>&1; then
        $MINIO_CLIENT mb myminio/$bucket_name
        echo "✅ Created bucket: $bucket_name"
    fi
    
    $MINIO_CLIENT policy set download myminio/$bucket_name
    $MINIO_CLIENT version enable myminio/$bucket_name
    
    if [ ! -z "$retention_days" ]; then
        $MINIO_CLIENT ilm add myminio/$bucket_name \
            --expiry-days $retention_days \
            --transition-days $(($retention_days - 1)) \
            --storage-class REDUCED_REDUNDANCY
    fi
    
    $MINIO_CLIENT encrypt set sse-s3 myminio/$bucket_name
}

echo "🚀 Starting MinIO initialization..."

$MINIO_CLIENT config host add myminio \
    $MINIO_ENDPOINT \
    $MINIO_ROOT_USER \
    $MINIO_ROOT_PASSWORD

wait_for_minio

# Setup buckets with specific configurations
setup_bucket "uploads" ""  # Main uploads bucket
setup_bucket "temp" "1"    # Temporary files with 1-day retention
setup_bucket "backups" "30" # Backups with 30-day retention
$MINIO_CLIENT admin prometheus generate myminio > /tmp/prometheus.yml

if [ ! -z "$SMTP_HOST" ]; then
    $MINIO_CLIENT admin config set myminio notify_smtp \
        enable="on" \
        email="$SMTP_EMAIL" \
        password="$SMTP_PASSWORD" \
        host="$SMTP_HOST" \
        port="$SMTP_PORT"
fi

echo "✅ MinIO initialization completed successfully"
