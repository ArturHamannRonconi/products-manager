#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Products Manager — Starting up...   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Check .env exists
if [ ! -f ".env" ]; then
  echo -e "${RED}Error: .env file not found. Create it based on the README before starting.${NC}"
  exit 1
fi

echo -e "${YELLOW}Building images and starting services...${NC}"
echo ""

docker compose up --build -d "$@"
