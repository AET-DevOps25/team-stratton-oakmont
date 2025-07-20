# User Auth Service

The User Auth Service handles user authentication, registration, and authorization for the TUM Study Planner application. It provides secure user management with JWT-based authentication and role-based access control.

## 🔧 Configuration

### Environment Variables

| Variable                | Description                       | Default          |
| ----------------------- | --------------------------------- | ---------------- |
| `DB_USER_AUTH_URL`      | PostgreSQL database URL           | -                |
| `DB_USER_AUTH_USERNAME` | Database username                 | -                |
| `DB_USER_AUTH_PASSWORD` | Database password                 | -                |
| `JWT_SECRET`            | JWT signing secret (min 256 bits) | -                |
| `JWT_EXPIRATION`        | Token expiration time in ms       | `86400000` (24h) |
| `BCRYPT_STRENGTH`       | BCrypt hashing strength           | `12`             |
| `SERVER_PORT`           | Service port                      | `8083`           |


## 🏃‍♂️ Running the Service

### Local Development

```bash
# Navigate to service directory
cd server/user-auth-service

# Set environment variables
export DB_USER_AUTH_URL="jdbc:postgresql://localhost:5432/user_auth"
export DB_USER_AUTH_USERNAME="your_username"
export DB_USER_AUTH_PASSWORD="your_password"
export JWT_SECRET="your-very-secure-secret-key-minimum-256-bits"

# Run with Gradle
./gradlew bootRun

# Or build and run JAR
./gradlew build
java -jar build/libs/user-auth-service-*.jar
```

### Docker

```bash
# Build image
docker build -t user-auth-service .

# Run container
docker run -p 8083:8083 -p 9083:9083 \
  -e DB_USER_AUTH_URL="jdbc:postgresql://db:5432/user_auth" \
  -e DB_USER_AUTH_USERNAME="username" \
  -e DB_USER_AUTH_PASSWORD="password" \
  -e JWT_SECRET="your-secure-secret" \
  user-auth-service
```

### With Docker Compose

```bash
# From project root
docker-compose -f docker-compose.test.yml up user-auth-service
```

### Documentation

- **Swagger UI**: http://localhost:8083/api/v1/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8083/api/v1/api-docs

## 🧪 Testing

### Unit Tests

```bash
# Run tests
./gradlew test

# Run with coverage
./gradlew test jacocoTestReport
```
