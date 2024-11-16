#!/bin/bash
set -e

BACKUP_DIR="/backups"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/postgres_backup_${DATE}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "📦 Starting PostgreSQL backup..."
pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} | gzip > ${BACKUP_FILE}

echo "🧹 Cleaning up old backups..."
find ${BACKUP_DIR} -type f -name "postgres_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

if [ ! -z "${MINIO_ENDPOINT}" ]; then
    echo "☁️ Uploading backup to MinIO..."
    mc config host add myminio ${MINIO_ENDPOINT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
    mc cp ${BACKUP_FILE} myminio/backups/
fi

echo "✅ Backup completed successfully: ${BACKUP_FILE}"
