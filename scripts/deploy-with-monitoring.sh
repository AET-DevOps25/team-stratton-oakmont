#!/bin/bash

# Deploy complete stack with monitoring in production
# This ensures monitoring is always deployed with the application

set -e

echo "🚀 Deploying TUM Study Planner with Monitoring..."

# Create network if it doesn't exist
docker network create stratton-oakmont-network 2>/dev/null || echo "Network already exists"

# Start monitoring first (so it's ready to collect metrics from the start)
echo "📊 Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait a moment for monitoring to be ready
sleep 5

# Start application services
echo "🏗️ Starting application services..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment complete!"
echo ""
echo "Application URLs:"
echo "- Frontend: http://localhost:80"
echo "- API Services: http://localhost:8080-8083"
echo ""
echo "Monitoring URLs:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001"
echo "- Loki: http://localhost:3100"
echo ""
echo "To stop everything: ./scripts/destroy-with-monitoring.sh"
