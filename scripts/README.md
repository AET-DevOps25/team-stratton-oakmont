# Deployment Scripts

This directory contains automation scripts for deploying the TUM Study Planner application.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform installed
3. Ansible installed
4. An AWS key pair created

## Environment Variables

Set these environment variables before running the scripts:

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_SESSION_TOKEN="your-session-token"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_KEY_PAIR_NAME="your-key-pair-name" # it is vockey in our case
export SSH_KEY_PATH="/path/to/your/private/key.pem"
```

Test your credentials:

```bash
aws sts get-caller-identity
```

## Usage

### Deploy the application:

```bash
# Make script executable (first time only)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Destroy the infrastructure:

```bash
# Make script executable (first time only)
chmod +x scripts/destroy.sh

# Clean up AWS resources
./scripts/destroy.sh
```

## What the deployment does:

1. Creates EC2 instance with security groups
2. Installs Docker on the instance
3. Clones the application repository
4. Builds and starts all services using Docker Compose

## Accessing the application:

After deployment, the script will output the URLs for:

- Frontend: `http://[INSTANCE_IP]:5173`
- Program Catalog Service: `http://[INSTANCE_IP]:8080`
- Study Plan Service: `http://[INSTANCE_IP]:8081`
