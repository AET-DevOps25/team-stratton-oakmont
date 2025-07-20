# AI Advisor Service

The AI Advisor Service acts as a gateway between the frontend and the LLM Inference Service, providing intelligent study planning advice and course recommendations for TUM students.

## 🎯 Purpose

This service serves as the main interface for AI-powered features in the TUM Study Planner, orchestrating requests to the LLM Inference Service and providing structured responses to the frontend.

## 🏃‍♂️ Running the Service

### Local Development

```bash
# Navigate to service directory
cd server/ai-advisor-service

# Run with Gradle
./gradlew bootRun

# Or build and run JAR
./gradlew build
java -jar build/libs/ai-advisor-service-*.jar
```

### Docker

```bash
# Build image
docker build -t ai-advisor-service .

# Run container
docker run -p 8082:8082 -p 9082:9082 ai-advisor-service
```

### With Docker Compose

```bash
# From project root
docker-compose -f docker-compose.test.yml up ai-advisor-service
```

### Documentation

- **Swagger UI**: http://localhost:8082/api/v1/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8082/api/v1/api-docs


## 📊 Monitoring

### Metrics Endpoint

- **Internal**: http://ai-advisor-service:9082/actuator/prometheus
- **Health**: http://localhost:8082/api/v1/actuator/health

## 🧪 Testing

```bash
# Run tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```
