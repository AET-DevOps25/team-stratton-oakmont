#!/bin/bash

# Import Weaviate Data Script
# This script imports the exported Weaviate data into a new instance

set -e

echo "📥 Importing Weaviate Data"
echo "=========================="

# Configuration
WEAVIATE_URL="http://localhost:8000"
EXPORT_DIR="/opt/tum-study-planner/weaviate-export"

# Wait for Weaviate to be ready
echo "⏳ Waiting for Weaviate to be ready..."
for i in {1..30}; do
    if curl -s "$WEAVIATE_URL/v1/meta" > /dev/null 2>&1; then
        echo "✅ Weaviate is ready"
        break
    fi
    echo "   Attempt $i/30: Waiting for Weaviate..."
    sleep 10
done

# Check if Weaviate is accessible
if ! curl -s "$WEAVIATE_URL/v1/meta" > /dev/null 2>&1; then
    echo "❌ Cannot connect to Weaviate at $WEAVIATE_URL"
    exit 1
fi

# Check if export data exists
if [ ! -f "$EXPORT_DIR/schema.json" ]; then
    echo "❌ Schema file not found: $EXPORT_DIR/schema.json"
    exit 1
fi

if [ ! -f "$EXPORT_DIR/TUMCourse_data.json" ]; then
    echo "❌ Data file not found: $EXPORT_DIR/TUMCourse_data.json"
    exit 1
fi

echo "✅ Export files found"

# Import schema
echo "📋 Importing schema..."
if curl -s -X POST "$WEAVIATE_URL/v1/schema" \
    -H "Content-Type: application/json" \
    -d @"$EXPORT_DIR/schema.json" > /dev/null 2>&1; then
    echo "✅ Schema imported successfully"
else
    echo "⚠️  Schema might already exist, continuing..."
fi

# Count objects to import
total_objects=$(cat "$EXPORT_DIR/TUMCourse_data.json" | jq '.objects | length')
echo "📊 Found $total_objects objects to import"

# Import objects in batches
echo "📥 Importing objects..."
batch_size=50
imported=0

# Extract objects array and split into batches
cat "$EXPORT_DIR/TUMCourse_data.json" | jq -c '.objects[]' | while read -r object; do
    # Import single object
    if curl -s -X POST "$WEAVIATE_URL/v1/objects" \
        -H "Content-Type: application/json" \
        -d "$object" > /dev/null 2>&1; then
        imported=$((imported + 1))
        if [ $((imported % 10)) -eq 0 ]; then
            echo "   Imported $imported/$total_objects objects..."
        fi
    else
        echo "   ⚠️  Failed to import object, continuing..."
    fi
done

echo "🎉 Data import completed!"
echo "📊 Imported objects for TUMCourse class"

# Verify import
echo "🔍 Verifying import..."
count=$(curl -s "$WEAVIATE_URL/v1/objects?class=TUMCourse&limit=1" | jq '.totalResults // 0')
echo "✅ Total objects in Weaviate: $count"

echo ""
echo "🎉 Weaviate data import completed successfully!"
