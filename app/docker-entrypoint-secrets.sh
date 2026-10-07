#!/bin/sh
# ==============================================================================
# AWS Secrets Manager initialization script for EchoWatt (Nginx)
# Secret Name: usecase-echowatt
# ==============================================================================

SECRET_NAME="${AWS_SECRET_NAME:-usecase-echowatt}"
REGION="${AWS_REGION:-us-east-1}"
TARGET_DIR="/usr/share/nginx/html/echowatt"
TARGET_FILE="${TARGET_DIR}/secrets.json"

mkdir -p "$TARGET_DIR"

echo "[EchoWatt] Querying AWS Secrets Manager for '${SECRET_NAME}' in '${REGION}'..."

if command -v aws >/dev/null 2>&1; then
  SECRET_PAYLOAD=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --region "$REGION" --query 'SecretString' --output text 2>/dev/null)
  if [ -n "$SECRET_PAYLOAD" ] && [ "$SECRET_PAYLOAD" != "None" ]; then
    echo "$SECRET_PAYLOAD" > "$TARGET_FILE"
    echo "[EchoWatt] Successfully loaded secrets from AWS Secrets Manager."
  else
    echo "[EchoWatt] Note: Secret '${SECRET_NAME}' not found or no AWS credentials provided. Using fallback config."
    echo '{"apiUrl":"","apiKey":""}' > "$TARGET_FILE"
  fi
else
  echo '{"apiUrl":"","apiKey":""}' > "$TARGET_FILE"
fi
