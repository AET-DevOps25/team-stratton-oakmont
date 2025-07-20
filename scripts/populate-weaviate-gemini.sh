#!/bin/bash

# Script to populate Weaviate with Gemini embeddings on AWS
# Run this after deployment to set up the vector database

echo "🔄 Populating Weaviate with Gemini embeddings on AWS..."

# SSH into the AWS instance and run the population script
KEY_FILE="${HOME}/.ssh/academy-session-1753031538.pem"
INSTANCE_IP=$(terraform output -raw instance_public_ip 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    echo "❌ Could not get instance IP. Make sure Terraform has been applied."
    exit 1
fi

echo "🌐 Connecting to AWS instance: $INSTANCE_IP"
echo "📁 Running Gemini population script..."

ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$INSTANCE_IP << 'EOF'
# Navigate to the LLM service directory
cd /home/ec2-user/team-stratton-oakmont/server/llm-inference-service

# Check if the Gemini population script exists
if [ ! -f "populate_weaviate_gemini.py" ]; then
    echo "❌ populate_weaviate_gemini.py not found. Make sure the latest code is deployed."
    exit 1
fi

# Install additional dependencies if needed
docker exec llm-inference-service pip install langchain-google-genai --quiet

# Run the Gemini population script inside the container
echo "🚀 Starting Gemini embedding population..."
docker exec -e GEMINI_API_KEY="$GEMINI_API_KEY" \
           -e WEAVIATE_HOST="weaviate" \
           -e WEAVIATE_PORT="8080" \
           -e STUDY_DATA_DB_HOST="study-data-db" \
           -e STUDY_DATA_DB_PORT="5432" \
           -e STUDY_DATA_DB_NAME="study_data_db" \
           -e STUDY_DATA_DB_USER="study_data_user" \
           -e STUDY_DATA_DB_PASSWORD="password" \
           llm-inference-service python populate_weaviate_gemini.py

echo "✅ Gemini embedding population completed!"
EOF

echo "🎉 Weaviate population with Gemini embeddings complete!"
echo "💬 You can now test the chat with Gemini-powered embeddings."
