#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="spicegarden_backup_${TIMESTAMP}"

mkdir -p "${BACKUP_DIR}"

echo "Starting backup: ${BACKUP_NAME}"

# PostgreSQL Backup
echo "Backing up PostgreSQL..."
docker exec postgres pg_dump -U spicegarden spicegarden > "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"

# MongoDB Backup
echo "Backing up MongoDB..."
docker exec mongo mongodump --db spicegarden --out /data/db/backup_${TIMESTAMP}
docker cp mongo:/data/db/backup_${TIMESTAMP} "${BACKUP_DIR}/${BACKUP_NAME}_mongo"

# Redis Backup
echo "Backing up Redis..."
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"

# Compress all backups
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  -C "${BACKUP_DIR}" "${BACKUP_NAME}_postgres.sql" "${BACKUP_NAME}_mongo" "${BACKUP_NAME}_redis.rdb"

# Cleanup uncompressed files
rm "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}_mongo" "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Cleanup old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "spicegarden_backup_*.tar.gz" -mtime +7 -delete