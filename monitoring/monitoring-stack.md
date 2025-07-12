# 🔍 TUM Study Planner - Complete Monitoring Setup

This comprehensive guide covers the entire monitoring stack for the TUM Study Planner application, including Prometheus, Grafana, Loki, and AlertManager with Slack notifications.

## 🏗️ Architecture Overview

```
┌─────────────────────┐  ┌─────────────────────┐
│   Kubernetes        │  │   AWS Labs          │
│   (Persistent)      │  │   (Ephemeral)       │
│                     │  │                     │
│ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ ✅ Prometheus   │ │  │ │ App Services    │ │
│ │ ✅ Grafana      │◄┼──┼►│ - Frontend      │ │
│ │ ✅ Loki         │ │  │ │ - APIs          │ │
│ │ ✅ AlertManager │ │  │ │ - Databases     │ │
│ │ ✅ Historical   │ │  │ └─────────────────┘ │
│ │    Data Saved   │ │  └─────────────────────┘
│ └─────────────────┘ │
└─────────────────────┘
```

### 📊 Monitoring Components

| Component        | Purpose                       | Port | Storage |
| ---------------- | ----------------------------- | ---- | ------- |
| **Prometheus**   | Metrics collection & storage  | 9090 | 10Gi PV |
| **Grafana**      | Dashboards & visualization    | 3000 | 5Gi PV  |
| **Loki**         | Log aggregation               | 3100 | 10Gi PV |
| **Promtail**     | Log collection agent          | 3101 | -       |
| **AlertManager** | Alert routing & notifications | 9093 | 1Gi PV  |

## 🚀 Quick Start (10 minutes)

### Prerequisites

- Kubernetes cluster access
- `kubectl` configured
- Slack workspace access (optional)

### 1. Deploy Monitoring Stack

```bash
# Clone repository
git clone https://github.com/AET-DevOps25/team-stratton-oakmont.git
cd team-stratton-oakmont

# Deploy monitoring
./scripts/deploy-monitoring.sh
```

### 2. Access Services

**Prometheus (Metrics):**

```bash
kubectl port-forward -n tum-study-planner-monitoring svc/prometheus 9090:9090
# Visit: http://localhost:9090
```

**Grafana (Dashboards):**

```bash
kubectl port-forward -n tum-study-planner-monitoring svc/grafana 3000:3000
# Visit: http://localhost:3000
# Login: admin/admin (change on first login)
```

**Loki (Logs):**

```bash
kubectl port-forward -n tum-study-planner-monitoring svc/loki 3100:3100
# Visit: http://localhost:3100
```

**AlertManager (Alerts):**

```bash
kubectl port-forward -n tum-study-planner-monitoring svc/alertmanager 9093:9093
# Visit: http://localhost:9093
```

## 📈 Grafana Dashboard Setup

### Pre-configured Dashboards

1. **Application Overview**: Service health, response times, throughput
2. **Infrastructure**: Kubernetes cluster metrics, resource usage
3. **Logs Dashboard**: Centralized log viewing with filters
4. **Database Performance**: Connection pools, query performance

### Import Additional Dashboards

```bash
# Access Grafana
kubectl port-forward -n tum-study-planner-monitoring svc/grafana 3000:3000

# Go to: http://localhost:3000
# Navigate: + → Import → Enter ID or JSON
```

**Recommended Dashboard IDs:**

- `3119` - Kubernetes cluster overview
- `7249` - Kubernetes pod overview
- `6417` - Spring Boot metrics
- `12019` - JVM metrics

### Data Sources Configuration

**Prometheus** (Metrics):

- URL: `http://prometheus:9090`
- Access: Server (default)

**Loki** (Logs):

- URL: `http://loki:3100`
- Access: Server (default)

## 🚨 AlertManager & Slack Setup

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
5. **Choose Channel**: Create `#alerts-warning` channel
6. **Copy Webhook URL**: Looks like `https://hooks.slack.com/services/T.../B.../...`

### Step 2: Configure AlertManager

**Option A: Automated setup**

```bash
./scripts/setup-slack-alerts.sh
```

**Option B: Manual setup**

```bash
# Create secret with your webhook URL
kubectl create secret generic alertmanager-secrets \
  --namespace=tum-study-planner-monitoring \
  --from-literal=slack-webhook-url="YOUR_WEBHOOK_URL_HERE"

# Apply AlertManager configuration
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Restart AlertManager
kubectl rollout restart deployment/alertmanager -n tum-study-planner-monitoring
```

### Step 3: Test Alerts

```bash
# Trigger test alert by stopping a service
kubectl scale deployment program-catalog-service --replicas=0 -n tum-study-planner

# Wait 2-3 minutes for alert, then restore
kubectl scale deployment program-catalog-service --replicas=1 -n tum-study-planner
```

