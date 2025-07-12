# 🚨 AlertManager Setup Guide

This guide helps you configure Slack notifications for your TUM Study Planner monitoring alerts.

## 📋 Quick Setup (5 minutes)

### Step 1: Create Slack App & Webhook

1. **Go to Slack API**: https://api.slack.com/apps
2. **Create New App** → "From scratch"
3. **App Details**:
   - App Name: `TUM Study Planner Alerts`
   - Choose your workspace
4. **Enable Incoming Webhooks**:
   - Go to "Incoming Webhooks" in sidebar
   - Turn ON "Activate Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
5. **Choose Channel**: Select existing or create new channel
6. **Copy Webhook URL**: Looks like `https://hooks.slack.com/services/T.../B.../...`

### Step 2: Create Slack Channel

Create this channel in your Slack workspace:
- `#alerts-warning` - For all alerts (critical and warning)

### Step 3: Configure AlertManager

**Option A: Use the automated script**
```bash
./scripts/setup-slack-alerts.sh
```

**Option B: Manual setup**
```bash
# Create secret with your webhook URL
kubectl create secret generic alertmanager-secrets \
  --namespace=tum-study-planner-monitoring \
  --from-literal=slack-webhook-url="YOUR_WEBHOOK_URL_HERE"

# Apply the updated AlertManager configuration
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Restart AlertManager
kubectl rollout restart deployment/alertmanager -n tum-study-planner-monitoring
```

## 🧪 Testing Your Setup

1. **Check AlertManager Status**:
   ```bash
   kubectl get pods -n tum-study-planner-monitoring
   ```

2. **Access AlertManager UI**:
   ```bash
   kubectl port-forward -n tum-study-planner-monitoring svc/alertmanager 9093:9093
   ```
   Visit: http://localhost:9093

3. **Trigger Test Alert** (optional):
   ```bash
   # Temporarily stop a service to trigger "ServiceDown" alert
   kubectl scale deployment program-catalog-service --replicas=0 -n tum-study-planner
   # Wait 2-3 minutes, then restore:
   kubectl scale deployment program-catalog-service --replicas=1 -n tum-study-planner
   ```

## 📊 Alert Types Configured

| Alert Name | Trigger | Severity | Channel |
|------------|---------|----------|---------|
| ServiceDown | Service unavailable >1min | Critical | #alerts-warning |
| HighResponseTime | >500ms response time >2min | Warning | #alerts-warning |
| HighErrorRate | >10% error rate >2min | Warning | #alerts-warning |
| PodRestartingTooMuch | Frequent pod restarts | Warning | #alerts-warning |
| KubernetesNodeNotReady | Node issues >5min | Critical | #alerts-warning |
| KubernetesPodCrashLooping | Pod crash loops | Warning | #alerts-warning |

## 🔧 Advanced Configuration

### Custom Alert Timing
Edit `k8s/monitoring/alertmanager.yaml`:
- `group_wait`: How long to wait before sending first alert
- `repeat_interval`: How often to repeat unresolved alerts
- `group_interval`: How long to wait before sending grouped alerts

### Additional Notification Channels
- **Email**: Uncomment SMTP configuration in alertmanager.yaml
- **Teams**: Use Teams webhook URL instead of Slack
- **PagerDuty**: Add PagerDuty integration key

### Security Best Practices
- ✅ Webhook URL stored as Kubernetes secret
- ✅ Secret mounted as file (not environment variable)
- ✅ AlertManager runs with minimal privileges
- ✅ Network policies can be added for additional security

## 🚨 Troubleshooting

**Alerts not appearing in Slack:**
1. Check AlertManager logs: `kubectl logs -f deployment/alertmanager -n tum-study-planner-monitoring`
2. Verify secret exists: `kubectl get secrets -n tum-study-planner-monitoring`
3. Check webhook URL format (should start with `https://hooks.slack.com/services/`)
4. Ensure Slack channels exist and app has permissions

**AlertManager not starting:**
1. Check configuration syntax: `kubectl describe pod -l app=alertmanager -n tum-study-planner-monitoring`
2. Verify secret is mounted: `kubectl exec -it deployment/alertmanager -n tum-study-planner-monitoring -- ls -la /etc/alertmanager/secrets/`

## 📚 Additional Resources

- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Slack API - Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Prometheus Alert Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
