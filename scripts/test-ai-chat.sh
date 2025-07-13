#!/bin/bash

# AI Chat Feature Test Script
# This script tests the AI chat functionality

set -e

echo "🧪 Testing AI Chat Feature"
echo "========================="

# Test questions
questions=(
    "What is IN2003 about?"
    "Tell me about 3D Scanning & Motion Capture"
    "What programming languages are used in Machine Learning courses?"
    "Can you help me with study planning?"
    "What are the prerequisites for Advanced Algorithms?"
)

# Test each question
for i in "${!questions[@]}"; do
    question="${questions[$i]}"
    echo ""
    echo "Test $((i+1)): \"$question\""
    echo "----------------------------------------"
    
    response=$(curl -s -X POST http://localhost:8082/chat/ \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$question\"}")
    
    if echo "$response" | jq -e '.response' > /dev/null 2>&1; then
        echo "✅ Response received"
        echo "📝 Answer: $(echo "$response" | jq -r '.response' | head -c 100)..."
        
        # Check for course codes
        course_codes=$(echo "$response" | jq -r '.course_codes[]?' 2>/dev/null || echo "")
        if [ -n "$course_codes" ]; then
            echo "🎯 Course codes detected: $course_codes"
        fi
        
        # Check confidence
        confidence=$(echo "$response" | jq -r '.confidence // 0' 2>/dev/null)
        echo "📊 Confidence: $(echo "$confidence * 100" | bc 2>/dev/null || echo "N/A")%"
        
    else
        echo "❌ Failed to get valid response"
        echo "Response: $response"
    fi
done

echo ""
echo "🔍 Testing course lookup..."
response=$(curl -s http://localhost:8082/course/IN2003)
if echo "$response" | jq -e '.course_code' > /dev/null 2>&1; then
    echo "✅ Course lookup working"
    echo "📚 Course: $(echo "$response" | jq -r '.course_name')"
else
    echo "❌ Course lookup failed"
fi

echo ""
echo "🏥 Testing health endpoints..."
health=$(curl -s http://localhost:8082/health)
if echo "$health" | jq -e '.status' > /dev/null 2>&1; then
    echo "✅ LLM service health check passed"
else
    echo "❌ LLM service health check failed"
fi

health=$(curl -s http://localhost:8084/api/v1/health)
if echo "$health" | jq -e '.status' > /dev/null 2>&1; then
    echo "✅ AI Advisor service health check passed"
else
    echo "❌ AI Advisor service health check failed"
fi

echo ""
echo "✨ Testing complete!"
