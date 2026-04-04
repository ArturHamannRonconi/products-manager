#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}========================================${NC}"
echo -e "${RED}   Products Manager — Destroying...    ${NC}"
echo -e "${RED}========================================${NC}"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

echo -e "${YELLOW}Stopping and removing containers, networks, and volumes...${NC}"
docker compose down --volumes --remove-orphans
echo -e "${GREEN}Containers, networks, and volumes removed.${NC}"
echo ""

echo -e "${YELLOW}Removing project images...${NC}"
PROJECT_DIR=$(basename "$PROJECT_ROOT")
IMAGES=$(docker images --filter "reference=${PROJECT_DIR}-*" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null)

if [ -n "$IMAGES" ]; then
  echo "$IMAGES" | xargs docker rmi -f
  echo -e "${GREEN}Images removed: ${IMAGES}${NC}"
else
  echo -e "${CYAN}No project images found to remove.${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Done. Everything has been cleaned.  ${NC}"
echo -e "${GREEN}========================================${NC}"
