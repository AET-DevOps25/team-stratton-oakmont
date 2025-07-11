#!/bin/bash

# Script to set up Slack webhook for AlertManager
# This script helps you configure Slack notifications for your monitoring alerts

echo "🚀 TUM Study Planner - Slack AlertManager Setup"
echo "================================================"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Function to encode string to base64
encode_base64() {
    echo -n "$1" | base64 | tr -d '\n'
}

echo "📋 Steps to get your Slack Webhook URL:"
echo ""
echo "1. Go to https://api.slack.com/apps"
echo "2. Click 'Create New App' -> 'From scratch'"
echo "3. Name: 'TUM Study Planner Alerts'"
echo "4. Choose your workspace"
echo "5. Go to 'Incoming Webhooks' in the sidebar"
echo "6. Turn on 'Activate Incoming Webhooks'"
echo "7. Click 'Add New Webhook to Workspace'"
echo "8. Select channel (or create #alerts-critical and #alerts-warning)"
echo "9. Copy the webhook URL"
echo ""

# Get webhook URL from user
read -p "📝 Enter your Slack webhook URL: " WEBHOOK_URL

if [[ -z "$WEBHOOK_URL" ]]; then
    echo "❌ Error: Webhook URL cannot be empty"
    exit 1
fi

if [[ ! "$WEBHOOK_URL" =~ ^https://hooks\.slack\.com/services/.+ ]]; then
    echo "❌ Error: Invalid Slack webhook URL format"
    echo "   Expected format: https://hooks.slack.com/services/..."
    exit 1
fi

echo ""
echo "🔧 Setting up Kubernetes secret..."

# Encode the webhook URL
ENCODED_WEBHOOK=$(encode_base64 "$WEBHOOK_URL")

# Create the secret
kubectl create secret generic alertmanager-secrets \
    --namespace=tum-study-planner-monitoring \
    --from-literal=slack-webhook-url="$WEBHOOK_URL" \
    --dry-run=client -o yaml | kubectl apply -f -

if [ $? -eq 0 ]; then
    echo "✅ Slack webhook secret created successfully!"
    echo ""
    echo "📋 Recommended Slack channels to create:"
    echo "   #alerts-critical  - For critical alerts (service down, etc.)"
    echo "   #alerts-warning   - For warning alerts (high response time, etc.)"
    echo "   #general         - For general notifications"
    echo ""
    echo "🔄 Restart AlertManager to apply changes:"
    echo "   kubectl rollout restart deployment/alertmanager -n tum-study-planner-monitoring"
    echo ""
    echo "🧪 Test your setup:"
    echo "   kubectl port-forward -n tum-study-planner-monitoring svc/alertmanager 9093:9093"
    echo "   Then visit: http://localhost:9093"
else
    echo "❌ Error: Failed to create secret"
    exit 1
fi
