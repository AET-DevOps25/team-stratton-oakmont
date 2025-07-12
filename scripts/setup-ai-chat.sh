#!/bin/bash

# AI Chat Feature Setup Script
# This script sets up the AI chat functionality for the TUM Study Planner

set -e

echo "🚀 Setting up AI Chat Feature for TUM Study Planner"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Check for OpenAI API key
if [ -f "server/llm-inference-service/.env" ]; then
    if grep -q "OPENAI_API_KEY=your_openai_api_key_here" server/llm-inference-service/.env; then
        echo "⚠️  Please update your OpenAI API key in server/llm-inference-service/.env"
        echo "   Edit the file and replace 'your_openai_api_key_here' with your actual API key"
        read -p "Press Enter after you've updated the API key..."
    fi
else
    echo "📝 Creating environment file..."
    cp server/llm-inference-service/.env.example server/llm-inference-service/.env
    echo "⚠️  Please update your OpenAI API key in server/llm-inference-service/.env"
    echo "   Edit the file and replace 'your_openai_api_key_here' with your actual API key"
    read -p "Press Enter after you've updated the API key..."
fi

# Stop any existing services
echo "🛑 Stopping any existing AI services..."
docker-compose -f docker-compose.ai.yml down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting AI services..."
docker-compose -f docker-compose.ai.yml up -d --build

echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Performing health checks..."

# Check Weaviate
echo "   Checking Weaviate..."
for i in {1..30}; do
    if curl -s http://localhost:8080/v1/meta > /dev/null 2>&1; then
        echo "   ✅ Weaviate is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Weaviate health check failed"
        exit 1
    fi
    sleep 2
done

# Check LLM Inference Service
echo "   Checking LLM Inference Service..."
for i in {1..30}; do
    if curl -s http://localhost:8082/health > /dev/null 2>&1; then
        echo "   ✅ LLM Inference Service is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ LLM Inference Service health check failed"
        exit 1
    fi
    sleep 2
done

# Check AI Advisor Service
echo "   Checking AI Advisor Service..."
for i in {1..30}; do
    if curl -s http://localhost:8084/api/v1/health > /dev/null 2>&1; then
        echo "   ✅ AI Advisor Service is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ AI Advisor Service health check failed"
        exit 1
    fi
    sleep 2
done

# Test the AI chat functionality
echo "🧪 Testing AI chat functionality..."
response=$(curl -s -X POST http://localhost:8082/chat/ \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, can you help me with TUM courses?"}')

if echo "$response" | grep -q "response"; then
    echo "   ✅ AI chat is working correctly"
else
    echo "   ⚠️  AI chat test returned unexpected response: $response"
fi

echo ""
echo "🎉 AI Chat Feature Setup Complete!"
echo "=================================="
echo ""
echo "📊 Service Status:"
echo "   • Weaviate Vector DB:    http://localhost:8080"
echo "   • LLM Inference Service: http://localhost:8082"
echo "   • AI Advisor Service:    http://localhost:8084"
echo ""
echo "🌐 Next Steps:"
echo "   1. Start the frontend development server:"
echo "      cd client && npm install && npm run dev"
echo ""
echo "   2. Open the application in your browser"
echo "      The AI chat feature will be available in the sidebar"
echo ""
echo "   3. Try asking questions like:"
echo "      • 'What is IN2003 about?'"
echo "      • 'Tell me about Machine Learning courses'"
echo "      • 'What are the prerequisites for Advanced Algorithms?'"
echo ""
echo "📚 For more information, see: AI_CHAT_IMPLEMENTATION.md"
echo ""
echo "🛠️  To stop the services: docker-compose -f docker-compose.ai.yml down"
