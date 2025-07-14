#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Start the ai-advisor-service
cd server
./gradlew :ai-advisor-service:bootRun