## 📊 Alert Rules Configured

| Alert Name                    | Trigger                    | Severity | Description             |
| ----------------------------- | -------------------------- | -------- | ----------------------- |
| **ServiceDown**               | Service unavailable >1min  | Critical | Service completely down |
| **HighResponseTime**          | >500ms response time >2min | Warning  | Performance degradation |
| **HighErrorRate**             | >10% error rate >2min      | Warning  | High failure rate       |
| **PodRestartingTooMuch**      | >5 restarts in 10min       | Warning  | Pod instability         |
| **KubernetesNodeNotReady**    | Node issues >5min          | Critical | Infrastructure problem  |
| **KubernetesPodCrashLooping** | Crash loop detected        | Warning  | Application crash loop  |

## 🔧 Advanced Configuration

### Custom Metrics Collection

**Add monitoring to your service:**

```yaml
# In your service deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-service
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9080"
        prometheus.io/path: "/actuator/prometheus"
      labels:
        monitoring: "true"
```

### Log Collection Setup

**Application configuration:**

```yaml
# application.yml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
  level:
    com.tum.studyplanner: INFO
    org.springframework: WARN
```

**Promtail will automatically collect logs from:**

- `/var/log/containers/*.log` (Kubernetes container logs)
- Application stdout/stderr

### Resource Scaling

**Adjust resource limits based on usage:**

```bash
# Monitor resource usage
kubectl top pods -n tum-study-planner-monitoring

# Scale if needed
kubectl patch deployment prometheus -n tum-study-planner-monitoring \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"prometheus","resources":{"limits":{"memory":"4Gi"}}}]}}}}'
```

## 🛠️ Maintenance & Operations

### Daily Operations

**Check monitoring health:**

```bash
kubectl get pods -n tum-study-planner-monitoring
kubectl get pv | grep monitoring
```

**View logs:**

```bash
# Prometheus logs
kubectl logs -f deployment/prometheus -n tum-study-planner-monitoring

# Grafana logs
kubectl logs -f deployment/grafana -n tum-study-planner-monitoring

# AlertManager logs
kubectl logs -f deployment/alertmanager -n tum-study-planner-monitoring
```

### Backup & Recovery

**Backup Grafana dashboards:**

```bash
kubectl port-forward -n tum-study-planner-monitoring svc/grafana 3000:3000
# Export dashboards via UI: Settings → Export
```

**Backup Prometheus data:**

```bash
# Prometheus data is stored in persistent volumes
kubectl get pv | grep prometheus
```

### Troubleshooting

**Common Issues:**

1. **Prometheus not scraping targets:**

   ```bash
   # Check service discovery
   kubectl get servicemonitors -n tum-study-planner-monitoring
   # Verify target labels match Prometheus config
   ```

2. **Grafana dashboards not loading:**

   ```bash
   # Check data source connectivity
   kubectl exec -it deployment/grafana -n tum-study-planner-monitoring -- \
     curl http://prometheus:9090/api/v1/query?query=up
   ```

3. **Alerts not firing:**

   ```bash
   # Check alert rules syntax
   kubectl logs -f deployment/prometheus -n tum-study-planner-monitoring | grep error
   ```

4. **Slack notifications not working:**
   ```bash
   # Verify webhook URL in secret
   kubectl get secret alertmanager-secrets -n tum-study-planner-monitoring -o yaml
   # Check AlertManager logs
   kubectl logs -f deployment/alertmanager -n tum-study-planner-monitoring
   ```

## 📚 Best Practices Implemented

✅ **Separate Namespace**: Isolated monitoring in `tum-study-planner-monitoring`  
✅ **Persistent Volumes**: Data survives pod restarts  
✅ **Label-Based Discovery**: Automatic service discovery  
✅ **RBAC Security**: Proper service accounts and permissions  
✅ **Resource Limits**: Prevents resource exhaustion  
✅ **Health Checks**: Liveness and readiness probes  
✅ **Secrets Management**: Secure webhook storage  
✅ **Version Visibility**: Application version tracking

## 🔗 Useful Links

- **Prometheus**: http://localhost:9090 (metrics & targets)
- **Grafana**: http://localhost:3000 (dashboards)
- **AlertManager**: http://localhost:9093 (alert status)
- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **Kubernetes Monitoring**: https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review component logs
3. Verify configuration files in `k8s/monitoring/`
4. Test connectivity between components

**Quick health check:**

```bash
curl http://localhost:9090/api/v1/query?query=up  # Prometheus
curl http://localhost:3000/api/health             # Grafana
curl http://localhost:9093/api/v1/status          # AlertManager
```
