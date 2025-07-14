#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Start the study-plan-service
cd server
./gradlew :study-plan-service:bootRun
