#!/bin/bash

set -e

echo "🗑️  TUM Study Planner Infrastructure Destruction"
echo "=============================================="

# Load existing session if available
AWS_SESSION_FILE="$HOME/.aws-academy-session"
if [[ -f "$AWS_SESSION_FILE" ]]; then
    echo "📋 Loading existing AWS Academy session..."
    source "$AWS_SESSION_FILE"
fi

# Confirmation prompt to prevent accidental destruction
read -p "⚠️  Are you sure you want to destroy the infrastructure? This action cannot be undone. (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Destruction cancelled."
    exit 0
fi

# Get current instance IP from Terraform if available
cd terraform
if terraform show -json | grep -q "public_ip"; then
    INSTANCE_IP=$(terraform output -raw public_ip 2>/dev/null || echo "")
    echo "🔍 Found existing instance IP: $INSTANCE_IP"
else
    echo "ℹ️  No active Terraform state found"
fi

# Step 1: Stop application services (if instance is reachable)
if [[ -n "$INSTANCE_IP" ]] && [[ -f "../ansible/inventory.yml" ]] && [[ -n "$AWS_KEY_PATH" ]]; then
    echo "🛑 Attempting to stop application services..."
    cd ../ansible
    
    # Try to stop services gracefully, but don't fail if instance is unreachable
    if ansible-playbook -i inventory.yml destroy-services.yml \
        -e "instance_ip=$INSTANCE_IP" \
        -e "ansible_ssh_private_key_file=$AWS_KEY_PATH" \
        -e "target_state=stopped" 2>/dev/null; then
        echo "✅ Application services stopped successfully"
    else
        echo "⚠️  Could not connect to instance to stop services (instance may already be terminated)"
    fi
    cd ../terraform
else
    echo "ℹ️  Skipping service shutdown (no IP, inventory, or key found)"
fi

# Step 2: Destroy Terraform infrastructure
echo "🏗️  Destroying EC2 instance and related resources with Terraform..."

# Get the key name from terraform.tfvars if it exists
if [[ -f "terraform.tfvars" ]]; then
    KEY_NAME=$(grep "key_pair_name" terraform.tfvars | cut -d'"' -f2)
    echo "🔍 Found key name in terraform.tfvars: $KEY_NAME"
fi

# If we don't have the key name from session, try to get it from tfvars
if [[ -z "$AWS_KEY_NAME" ]] && [[ -n "$KEY_NAME" ]]; then
    AWS_KEY_NAME="$KEY_NAME"
fi

# Show what will be destroyed (with key name if available)
if [[ -n "$AWS_KEY_NAME" ]]; then
    terraform plan -destroy \
        -var="aws_key_name=$AWS_KEY_NAME"
else
    echo "⚠️  Key name not found, running without variable (you may need to enter it manually)"
    terraform plan -destroy
fi

# Ask for confirmation before destroying
read -p "🤔 Do you want to proceed with destroying these resources? (yes/no): " terraform_confirm

if [ "$terraform_confirm" = "yes" ]; then
    echo "🚀 Proceeding with infrastructure destruction..."
    if [[ -n "$AWS_KEY_NAME" ]]; then
        terraform destroy -auto-approve \
            -var="aws_key_name=$AWS_KEY_NAME"
    else
        terraform destroy -auto-approve
    fi
    echo "✅ Infrastructure destroyed successfully!"
else
    echo "❌ Terraform destruction cancelled."
    exit 0
fi

# Step 3: Clean up AWS key pair
if [[ -n "$AWS_KEY_NAME" ]]; then
    echo "🔑 Cleaning up AWS key pair..."
    if aws ec2 delete-key-pair --key-name "$AWS_KEY_NAME" 2>/dev/null; then
        echo "✅ Key pair '$AWS_KEY_NAME' deleted from AWS"
    else
        echo "⚠️  Could not delete key pair from AWS (may not exist)"
    fi
    
    # Remove local key file
    if [[ -f "$AWS_KEY_PATH" ]]; then
        rm -f "$AWS_KEY_PATH"
        echo "✅ Local key file removed: $AWS_KEY_PATH"
    fi
fi

# Step 4: Clean up local files
echo "🧹 Cleaning up local temporary files..."
cd ../ansible
rm -f inventory/hosts.tmp inventory/hosts

# Clean up AWS session file
if [[ -f "$AWS_SESSION_FILE" ]]; then
    rm -f "$AWS_SESSION_FILE"
    echo "✅ AWS session file cleaned up"
fi

echo ""
echo "🎉 Destruction process completed!"
echo "✅ All AWS resources have been destroyed"
echo "✅ Local temporary files cleaned up"
echo "✅ AWS credentials and keys cleaned up"