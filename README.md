# 📱 TUM Study Planer powered by Stratton Oakmont

## 🚀 Getting Started

> _Instructions to run the app locally with Docker._

```bash
cd team-stratton-oakmont

# Create shared network (only needed once)
docker network create stratton-oakmont-network

# Start monitoring stack (independent, keeps historical data)
docker-compose -f docker-compose.monitoring.yml up -d

# Start application services
docker-compose -f docker-compose.test.yml up -d --build

# Stop application services (monitoring keeps running)
docker-compose -f docker-compose.test.yml down

# Stop monitoring stack (if needed)
docker-compose -f docker-compose.monitoring.yml down
```

**Local URLs:**

- Frontend: http://localhost:3000
- Program Catalog Service: http://localhost:8080
- Study Plan Service: http://localhost:8081
- AI Advisor Service: http://localhost:8082
- User Auth Service: http://localhost:8083
- LLM Service: http://localhost:8000

### 🤖 AI Chat Feature Setup

> _For the AI-powered course Q&A feature._

```bash
# Quick setup for AI chat functionality
./scripts/setup-ai-chat.sh

# Test the AI chat feature
./scripts/test-ai-chat.sh
```

**AI Service URLs:**

- Weaviate Vector DB: http://localhost:8080
- LLM Inference Service: http://localhost:8082
- AI Advisor Gateway: http://localhost:8084

> **Note:** You'll need an OpenAI API key for the AI chat feature. See `AI_CHAT_IMPLEMENTATION.md` for detailed setup instructions.

**Monitoring & Observability:**

- Prometheus (Metrics): http://localhost:9090
- Grafana (Dashboards): http://localhost:3001 (credentials in .env file)
- Loki (Logs): http://localhost:3100

  \*This is just the API endpoint. If you visit http://localhost:3100/ready or http://localhost:3100/metrics, you should see responses instead of 404.

- Promtail (Log Collector): http://localhost:9084

Prometheus automatically scrapes metrics from all Spring Boot services via internal management ports. The actuator endpoints are secured and only accessible within the Docker network:

- Program Catalog Service: Internal port 9080 (`/actuator/prometheus`)
- Study Plan Service: Internal port 9081 (`/actuator/prometheus`)
- AI Advisor Service: Internal port 9082 (`/actuator/prometheus`)
- User Auth Service: Internal port 9083 (`/actuator/prometheus`)

_Note: These management endpoints are not exposed to the host machine for security reasons. Metrics are collected automatically by Prometheus and can be viewed in Grafana dashboards._

### 📊 Monitoring & Observability

The development environment includes a comprehensive monitoring stack:

- **Prometheus** scrapes metrics from all Spring Boot services via Actuator endpoints
- **Grafana** provides pre-configured dashboards for visualizing system metrics and logs
- **Loki** aggregates logs from all containers for centralized log management
- **Promtail** collects and ships container logs to Loki
- **Alerts** are configured for service downtime, high response times, and error rates

**Security Features:**

- Management endpoints (actuator) are only accessible within the Docker network
- External users cannot access monitoring/health endpoints directly
- Main application APIs remain publicly accessible for legitimate use

All monitoring services can be started independently and provide real-time insights into application performance and health. In development, monitoring runs alongside the application services, while in production, monitoring is deployed as a separate stack for better resource isolation.

**Production Note:** In production deployments, monitoring services are deployed separately for better resource isolation and scalability. Use the dedicated `docker-compose.monitoring.yml` file alongside your production stack.

### 🏭 Production Deployment (Local/Docker)

> _Deploy the complete stack including monitoring for production._

```bash
# Deploy complete stack with monitoring (recommended for production)
./scripts/deploy-with-monitoring.sh

# Clean up everything including monitoring
./scripts/destroy-with-monitoring.sh
```

**What the production scripts do:**

- 🔗 Creates shared Docker network for service communication
- 📊 Starts monitoring stack first (Prometheus, Grafana, Loki, Promtail)
- 🏗️ Deploys all application services in production mode
- 🔒 Keeps management endpoints secure (internal network only)
- 📈 Ensures monitoring is ready to collect metrics from service startup

**Alternative: Manual Production Deployment**

```bash
# Create network and start monitoring
docker network create stratton-oakmont-network
docker-compose -f docker-compose.monitoring.yml up -d

# Start production application services
docker-compose -f docker-compose.prod.yml up -d --build
```

### ☁️ AWS Deployment

> _One-command deployment to AWS Academy._

```bash
# Deploy complete infrastructure and application
./scripts/deploy.sh

# Clean up resources when done
./scripts/destroy.sh
```

**What the deploy script does:**

- 🏗️ Creates AWS EC2 instance with Terraform
- 🎭 Deploys application with Ansible
- 🐳 Builds and runs all services in Docker
- 📊 Deploys monitoring stack (Prometheus, Grafana, Loki, Promtail)
- 🌐 Sets up nginx reverse proxy with CORS

### 🛠️ Manual Development (Alternative)

<details>
<summary>Click to expand manual startup instructions</summary>

How to start the frontend:

```bash
# start frontend (localhost:3000)
cd client
npm install
npm run dev
```

