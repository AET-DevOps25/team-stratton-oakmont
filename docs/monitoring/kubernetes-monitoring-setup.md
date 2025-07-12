# Kubernetes Monitoring Stack Deployment Guide

## Overview
This guide sets up a persistent monitoring stack in Kubernetes that follows the Artemis best practices, separate from the ephemeral AWS deployment.

## Architecture
```
┌─────────────────────┐  ┌─────────────────────┐
│   Kubernetes        │  │   AWS Labs          │
│   (Persistent)      │  │   (4hr timeout)     │
│                     │  │                     │
│ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ Monitoring      │ │  │ │ Application     │ │
│ │ - Prometheus    │◄┼──┼►│ Services        │ │
│ │ - Grafana       │ │  │ │ - APIs          │ │
│ │ - Alertmanager  │ │  │ │ - Frontend      │ │
│ │ - Persistent    │ │  │ │ - Databases     │ │
│ │   Storage       │ │  │ └─────────────────┘ │
│ └─────────────────┘ │  └─────────────────────┘
└─────────────────────┘
```

## Best Practices Implemented ✅

### ✅ 1. Separate Namespace
- Monitoring deployed in `tum-study-planner-monitoring` namespace
- Application services in `tum-study-planner` namespace

### ✅ 2. Persistent Volumes
- Prometheus has 10Gi PVC for historical metrics
- Grafana has persistent storage for dashboards

### ✅ 3. Label-Based Discovery
- All services labeled with `monitoring: "true"`
- Prometheus auto-discovers labeled services

### ✅ 4. ServiceMonitor Ready
- Annotations configured for Prometheus scraping
- Metrics endpoints properly exposed

### ✅ 5. RBAC Security
- Dedicated service accounts
- Proper permissions for metric collection

## Deployment Steps

### 1. Deploy Monitoring Namespace
```bash
kubectl apply -f k8s/monitoring/namespace.yaml
```

### 2. Deploy RBAC Configuration
```bash
kubectl apply -f k8s/monitoring/prometheus-rbac-namespace.yaml
kubectl apply -f k8s/monitoring/prometheus-rbac.yaml
```

### 3. Deploy Prometheus Configuration
```bash
kubectl apply -f k8s/monitoring/prometheus-config-namespace.yaml
kubectl apply -f k8s/monitoring/prometheus-config.yaml
kubectl apply -f k8s/monitoring/prometheus-rules.yaml
```

### 4. Deploy Prometheus
```bash
kubectl apply -f k8s/monitoring/prometheus.yaml
```

### 5. Deploy Grafana
```bash
kubectl apply -f k8s/monitoring/grafana.yaml
```

### 6. Deploy Alertmanager (Optional)
```bash
kubectl apply -f k8s/monitoring/alertmanager-secrets.yaml
kubectl apply -f k8s/monitoring/alertmanager.yaml
```

### 7. Deploy Ingress (Optional)
```bash
kubectl apply -f k8s/monitoring/ingress.yaml
```

### 8. Deploy Application Services
```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/postgres-*.yaml
kubectl apply -f k8s/app/program-catalog-service.yaml
# ... other services
```

## Verification

### Check Monitoring Stack
```bash
# Check monitoring namespace
kubectl get all -n tum-study-planner-monitoring

# Check persistent volumes
kubectl get pvc -n tum-study-planner-monitoring

# Check if Prometheus is scraping targets
kubectl port-forward -n tum-study-planner-monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets
```

### Check Application Services
```bash
# Check application namespace
kubectl get all -n tum-study-planner

# Check if services are exposing metrics
kubectl port-forward -n tum-study-planner svc/program-catalog-service 9080:9080
# Visit http://localhost:9080/actuator/prometheus
```

## Benefits of This Setup

### ✅ Persistent Data
- Historical metrics preserved across AWS Lab restarts
- Trend analysis and capacity planning possible
- No data loss from 4-hour timeouts

### ✅ Cost Effective
- Monitoring runs on persistent Kubernetes cluster
- AWS only used for ephemeral application testing
- No expensive 24/7 monitoring on AWS

### ✅ Best Practice Compliance
- Follows all Artemis monitoring guidelines
- Production-ready monitoring setup
- Proper separation of concerns

### ✅ Development Workflow
- Local development uses `docker-compose.monitoring.yml`
- Production monitoring uses Kubernetes
- Clean separation between environments

## Accessing Services

### Prometheus
```bash
kubectl port-forward -n tum-study-planner-monitoring svc/prometheus 9090:9090
# Visit: http://localhost:9090
```

### Grafana
```bash
kubectl port-forward -n tum-study-planner-monitoring svc/grafana 3000:3000
# Visit: http://localhost:3000
# Default: admin/admin
```

### Alertmanager
```bash
kubectl port-forward -n tum-study-planner-monitoring svc/alertmanager 9093:9093
# Visit: http://localhost:9093
```

## Next Steps

1. **Configure Grafana Dashboards**: Import dashboards for Spring Boot applications
2. **Set Up Alerting**: Configure meaningful alerts in Prometheus rules
3. **Add More Services**: Deploy other application services with monitoring labels
4. **Secure Access**: Set up proper authentication and RBAC
5. **Backup Strategy**: Implement backup for Prometheus and Grafana data

## Troubleshooting

### Prometheus Not Scraping Targets
- Check service labels: `monitoring: "true"`
- Verify endpoints are accessible
- Check Prometheus configuration

### No Historical Data
- Verify PVC is mounted correctly
- Check storage class availability
- Ensure retention settings are correct

### Services Not Discovered
- Verify namespace and labels
- Check RBAC permissions
- Review Prometheus configuration
