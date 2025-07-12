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

How to start the server:

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

> What is the core purpose of this app?  
> _Describe the key features and the problem it solves._

## 🎯 Intended Users

> Who will use this app?  
> _Define the target audience and their needs._

## 🤖 Integration of GenAI

> How is Generative AI integrated meaningfully?  
> _Explain the role of GenAI in enhancing user experience or solving problems._

## 💡 Example Scenarios

> How does the app work in real-world use cases?  
> _List 2–3 example scenarios or workflows to demonstrate functionality._

## 🛠 Tech Stack

_List key technologies and frameworks used._

- **Frontend**: React + TypeScript + Vite + Material-UI
- **Backend**: Spring Boot (Java) + Gradle
- **AI Service**: Python + FastAPI
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
