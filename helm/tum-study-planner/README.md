# Kubernetes & Helm Deployment

This directory contains Kubernetes manifests and Helm charts for deploying the TUM Study Planner to Kubernetes clusters.

## 📁 Directory Overview

| Directory                 | Purpose                             | Usage                                                 |
| ------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `helm/tum-study-planner/` | Helm chart for complete application | `helm install study-planner ./helm/tum-study-planner` |
| `k8s/`                    | Raw Kubernetes manifests            | `kubectl apply -f k8s/`                               |

## 🚀 Quick Start

### Helm Deployment (Recommended)

```bash
# Deploy with Helm
helm install study-planner ./helm/tum-study-planner --namespace tum-study-planner

# Upgrade existing deployment
helm upgrade study-planner ./helm/tum-study-planner --namespace tum-study-planner
```

### Raw Kubernetes Manifests

```bash
# Deploy with kubectl
kubectl apply -f k8s/

# Clean up
kubectl delete -f k8s/
```

## 📋 Prerequisites

- **Kubernetes cluster** (Minikube, TUM Infrastructure, or cloud provider)
- **kubectl** configured to connect to your cluster
- **Helm 3.x** installed
- **Container registry access** for pulling images

```bash
# Install via Homebrew (macOS)
brew install kubernetes-cli helm

# Or via package managers on Linux
sudo apt-get install kubectl helm  # Ubuntu/Debian
sudo yum install kubectl helm      # RHEL/CentOS

# Verify cluster connection
kubectl cluster-info
helm version
```

## 🎛️ Helm Chart - Complete Application

### What It Deploys

1. **🏗️ Infrastructure Components**

   - PostgreSQL database with persistent storage
   - Nginx ingress controller configuration
   - Service mesh networking

2. **🔧 Microservices**

   - [`user-auth-service`](../server/user-auth-service/) (port 8083)
   - [`study-plan-service`](../server/study-plan-service/) (port 8081)
   - [`program-catalog-service`](../server/program-catalog-service/) (port 8080)
   - [`ai-advisor-service`](../server/ai-advisor-service/) (port 8082)

3. **🌐 Frontend**

   - React client with nginx reverse proxy
   - Configured CORS for microservice communication
   - Ingress routing for external access

4. **🔄 Service Discovery**
   - Kubernetes services for internal communication
   - Load balancing across replicas
   - Health checks and readiness probes
