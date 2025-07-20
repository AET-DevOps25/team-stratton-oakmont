#!/bin/bash

set -e

echo "🚀 TUM Study Planner Deployment Script"
echo "======================================"

# Function to setup AWS Academy credentials
setup_aws_credentials() {
    echo "🎓 Setting up AWS Academy credentials..."
    echo ""
    echo "Please go to AWS Academy → AWS Details → Show and copy the credentials:"
    echo ""
    
    read -p "AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
    read -p "AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY  
    read -p "AWS_SESSION_TOKEN: " AWS_SESSION_TOKEN
    
    # Export immediately
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    export AWS_SESSION_TOKEN
    export AWS_DEFAULT_REGION="us-east-1"
    
    # Test credentials first
    echo "🔍 Testing AWS credentials..."
    if aws sts get-caller-identity > /dev/null 2>&1; then
        echo "✅ AWS credentials are working!"
        echo "   Account: $(aws sts get-caller-identity --query Account --output text)"
        echo "   Region: us-east-1"
    else
        echo "❌ AWS credentials failed. Please check and try again."
        exit 1
    fi
    
    # Create new key pair
    KEY_NAME="academy-session-$(date +%s)"
    echo "🔑 Creating new key pair: $KEY_NAME"
    
    if OUTPUT=$(aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text 2>&1); then
        # Save the key material to file
        echo "$OUTPUT" > ~/.ssh/"$KEY_NAME".pem
        chmod 600 ~/.ssh/"$KEY_NAME".pem
        AWS_KEY_PATH="$HOME/.ssh/$KEY_NAME.pem"
        
        echo "✅ Key saved to: $AWS_KEY_PATH"
        
        # Verify key pair exists in AWS
        echo "⏳ Verifying key pair in AWS..."
        sleep 3
        
        if aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
            echo "✅ Key pair verified in AWS"
        else
            echo "❌ Key pair verification failed"
            exit 1
        fi
    else
        echo "❌ Failed to create key pair: $OUTPUT"
        exit 1
    fi
    
    # Export key variables
    export AWS_KEY_PATH
    export AWS_KEY_NAME="$KEY_NAME"
    
    # Save everything to session file
    cat > "$AWS_SESSION_FILE" << EOF
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
export AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_KEY_PATH="$AWS_KEY_PATH"
export AWS_KEY_NAME="$KEY_NAME"
EOF

    # Update terraform.tfvars
    cat > ../terraform/terraform.tfvars << EOF
aws_key_name = "$KEY_NAME"
EOF
    
    echo "✅ AWS setup complete!"
    echo ""
}

# Main credential and key checking logic
AWS_SESSION_FILE="$HOME/.aws-academy-session"
NEEDS_SETUP=false

echo "🔍 Checking existing credentials and keys..."

# Check if session file exists and load it
if [[ -f "$AWS_SESSION_FILE" ]]; then
    echo "📋 Found existing session file, loading..."
    source "$AWS_SESSION_FILE"
    
    # Export all variables
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    export AWS_SESSION_TOKEN
    export AWS_KEY_PATH
    export AWS_KEY_NAME
    export AWS_DEFAULT_REGION
else
    echo "📋 No existing session file found"
    NEEDS_SETUP=true
fi

# Test if credentials are valid (only if we have them)
if [[ -n "$AWS_ACCESS_KEY_ID" && -n "$AWS_SECRET_ACCESS_KEY" && -n "$AWS_SESSION_TOKEN" ]]; then
    echo "🔍 Testing existing AWS credentials..."
    if aws sts get-caller-identity > /dev/null 2>&1; then
        echo "✅ AWS credentials are valid"
    else
        echo "❌ AWS credentials are expired or invalid"
        NEEDS_SETUP=true
    fi
else
    echo "❌ AWS credentials not found"
    NEEDS_SETUP=true
fi

# Check if key pair exists (only if we have credentials)
if [[ "$NEEDS_SETUP" == "false" && -n "$AWS_KEY_NAME" ]]; then
    echo "🔍 Checking if key pair '$AWS_KEY_NAME' exists..."
    
    # Check in AWS
    if aws ec2 describe-key-pairs --key-names "$AWS_KEY_NAME" >/dev/null 2>&1; then
        echo "✅ Key pair exists in AWS"
        
        # Check local key file
        if [[ -f "$AWS_KEY_PATH" ]]; then
            echo "✅ Local key file exists: $AWS_KEY_PATH"
        else
            echo "❌ Local key file missing: $AWS_KEY_PATH"
            NEEDS_SETUP=true
        fi
    else
        echo "❌ Key pair '$AWS_KEY_NAME' not found in AWS"
        NEEDS_SETUP=true
        
        # Clean up old local key file
        if [[ -f "$AWS_KEY_PATH" ]]; then
            rm -f "$AWS_KEY_PATH"
            echo "🗑️  Removed old key file"
        fi
    fi
fi

# Only run setup if we actually need it
if [[ "$NEEDS_SETUP" == "true" ]]; then
    setup_aws_credentials
else
    echo "✅ All credentials and keys are valid, proceeding with deployment..."
    echo "   Using key: $AWS_KEY_NAME"
    echo "   Using key file: $AWS_KEY_PATH"
fi

