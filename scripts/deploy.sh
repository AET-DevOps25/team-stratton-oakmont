#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting deployment of TUM Study Planner${NC}"

# Check AWS credentials (including session token)
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: AWS credentials not configured or invalid${NC}"
    echo -e "${YELLOW}For temporary credentials, set these environment variables:${NC}"
    echo -e "${YELLOW}  export AWS_ACCESS_KEY_ID=\"your-key\"${NC}"
    echo -e "${YELLOW}  export AWS_SECRET_ACCESS_KEY=\"your-secret\"${NC}"
    echo -e "${YELLOW}  export AWS_SESSION_TOKEN=\"your-session-token\"${NC}"
    exit 1
fi

# Show current AWS identity
aws sts get-caller-identity
echo -e "${GREEN}✅ AWS credentials valid${NC}"

# Check if required variables are set
if [ -z "$AWS_KEY_PAIR_NAME" ]; then
    echo -e "${RED}❌ Error: AWS_KEY_PAIR_NAME environment variable is required${NC}"
    exit 1
fi

if [ -z "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ Error: SSH_KEY_PATH environment variable is required${NC}"
    exit 1
fi

# Navigate to terraform directory
cd terraform

echo -e "${YELLOW}📦 Initializing Terraform...${NC}"
terraform init

echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan -var="key_pair_name=$AWS_KEY_PAIR_NAME"

echo -e "${YELLOW}🏗️  Applying Terraform configuration...${NC}"
terraform apply -var="key_pair_name=$AWS_KEY_PAIR_NAME" -auto-approve

# Get outputs
INSTANCE_IP=$(terraform output -raw instance_public_ip)
echo -e "${GREEN}✅ EC2 instance created with IP: $INSTANCE_IP${NC}"

# Wait for instance to be ready
echo -e "${YELLOW}⏳ Waiting for instance to be ready...${NC}"
sleep 60

# Navigate to ansible directory
cd ../ansible

# Create dynamic inventory
cat > inventory.yml << EOF
all:
  hosts:
    app_server:
      ansible_host: $INSTANCE_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: $SSH_KEY_PATH
      ansible_ssh_common_args: '-o StrictHostKeyChecking=no'
EOF

echo -e "${YELLOW}🔧 Running Ansible deployment...${NC}"
ansible-playbook -i inventory.yml deploy.yml

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}Frontend URL: http://$INSTANCE_IP${NC}"
echo -e "${GREEN}Program Catalog Service: http://$INSTANCE_IP:8080${NC}"
echo -e "${GREEN}Study Plan Service: http://$INSTANCE_IP:8081${NC}"