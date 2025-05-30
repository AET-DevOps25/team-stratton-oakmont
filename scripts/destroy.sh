#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🗑️  Destroying infrastructure...${NC}"

cd terraform

terraform destroy -var="key_pair_name=${AWS_KEY_PAIR_NAME:-default}" -auto-approve

echo -e "${GREEN}✅ Infrastructure destroyed successfully${NC}"