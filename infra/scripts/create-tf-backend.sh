#!/usr/bin/env bash
set -euo pipefail

PROFILE="artur-products-manager"
PROJECT_NAME="products-manager"
REGION="us-east-1"

echo "Obtendo Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile "$PROFILE")

STATE_BUCKET="${PROJECT_NAME}-tf-state-${ACCOUNT_ID}"
LOCK_TABLE="${PROJECT_NAME}-tf-lock"

echo ""
echo "Bucket:   $STATE_BUCKET"
echo "Tabela:   $LOCK_TABLE"
echo "Region:   $REGION"
echo ""

# 1. Criar bucket S3
echo "[1/5] Criando bucket S3..."
aws s3api create-bucket \
  --bucket "$STATE_BUCKET" \
  --profile "$PROFILE" \
  --region "$REGION"

# 2. Habilitar versionamento
echo "[2/5] Habilitando versionamento..."
aws s3api put-bucket-versioning \
  --bucket "$STATE_BUCKET" \
  --profile "$PROFILE" \
  --versioning-configuration Status=Enabled

# 3. Bloquear acesso publico
echo "[3/5] Bloqueando acesso publico..."
aws s3api put-public-access-block \
  --bucket "$STATE_BUCKET" \
  --profile "$PROFILE" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 4. Habilitar encryption (SSE-KMS)
echo "[4/5] Habilitando encryption..."
aws s3api put-bucket-encryption \
  --bucket "$STATE_BUCKET" \
  --profile "$PROFILE" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}' 

# 5. Criar tabela DynamoDB para lock
echo "[5/5] Criando tabela DynamoDB..."
aws dynamodb create-table \
  --table-name "$LOCK_TABLE" \
  --profile "$PROFILE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  > /dev/null

echo ""
echo "========================================="
echo "Backend criado com sucesso!"
echo ""
echo "STATE_BUCKET=$STATE_BUCKET"
echo "LOCK_TABLE=$LOCK_TABLE"
echo ""
echo "Inicialize o Terraform com:"
echo ""
echo "  cd infra"
echo "  terraform init \\"
echo "    -backend-config=\"bucket=$STATE_BUCKET\" \\"
echo "    -backend-config=\"dynamodb_table=$LOCK_TABLE\""
echo "========================================="
