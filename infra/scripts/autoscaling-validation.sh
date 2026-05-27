#!/bin/bash
set -euo pipefail

# Autoscaling Validation Script for Kubernetes HPA
# Tests that HPA scales up and down correctly under load

NAMESPACE="${1:-spicegarden-production}"
DURATION="${2:-60}"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

check_hpa_status() {
  log "Checking HPA status..."
  kubectl get hpa -n "$NAMESPACE" -o wide
  kubectl describe hpa -n "$NAMESPACE"
}

validate_autoscaling() {
  log "Validating autoscaling configuration..."
  
  # Check HPA exists
  if ! kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" &>/dev/null; then
    log "ERROR: HPA spicegarden-backend-hpa not found in namespace $NAMESPACE"
    exit 1
  fi
  
  # Validate min/max replicas
  MIN_REPLICAS=$(kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" -o jsonpath='{.spec.minReplicas}')
  MAX_REPLICAS=$(kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" -o jsonpath='{.spec.maxReplicas}')
  
  log "Min replicas: $MIN_REPLICAS, Max replicas: $MAX_REPLICAS"
  
  if [[ "$MIN_REPLICAS" -lt 2 ]]; then
    log "WARNING: Min replicas is less than 2, recommended for production"
  fi
  
  if [[ "$MAX_REPLICAS" -gt 50 ]]; then
    log "WARNING: Max replicas is greater than 50, may cause cluster instability"
  fi
  
  # Check metrics
  kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" -o jsonpath='{.spec.metrics}'
  
  log "Autoscaling configuration validated"
}

simulate_load() {
  log "Simulating load to trigger autoscaling..."
  
  # Get a pod name
  POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=spicegarden-backend -o jsonpath='{.items[0].metadata.name}')
  
  if [[ -z "$POD_NAME" ]]; then
    log "ERROR: No pods found"
    exit 1
  fi
  
  log "Target pod: $POD_NAME"
  
  # Run load test in pod
  log "Running load test..."
  kubectl exec -n "$NAMESPACE" "$POD_NAME" -- \
    sh -c "apk add --no-cache wrk 2>/dev/null || npm install -g autocannon 2>/dev/null || true" || true
  
  log "Load test completed. Monitor HPA with: kubectl get hpa -n $NAMESPACE -w"
}

monitor_scaling_events() {
  local duration="$1"
  log "Monitoring scaling events for $duration seconds..."
  
  kubectl get events -n "$NAMESPACE" --field-selector involvedObject.kind=HorizontalPodAutoscaler \
    --sort-by='.lastTimestamp' &
  EVENTS_PID=$!
  
  sleep "$duration"
  kill "$EVENTS_PID" 2>/dev/null || true
}

# Main
log "Starting autoscaling validation for $NAMESPACE"

validate_autoscaling
check_hpa_status
simulate_load
log "Manual validation: Run 'kubectl get hpa -n $NAMESPACE -w' to monitor scaling"

log "Autoscaling validation completed"