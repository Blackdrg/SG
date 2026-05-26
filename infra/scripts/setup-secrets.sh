#!/bin/bash
set -euo pipefail

SECRET_DIR="./secrets"
mkdir -p "${SECRET_DIR}"

generate_secret() {
  openssl rand -base64 32
}

echo "Generating secrets..."

# Database password
if [[ ! -f "${SECRET_DIR}/db_password.txt" ]]; then
  generate_secret > "${SECRET_DIR}/db_password.txt"
  echo "Created db_password.txt"
else
  echo "db_password.txt already exists"
fi

# JWT secret
if [[ ! -f "${SECRET_DIR}/jwt_secret.txt" ]]; then
  generate_secret > "${SECRET_DIR}/jwt_secret.txt"
  echo "Created jwt_secret.txt"
else
  echo "jwt_secret.txt already exists"
fi

# Stripe secret
if [[ ! -f "${SECRET_DIR}/stripe_secret.txt" ]]; then
  echo "Enter Stripe secret key: "
  read -r stripe_key
  echo "${stripe_key}" > "${SECRET_DIR}/stripe_secret.txt"
else
  echo "stripe_secret.txt already exists"
fi

# Grafana admin password
if [[ ! -f "${SECRET_DIR}/grafana_admin_password.txt" ]]; then
  generate_secret > "${SECRET_DIR}/grafana_admin_password.txt"
  echo "Created grafana_admin_password.txt"
else
  echo "grafana_admin_password.txt already exists"
fi

# OpenSearch admin password
if [[ ! -f "${SECRET_DIR}/opensearch_admin_password.txt" ]]; then
  generate_secret > "${SECRET_DIR}/opensearch_admin_password.txt"
  echo "Created opensearch_admin_password.txt"
else
  echo "opensearch_admin_password.txt already exists"
fi

# Sentry secrets
if [[ ! -f "${SECRET_DIR}/sentry_secret_key.txt" ]]; then
  generate_secret > "${SECRET_DIR}/sentry_secret_key.txt"
  echo "Created sentry_secret_key.txt"
else
  echo "sentry_secret_key.txt already exists"
fi

if [[ ! -f "${SECRET_DIR}/sentry_system_secret.txt" ]]; then
  generate_secret > "${SECRET_DIR}/sentry_system_secret.txt"
  echo "Created sentry_system_secret.txt"
else
  echo "sentry_system_secret.txt already exists"
fi

if [[ ! -f "${SECRET_DIR}/sentry_db_password.txt" ]]; then
  generate_secret > "${SECRET_DIR}/sentry_db_password.txt"
  echo "Created sentry_db_password.txt"
else
  echo "sentry_db_password.txt already exists"
fi

echo "Secrets generated successfully!"
echo "IMPORTANT: Add secrets to .gitignore if not already there"
echo "IMPORTANT: Never commit these files to version control"