How to start the backend services (recommended - uses .env file automatically):

```bash
# start program-catalog-service (localhost:8080)
./start-program-catalog-service.sh
```

New terminal window:

```bash
# start study-plan-service (localhost:8081)
./start-study-plan-service.sh
```

New terminal window:

```bash
# start ai-advisor-service (localhost:8082)
./start-ai-advisor-service.sh
```

New terminal window:

```bash
# start user-auth-service (localhost:8083)
./start-user-auth-service.sh
```

**Alternative: Manual gradlew commands (requires environment variables):**

```bash
# start program-catalog-service (localhost:8080)
cd server
./gradlew :program-catalog-service:bootRun
```

New terminal window:

```bash
# start study-plan-service (localhost:8081)
cd server
./gradlew :study-plan-service:bootRun
```

New terminal window:

```bash
# start ai-advisor-service (localhost:8082)
cd server
./gradlew :ai-advisor-service:bootRun
```

New terminal window:

```bash
# start user-auth-service (localhost:8083)
cd server
./gradlew :user-auth-service:bootRun
```

New terminal window:

```bash
# start llm-service (localhost:8000)
cd llm-service
pip install -r requirements.txt
python app.py
```

</details>
```

## 🧩 Main Functionality

The TUM Study Planner is a comprehensive academic planning tool for Technical University Munich students. The core purpose is to help students:

- **Plan their study program** with course selection and scheduling
- **Get AI-powered academic advice** through natural language Q&A
- **Explore course catalog** with detailed course information
- **Track degree progress** and ensure requirement fulfillment

### 🤖 AI Chat Feature

Ask questions about TUM courses in natural language and get intelligent responses:

- _"What programming languages are used in IN2003?"_
- _"Tell me about Machine Learning courses at TUM"_
- _"What are the prerequisites for Advanced Algorithms?"_

The AI extracts course codes, provides confidence scores, and links to official TUM course pages.

## 🎯 Intended Users

**Primary Users:** M.Sc. Information Systems students at TUM

- Need help with course selection and academic planning
- Want quick access to course information without navigating complex systems
- Benefit from AI-powered guidance for study decisions

**Secondary Users:** Academic advisors and TUM faculty

- Can leverage the system for student counseling
- Access comprehensive course data in an accessible format

## 🤖 Integration of GenAI

Generative AI is meaningfully integrated through a **Retrieval-Augmented Generation (RAG) pipeline**:

### Core AI Features:

- **Natural Language Understanding**: Parses student questions about courses and academic planning
- **Course-Specific Q&A**: Provides accurate answers using official TUM course data
- **Intelligent Course Detection**: Automatically identifies course codes in questions and responses
- **Confidence Scoring**: Rates response reliability based on data retrieval quality
- **Source Attribution**: Links answers to official TUM course pages for verification

### Technical Implementation:

- **Vector Database (Weaviate)**: Stores embedded course descriptions for semantic search
- **LangChain RAG**: Combines retrieval with OpenAI GPT for contextual responses
- **Real-time Processing**: Answers within 5 seconds with course-specific information
- **Fallback Handling**: Graceful degradation when AI services are unavailable

## 💡 Example Scenarios

### Scenario 1: Course Content Inquiry

**Student Question:** _"What programming languages are mainly used in the 'Introduction to C++' course?"_

**AI Response:** The AI identifies course code IN0001, retrieves course description from the vector database, and responds: _"The Introduction to C++ course (IN0001) primarily focuses on C++ programming language fundamentals, including object-oriented programming concepts, memory management, and STL libraries."_

**Enhanced Features:** Course code highlighted, confidence score displayed, link to official TUM course page provided.

### Scenario 2: Study Planning Assistance

**Student Question:** _"I'm interested in Machine Learning. What courses should I take?"_

**AI Response:** The AI searches for ML-related courses, identifies relevant options like "Machine Learning" (IN2064), "Deep Learning" (IN2346), provides course descriptions, prerequisites, and semester information.

**Enhanced Features:** Multiple course codes detected, prerequisite chains explained, study sequence recommendations.

### Scenario 3: Prerequisite Checking

**Student Question:** _"What do I need to complete before taking Advanced Algorithms?"_

**AI Response:** The AI identifies the Advanced Algorithms course, retrieves prerequisite information, and explains the required prior coursework and knowledge areas.

**Enhanced Features:** Prerequisite course codes highlighted, academic planning guidance provided.

## 🛠 Tech Stack

_Key technologies and frameworks used._

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: Spring Boot (Java) + Gradle
- **AI Gateway**: Java Spring Boot (AI Advisor Service)
- **AI/ML Service**: Python + FastAPI + LangChain + OpenAI
- **Vector Database**: Weaviate (for semantic search)
- **Database**: PostgreSQL (in production)
- **Infrastructure**: AWS EC2 + Terraform + Ansible
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **GenAI API**: OpenAI GPT (via Python service)
- **Monitoring**: Prometheus + Grafana + Loki + Promtail
- **Observability**: Spring Boot Actuator (includes Micrometer for metrics)

## 📄 License

_MIT, Apache 2.0, etc._
"""
