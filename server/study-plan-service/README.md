# Study Plan Service

The Study Plan Service manages personalized study plans for TUM students, allowing them to create, modify, and track their academic progress through semesters and courses. It provides comprehensive study planning and progress tracking capabilities.

## 🎯 Purpose

This service enables students to:

- Create and manage personalized study plans
- Track academic progress across semesters
- Add and remove courses from their study timeline
- Monitor completion status and requirements


## 🔧 Configuration

### Environment Variables

| Variable                 | Description             | Default |
| ------------------------ | ----------------------- | ------- |
| `DB_STUDY_PLAN_URL`      | PostgreSQL database URL | -       |
| `DB_STUDY_PLAN_USERNAME` | Database username       | -       |
| `DB_STUDY_PLAN_PASSWORD` | Database password       | -       |
| `JWT_SECRET`             | JWT signing secret      | -       |
| `SERVER_PORT`            | Service port            | `8081`  |


## 🏃‍♂️ Running the Service

### Local Development

```bash
# Navigate to service directory
cd server/study-plan-service

# Set environment variables
export DB_STUDY_PLAN_URL="jdbc:postgresql://localhost:5432/study_plan"
export DB_STUDY_PLAN_USERNAME="your_username"
export DB_STUDY_PLAN_PASSWORD="your_password"
export JWT_SECRET="your-jwt-secret-key"

# Run with Gradle
./gradlew bootRun

# Or build and run JAR
./gradlew build
java -jar build/libs/study-plan-service-*.jar
```

### Docker

```bash
# Build image
docker build -t study-plan-service .

# Run container
docker run -p 8081:8081 -p 9081:9081 \
  -e DB_STUDY_PLAN_URL="jdbc:postgresql://db:5432/study_plan" \
  -e DB_STUDY_PLAN_USERNAME="username" \
  -e DB_STUDY_PLAN_PASSWORD="password" \
  -e JWT_SECRET="your-secret" \
  study-plan-service
```

### With Docker Compose

```bash
# From project root
docker-compose -f docker-compose.test.yml up study-plan-service
```

### Documentation

- **Swagger UI**: http://localhost:8081/api/v1/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8081/api/v1/api-docs

## 📊 Monitoring

### Metrics Endpoint

- **Internal**: http://study-plan-service:9081/actuator/prometheus
- **Health**: http://localhost:8081/api/v1/actuator/health

## 🧪 Testing

### Unit Tests

```bash
# Run tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```

### Integration Tests

```bash
# Run integration tests with H2
./gradlew integrationTest
```
