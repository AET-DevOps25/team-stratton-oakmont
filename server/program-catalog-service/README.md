# Program Catalog Service

The Program Catalog Service manages and provides access to TUM's academic program catalog, including study programs, courses, modules, and their detailed information. It serves as the central repository for all academic data.

## 🎯 Purpose

This service provides comprehensive access to TUM's academic catalog:

- Study program information and requirements
- Course details and descriptions
- Module information and relationships
- Prerequisites and academic dependencies


## 🔧 Configuration

### Environment Variables

| Variable                 | Description             | Default |
| ------------------------ | ----------------------- | ------- |
| `DB_STUDY_DATA_URL`      | PostgreSQL database URL | -       |
| `DB_STUDY_DATA_USERNAME` | Database username       | -       |
| `DB_STUDY_DATA_PASSWORD` | Database password       | -       |

## 🏃‍♂️ Running the Service

### Local Development

```bash
# Navigate to service directory
cd server/program-catalog-service

# Set environment variables
export DB_STUDY_DATA_URL="jdbc:postgresql://localhost:5432/study_data"
export DB_STUDY_DATA_USERNAME="your_username"
export DB_STUDY_DATA_PASSWORD="your_password"

# Run with Gradle
./gradlew bootRun

# Or build and run JAR
./gradlew build
java -jar build/libs/program-catalog-service-*.jar
```

### Docker

```bash
# Build image
docker build -t program-catalog-service .

# Run container
docker run -p 8080:8080 -p 9080:9080 \
  -e DB_STUDY_DATA_URL="jdbc:postgresql://db:5432/study_data" \
  -e DB_STUDY_DATA_USERNAME="username" \
  -e DB_STUDY_DATA_PASSWORD="password" \
  program-catalog-service
```

### With Docker Compose

```bash
# From project root
docker-compose -f docker-compose.test.yml up program-catalog-service
```
### Documentation

- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8080/api/v1/api-docs

## 📊 Monitoring

### Metrics Endpoint

- **Internal**: http://program-catalog-service:9080/actuator/prometheus
- **Health**: http://localhost:8080/api/v1/actuator/health

## 🧪 Testing

### Unit Tests

```bash
# Run tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```