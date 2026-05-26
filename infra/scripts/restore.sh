#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backup}"
BACKUP_FILE="$1"

if [[ -z "${BACKUP_FILE}" ]]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

TEMP_DIR=$(mktemp -d)
echo "Extracting backup to ${TEMP_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"

# Get the backup name without extension
BACKUP_NAME=$(basename "${BACKUP_FILE}" .tar.gz)

# Restore PostgreSQL
echo "Restoring PostgreSQL..."
docker exec -i postgres psql -U spicegarden spicegarden < "${TEMP_DIR}/${BACKUP_NAME}_postgres.sql"

# Restore MongoDB
echo "Restoring MongoDB..."
docker cp "${TEMP_DIR}/${BACKUP_NAME}_mongo" mongo:/data/db/restore
docker exec mongo mongorestore --db spicegarden --drop /data/db/restore/${BACKUP_NAME##*_}

# Restore Redis
echo "Restoring Redis..."
docker cp "${TEMP_DIR}/${BACKUP_NAME}_redis.rdb" redis:/data/dump.rdb.restore
docker exec redis cp /data/dump.rdb.restore /data/dump.rdb
docker exec redis redis-cli SHUTDOWN NOSAVE || true
docker restart redis

rm -rf "${TEMP_DIR}"
echo "Restore completed successfully"