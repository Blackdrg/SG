#!/bin/bash
set -euo pipefail

echo "=== SPICEGARDEN INFRA SETUP ==="

# Check for Docker
if ! command -v docker &> /dev/null; then
  echo "Docker not installed. Please install Docker first."
  exit 1
fi

# Generate secrets if not exists
if [[ ! -d "./secrets" ]] || [[ -z "$(ls -A ./secrets 2>/dev/null)" ]]; then
  echo "Generating secrets..."
  bash ./infra/scripts/setup-secrets.sh || true
fi

# Create .env from example
if [[ ! -f ".env" ]]; then
  echo "Creating .env from example..."
  cp .env.example .env
fi

echo ""
echo "=== STARTING INFRASTRUCTURE ==="
docker-compose -f compose.infra.yaml up -d

echo ""
echo "=== WAITING FOR SERVICES ==="
sleep 30

echo ""
echo "=== SERVICE STATUS ==="
docker-compose -f compose.infra.yaml ps

echo ""
echo "=== MONITORING URLs ==="
echo "Prometheus:    http://localhost:9090"
echo "Grafana:       http://localhost:3000"
echo "Alertmanager:  http://localhost:9093"
echo "OpenSearch:    http://localhost:9200"
echo "Sentry:        http://localhost:9000"
echo ""
echo "=== RUN TESTS ==="
echo "node ./infra/scripts/fake-orders.js"
echo "node ./infra/scripts/breaking-point.js"