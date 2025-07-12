#!/bin/bash

# Weaviate Data Population Script
# This script populates Weaviate with TUM course data

set -e

echo "📚 TUM Course Data Population"
echo "============================="

# Check if Weaviate is running
echo "🔍 Checking Weaviate connection..."
if ! curl -s http://localhost:8080/v1/meta > /dev/null 2>&1; then
    echo "❌ Weaviate is not running on localhost:8080"
    echo "Please start Weaviate first:"
    echo "   docker-compose -f docker-compose.ai.yml up -d weaviate"
    exit 1
fi

echo "✅ Weaviate is running"

# Check for OpenAI API key
if [ ! -f "server/llm-inference-service/.env" ]; then
    echo "❌ Environment file not found!"
    echo "Please create server/llm-inference-service/.env with your OpenAI API key"
    exit 1
fi

if grep -q "your_openai_api_key_here" server/llm-inference-service/.env; then
    echo "❌ Please update your OpenAI API key in server/llm-inference-service/.env"
    exit 1
fi

echo "✅ Environment configured"

# Check if course data exists
if [ ! -f "data-collection/csv_tables/modules.csv" ]; then
    echo "❌ Course data file not found: data-collection/csv_tables/modules.csv"
    exit 1
fi

echo "✅ Course data file found"

# Install Python dependencies if needed
echo "📦 Installing Python dependencies..."
cd server/llm-inference-service
pip install -r requirements.txt > /dev/null 2>&1
cd ../..

# Run the population script
echo "🚀 Starting data population..."
cd server/llm-inference-service

# Set environment variables and run the script
set -a
source .env
set +a
export WEAVIATE_URL="http://localhost:8080"

python populate_weaviate.py

cd ../..

echo ""
echo "🎉 Data population complete!"
echo "=========================="
echo ""
echo "📊 Your Weaviate database is now populated with TUM course data"
echo "🤖 The AI chat feature can now provide detailed course information"
echo ""
echo "🌐 Next steps:"
echo "   1. Start the AI services: docker-compose -f docker-compose.ai.yml up -d"
echo "   2. Start the frontend: cd client && npm run dev"
echo "   3. Test the AI chat with course-specific questions"
