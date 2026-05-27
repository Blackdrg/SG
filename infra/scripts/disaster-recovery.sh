#!/bin/bash
set -euo pipefail

# Disaster Recovery Script for SpiceGarden
# Usage: ./infra/scripts/disaster-recovery.sh [--production|--staging] [--backup-date YYYYMMDD_HHMMSS]

ENVIRONMENT="${1:---production}"
BACKUP_DATE="${2:-}"
BACKUP_DIR="${BACKUP_DIR:-/backup}"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

check_prerequisites() {
  log "Checking prerequisites..."
  for cmd in kubectl helm aws; do
    if ! command -v "$cmd" &> /dev/null; then
      log "ERROR: $cmd is not installed"
      exit 1
    fi
  done
}

get_latest_backup() {
  log "Finding latest backup in S3..."
  aws s3 ls s3://spicegarden-backups-prod/ | sort -r | head -n 1 | awk '{print $4}'
}

restore_from_backup() {
  local backup_file="$1"
  local namespace="${ENVIRONMENT#--}"
  
  log "Restoring from backup: $backup_file"
  
  # Create namespace if not exists
  kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -
  
  # Restore secrets
  log "Restoring secrets..."
  kubectl apply -f infra/k8s/secrets.yaml -n "$namespace" --validate=false || true
  
  # Download backup
  log "Downloading backup from S3..."
  aws s3 cp "s3://spicegarden-backups-prod/$backup_file" "/tmp/$backup_file"
  
  # Extract backup
  tar -xzf "/tmp/$backup_file" -C /tmp
  
  # Restore PostgreSQL
  log "Restoring PostgreSQL..."
  kubectl run restore-postgres --image=postgres:16-alpine \
    --env="PGPASSWORD=$POSTGRES_PASSWORD" \
    -n "$namespace" --restart=Never --command -- \
    sh -c "psql -U spicegarden -d spicegarden -h postgres < /tmp/postgres.sql"
  
  # Restore MongoDB
  log "Restoring MongoDB..."
  kubectl run restore-mongo --image=mongo:7 \
    -n "$namespace" --restart=Never --command -- \
    sh -c "mongorestore --host mongodb -d spicegarden --drop /tmp/mongo"
  
  # Restore Redis
  log "Restoring Redis..."
  kubectl run restore-redis --image=redis:7-alpine \
    -n "$namespace" --restart=Never --command -- \
    sh -c "cp /tmp/redis.rdb /data/dump.rdb && redis-cli -h redis SHUTDOWN NOSAVE"
  
  log "Restore completed successfully"
}

validate_restored_data() {
  local namespace="${ENVIRONMENT#--}"
  log "Validating restored data..."
  
  # Wait for pods
  kubectl wait --for=condition=available --timeout=120s deployment/spicegarden-backend -n "$namespace"
  
  # Health check
  log "Running health check on restored backend..."
  kubectl get pods -n "$namespace" -l app=spicegarden-backend -o jsonpath='{.items[0].metadata.name}' | \
    xargs -I {} kubectl exec -n "$namespace" {} -- curl -f http://localhost:3001/health
  
  log "Validation completed"
}

# Main
check_prerequisites

if [[ "$ENVIRONMENT" == "--production" ]]; then
  NAMESPACE="spicegarden-production"
elif [[ "$ENVIRONMENT" == "--staging" ]]; then
  NAMESPACE="spicegarden-staging"
else
  log "ERROR: Unknown environment $ENVIRONMENT"
  exit 1
fi

BACKUP_FILE="${BACKUP_DATE:-$(get_latest_backup)}"
restore_from_backup "$BACKUP_FILE"
validate_restored_data

log "Disaster recovery completed for $NAMESPACE"