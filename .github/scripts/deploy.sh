#!/bin/bash
# .github/scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Create secrets
kubectl create secret generic tum-study-planner-secrets \
  --namespace="$NAMESPACE" \
  --from-literal=AUTH_POSTGRES_USER="$AUTH_POSTGRES_USER" \
  --from-literal=AUTH_POSTGRES_PASSWORD="$AUTH_POSTGRES_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create registry secret
kubectl create secret docker-registry ghcr \
  --namespace="$NAMESPACE" \
  --docker-server=ghcr.io \
  --docker-username="$GITHUB_ACTOR" \
  --docker-password="$GITHUB_TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
helm upgrade --install study-planner ./helm/tum-study-planner \
  --namespace "$NAMESPACE" \
  --set client.image.tag="$IMAGE_TAG" \
  --set studyPlanService.image.tag="$IMAGE_TAG" \
  --set userAuthService.image.tag="$IMAGE_TAG" \
  --wait --timeout=10m

echo "✅ Deployment completed successfully!"