#!/bin/bash

# TUM Study Planner - Kubernetes Deployment Script
# This script deploys the monitoring stack and application to Kubernetes following best practices

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TUM Study Planner - Kubernetes Deployment${NC}"
echo "============================================"

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ kubectl is configured and cluster is accessible${NC}"
}

# Function to deploy monitoring namespace and components
deploy_monitoring() {
    echo -e "${YELLOW}📊 Deploying Monitoring Stack...${NC}"
    
    # Create monitoring namespace
    kubectl apply -f k8s/monitoring/namespace.yaml
    
    # Deploy Prometheus RBAC
    kubectl apply -f k8s/monitoring/prometheus-rbac.yaml
    
    # Deploy ConfigMaps
    kubectl apply -f k8s/monitoring/prometheus-config.yaml
    kubectl apply -f k8s/monitoring/prometheus-rules.yaml
    
    # Deploy Prometheus
    kubectl apply -f k8s/monitoring/prometheus.yaml
    
    # Deploy Grafana
    kubectl apply -f k8s/monitoring/grafana.yaml
    
    # Deploy AlertManager
    kubectl apply -f k8s/monitoring/alertmanager.yaml
    
    echo -e "${GREEN}✅ Monitoring stack deployed${NC}"
}

# Function to deploy application components
deploy_application() {
    echo -e "${YELLOW}🏗️ Deploying Application Stack...${NC}"
    
    # Create application namespace
    kubectl apply -f k8s/base/namespace.yaml
    
    # Deploy ConfigMaps and Secrets
    kubectl apply -f k8s/base/configmap.yaml
    
    # Deploy databases (if manifests exist)
    if [ -f "k8s/base/postgres-auth.yaml" ]; then
        kubectl apply -f k8s/base/postgres-auth.yaml
    fi
    if [ -f "k8s/base/postgres-study-data.yaml" ]; then
        kubectl apply -f k8s/base/postgres-study-data.yaml
    fi
    if [ -f "k8s/base/postgres-study-plan.yaml" ]; then
        kubectl apply -f k8s/base/postgres-study-plan.yaml
    fi
    
    # Deploy application services
    if [ -f "k8s/app/program-catalog-service.yaml" ]; then
        kubectl apply -f k8s/app/program-catalog-service.yaml
    fi
    
    echo -e "${GREEN}✅ Application stack deployed${NC}"
}

# Function to wait for deployments to be ready
wait_for_deployments() {
    echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
    
    # Wait for monitoring components
    echo "Waiting for Prometheus..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n tum-study-planner-monitoring
    
    echo "Waiting for Grafana..."
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n tum-study-planner-monitoring
    
    echo "Waiting for AlertManager..."
    kubectl wait --for=condition=available --timeout=300s deployment/alertmanager -n tum-study-planner-monitoring
    
    # Wait for application components
    if kubectl get deployment program-catalog-service -n tum-study-planner &> /dev/null; then
        echo "Waiting for Program Catalog Service..."
        kubectl wait --for=condition=available --timeout=300s deployment/program-catalog-service -n tum-study-planner
    fi
    
    echo -e "${GREEN}✅ All deployments are ready${NC}"
}

# Function to display access information
show_access_info() {
    echo -e "${BLUE}🌐 Access Information${NC}"
    echo "===================="
    
    # Get Prometheus service details
    PROMETHEUS_PORT=$(kubectl get svc prometheus -n tum-study-planner-monitoring -o jsonpath='{.spec.ports[0].port}')
    echo -e "Prometheus: ${GREEN}kubectl port-forward svc/prometheus -n tum-study-planner-monitoring ${PROMETHEUS_PORT}:${PROMETHEUS_PORT}${NC}"
    echo -e "           Then access: http://localhost:${PROMETHEUS_PORT}"
    
    # Get Grafana service details
    GRAFANA_PORT=$(kubectl get svc grafana -n tum-study-planner-monitoring -o jsonpath='{.spec.ports[0].port}')
    echo -e "Grafana:    ${GREEN}kubectl port-forward svc/grafana -n tum-study-planner-monitoring ${GRAFANA_PORT}:${GRAFANA_PORT}${NC}"
    echo -e "           Then access: http://localhost:${GRAFANA_PORT}"
    echo -e "           Default credentials: admin / changeme-secure-password"
    
    # Get AlertManager service details
    ALERTMANAGER_PORT=$(kubectl get svc alertmanager -n tum-study-planner-monitoring -o jsonpath='{.spec.ports[0].port}')
    echo -e "AlertManager: ${GREEN}kubectl port-forward svc/alertmanager -n tum-study-planner-monitoring ${ALERTMANAGER_PORT}:${ALERTMANAGER_PORT}${NC}"
    echo -e "             Then access: http://localhost:${ALERTMANAGER_PORT}"
    
    echo ""
    echo -e "${YELLOW}📝 Quick Commands:${NC}"
    echo "View monitoring pods:  kubectl get pods -n tum-study-planner-monitoring"
    echo "View application pods: kubectl get pods -n tum-study-planner"
    echo "View logs:            kubectl logs -f deployment/prometheus -n tum-study-planner-monitoring"
    echo "Delete all:           kubectl delete namespace tum-study-planner-monitoring tum-study-planner"
}

# Function to check deployment health
check_health() {
    echo -e "${YELLOW}🔍 Checking deployment health...${NC}"
    
    # Check monitoring namespace
    echo "Monitoring pods status:"
    kubectl get pods -n tum-study-planner-monitoring
    
    # Check application namespace
    echo -e "\nApplication pods status:"
    kubectl get pods -n tum-study-planner
    
    # Check services
    echo -e "\nServices:"
    kubectl get svc -n tum-study-planner-monitoring
    kubectl get svc -n tum-study-planner
}

# Main deployment flow
main() {
    check_kubectl
    
    echo -e "${YELLOW}📋 Deployment Plan:${NC}"
    echo "1. Deploy monitoring namespace and stack"
    echo "2. Deploy application namespace and services"
    echo "3. Wait for all deployments to be ready"
    echo "4. Show access information"
    echo ""
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    deploy_monitoring
    deploy_application
    wait_for_deployments
    check_health
    show_access_info
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}💡 Don't forget to configure AlertManager with your Slack webhook URL${NC}"
}

# Run main function
main "$@"
