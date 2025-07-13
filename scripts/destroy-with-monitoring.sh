#!/bin/bash

# Stop complete stack including monitoring

set -e

echo "🛑 Stopping TUM Study Planner and Monitoring..."

# Stop application services
echo "Stopping application services..."
docker-compose -f docker-compose.prod.yml down

# Stop monitoring stack
echo "Stopping monitoring stack..."
docker-compose -f docker-compose.monitoring.yml down

echo "✅ All services stopped!"
echo ""
echo "Note: To preserve monitoring data, volumes are kept."
echo "To remove everything including data: docker-compose -f docker-compose.monitoring.yml down -v"