echo ""
echo "🏗️  Starting infrastructure deployment..."

# Step 1: Initialize and apply Terraform
echo "🔧 Deploying infrastructure with Terraform..."
cd ../terraform

if ! terraform init; then
    echo "❌ Terraform init failed"
    exit 1
fi

echo "📋 Planning Terraform deployment..."
if ! terraform plan -var="aws_key_name=$AWS_KEY_NAME"; then
    echo "❌ Terraform plan failed"
    exit 1
fi

echo "🚀 Applying Terraform configuration..."
if ! terraform apply -auto-approve -var="aws_key_name=$AWS_KEY_NAME"; then
    echo "❌ Terraform apply failed"
    exit 1
fi

# Get the public IP and instance ID
echo "🔍 Getting instance details from Terraform..."

# Get public IP
if INSTANCE_IP=$(terraform output -raw public_ip 2>/dev/null) && [[ -n "$INSTANCE_IP" ]]; then
    echo "✅ Instance IP: $INSTANCE_IP"
    export INSTANCE_IP
else
    echo "❌ Failed to get instance IP from Terraform"
    exit 1
fi

# Get instance ID with fallback
if INSTANCE_ID=$(terraform output -raw instance_id 2>/dev/null) && [[ -n "$INSTANCE_ID" ]]; then
    echo "✅ Instance ID: $INSTANCE_ID"
    export INSTANCE_ID
else
    echo "⚠️  Getting instance ID from AWS CLI (Terraform output missing)..."
    INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Study-Planner-App-Server" "Name=instance-state-name,Values=running" --query 'Reservations[0].Instances[0].InstanceId' --output text)
    
    if [[ -n "$INSTANCE_ID" && "$INSTANCE_ID" != "None" ]]; then
        echo "✅ Instance ID from AWS CLI: $INSTANCE_ID"
        export INSTANCE_ID
    else
        echo "❌ Could not get instance ID"
        exit 1
    fi
fi

cd ..

# Step 2: Wait for instance to be ready
echo "⏳ Waiting for instance to be ready..."

# Wait for instance to be running first
echo "🔍 Waiting for instance to reach 'running' state..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
echo "✅ Instance is running"

# Enhanced SSH connectivity testing
echo "🔍 Testing SSH connectivity..."
max_attempts=20
attempt=1
ssh_ready=false

for attempt in $(seq 1 $max_attempts); do
    echo "   Attempt $attempt/$max_attempts: Testing SSH connection..."
    
    # Use ConnectTimeout instead of timeout command
    if ssh -i "$AWS_KEY_PATH" \
        -o ConnectTimeout=15 \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        ec2-user@"$INSTANCE_IP" "echo 'SSH Ready'" >/dev/null 2>&1; then
        
        echo "✅ SSH connection successful!"
        ssh_ready=true
        break
    else
        echo "   ⏳ SSH not ready yet..."
        
        # Show diagnostic info every 5 attempts
        if (( attempt % 5 == 0 )); then
            echo "   🔍 Diagnostic check:"
            if bash -c "</dev/tcp/$INSTANCE_IP/22" 2>/dev/null; then
                echo "      ✅ Port 22 is reachable"
            else
                echo "      ❌ Port 22 not reachable yet"
            fi
        fi
    fi
    
    # Progressive backoff
    if (( attempt <= 10 )); then
        sleep 15
    else
        sleep 30
    fi
done

# Check if SSH is ready
if [[ "$ssh_ready" != "true" ]]; then
    echo "❌ SSH connection failed after $max_attempts attempts"
    echo ""
    echo "💡 Troubleshooting info:"
    echo "   Instance IP: $INSTANCE_IP"
    echo "   Instance ID: $INSTANCE_ID"
    echo "   Key file: $AWS_KEY_PATH"
    echo ""
    echo "🔧 Manual commands to try:"
    echo "   ssh -i \"$AWS_KEY_PATH\" ec2-user@$INSTANCE_IP"
    echo "   ./scripts/destroy.sh  # To clean up and start over"
    exit 1
fi

# Step 3: Deploy application with Ansible
echo "🎭 Deploying application with Ansible..."
cd ansible

if ! ansible-playbook -i inventory.yml deploy.yml \
  -e "instance_ip=$INSTANCE_IP" \
  -e "ansible_ssh_private_key_file=$AWS_KEY_PATH" \
  -v; then
    echo "❌ Ansible deployment failed"
    echo "💡 You can retry the deployment with:"
    echo "   cd ansible && ansible-playbook -i inventory.yml deploy.yml -e \"instance_ip=$INSTANCE_IP\" -e \"ansible_ssh_private_key_file=$AWS_KEY_PATH\""
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "======================================"
echo "📱 Application URL: http://$INSTANCE_IP"
echo "🔧 Microservices: http://$INSTANCE_IP:8080-8083"
echo ""
echo "📋 Useful commands:"
echo "   Check status:    curl http://$INSTANCE_IP"
echo "   SSH to server:   ssh -i \"$AWS_KEY_PATH\" ec2-user@$INSTANCE_IP"
echo "   Clean up:        ./scripts/destroy.sh"
echo ""
echo "⚠️  Remember: AWS Academy credentials expire when your lab session ends!"
echo "   Use ./scripts/destroy.sh to clean up resources before the session expires."