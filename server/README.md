# TUM Study Planner - Backend Services

This directory contains all backend services for the TUM Study Planner application. The backend is built using a microservices architecture with Spring Boot (Java) and FastAPI (Python) services.

## 🏗️ Architecture Overview

The backend consists of 5 main services that work together to provide comprehensive study planning functionality:

```mermaid
graph TD
    A[Frontend] --> B[User Auth Service]
    A --> C[AI Advisor Service]
    A --> D[Study Plan Service]
    A --> E[Program Catalog Service]

    C --> F[LLM Inference Service]
    D --> B
    D --> E
    F --> E

    B --> G[(user_auth DB)]
    D --> H[(study_plan DB)]
    E --> I[(study_data DB)]
    F --> J[(Weaviate Vector DB)]
```

## 📋 Services Overview

| Service                     | Port | Tech Stack                                       | Purpose                                                  | Database                          | Key Features                                                                       | Documentation                                    |
| --------------------------- | ---- | ------------------------------------------------ | -------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Program Catalog Service** | 8080 | Spring Boot (Java) + PostgreSQL                  | Central repository for TUM's academic catalog            | `study_data` (PostgreSQL)         | Study programs, course catalog, module details, prerequisites, advanced search     | [📖 README](./program-catalog-service/README.md) |
| **Study Plan Service**      | 8081 | Spring Boot (Java) + PostgreSQL + JWT            | Personalized study plan management and progress tracking | `study_plan` (PostgreSQL)         | Study plan CRUD, semester organization, progress tracking, validation              | [📖 README](./study-plan-service/README.md)      |
| **AI Advisor Service**      | 8082 | Spring Boot (Java) + WebFlux                     | Gateway for AI-powered study planning advice             | None (Gateway)                    | AI chat interface, course recommendations, LLM integration, response caching       | [📖 README](./ai-advisor-service/README.md)      |
| **User Auth Service**       | 8083 | Spring Boot (Java) + PostgreSQL + JWT + BCrypt   | User authentication and authorization management         | `user_auth` (PostgreSQL)          | User registration, JWT tokens, password security, role-based access, audit logging | [📖 README](./user-auth-service/README.md)       |
| **LLM Inference Service**   | 8084 | FastAPI (Python) + Weaviate + OpenAI + LangChain | AI/ML processing for course recommendations and chat     | Weaviate (Vector DB) + PostgreSQL | Semantic search, RAG pipeline, conversational AI, multi-language support           | [📖 README](./llm-inference-service/README.md)   |

## 🔧 Development Setup

### Prerequisites

- **Java 17+** (for Spring Boot services)
- **Python 3.9+** (for LLM service)
- **PostgreSQL 13+** (for databases)
- **Docker & Docker Compose** (for containerized deployment)
- **Gradle 7.x+** (build tool)

### Quick Start

#### 1. Using Docker Compose (Recommended)

```bash
# From project root
cd team-stratton-oakmont

# Start all services
docker-compose -f docker-compose.test.yml up -d --build

# Check service status
docker-compose ps
```

#### 2. Individual Service Development

```bash
# Start databases first (Docker)
docker-compose -f docker-compose.test.yml up -d postgres-study-data postgres-study-plan postgres-user-auth weaviate

# Start each service individually
cd server

# Program Catalog Service
./gradlew :program-catalog-service:bootRun

# Study Plan Service
./gradlew :study-plan-service:bootRun

# AI Advisor Service
./gradlew :ai-advisor-service:bootRun

# User Auth Service
./gradlew :user-auth-service:bootRun

# LLM Inference Service
cd llm-inference-service
pip install -r requirements.txt
python main.py
```

### Environment Configuration

Create environment files for each service:

#### Spring Boot Services (.env files)

```bash
# Database configurations
DB_STUDY_DATA_URL=jdbc:postgresql://localhost:5432/study_data
DB_STUDY_DATA_USERNAME=your_username
DB_STUDY_DATA_PASSWORD=your_password

DB_STUDY_PLAN_URL=jdbc:postgresql://localhost:5432/study_plan
DB_STUDY_PLAN_USERNAME=your_username
DB_STUDY_PLAN_PASSWORD=your_password

DB_USER_AUTH_URL=jdbc:postgresql://localhost:5432/user_auth
DB_USER_AUTH_USERNAME=your_username
DB_USER_AUTH_PASSWORD=your_password

# Security
JWT_SECRET=your-256-bit-secret-key-for-jwt-tokens
```

#### LLM Service (.env file)

```bash
# AI/ML Configuration
OPENAI_API_KEY=your-openai-api-key
WEAVIATE_URL=http://localhost:8000
DB_STUDY_DATA_URL=postgresql://username:password@localhost:5432/study_data
DB_STUDY_DATA_USERNAME=your_username
DB_STUDY_DATA_PASSWORD=your_password
```

## 🌐 Service URLs

### API Documentation (Swagger)

- **Program Catalog**: http://localhost:8080/api/v1/swagger-ui.html
- **Study Plan**: http://localhost:8081/api/v1/swagger-ui.html
- **AI Advisor**: http://localhost:8082/api/v1/swagger-ui.html
- **User Auth**: http://localhost:8083/api/v1/swagger-ui.html

### Monitoring Endpoints (Internal)

- **Program Catalog**: http://localhost:9080/actuator/prometheus
- **Study Plan**: http://localhost:9081/actuator/prometheus
- **AI Advisor**: http://localhost:9082/actuator/prometheus
- **User Auth**: http://localhost:9083/actuator/prometheus

## 📊 Monitoring & Observability

### Prometheus Metrics

All Spring Boot services expose metrics via Actuator:

```yaml
# Key metrics collected
- HTTP request rates and latencies
- Database connection pool status
- JVM memory and GC metrics
- Custom business metrics
- Error rates and success rates
```

## 🧪 Testing

### Running Tests

```bash
# All Java services
./gradlew test

# Individual service tests
./gradlew :program-catalog-service:test
./gradlew :study-plan-service:test
./gradlew :ai-advisor-service:test
./gradlew :user-auth-service:test

# Python service tests
cd llm-inference-service
python -m pytest tests/
```

### Integration Testing

```bash
# Test service connectivity
curl http://localhost:8080/api/v1/study-programs
curl http://localhost:8083/api/v1/auth/register -d '{"username":"test","email":"test@example.com","password":"Test123!"}'
```

## 📚 Additional Resources

- **Individual Service READMEs**: Each service directory contains detailed documentation
- **API Documentation**: Available via Swagger UI endpoints
