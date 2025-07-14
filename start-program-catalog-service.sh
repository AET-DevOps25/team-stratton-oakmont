#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Start the program-catalog-service
cd server
./gradlew :program-catalog-service:bootRun
