# 📱 TUM Study Planer powered by Stratton Oakmont

## 🚀 Getting Started

> _Instructions to run the app locally with Docker._

```bash
cd team-stratton-oakmont

# Start all services locally
docker-compose -f docker-compose.test.yml up -d --build

# Stop services
docker-compose -f docker-compose.test.yml down
```

**Local URLs:**

- Frontend: http://localhost:3000
- Program Catalog Service: http://localhost:8080
- Study Plan Service: http://localhost:8081
- AI Advisor Service: http://localhost:8082
- User Auth Service: http://localhost:8083
- LLM Service: http://localhost:8000

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

## Swagger Documentation of Services

<details>
<summary>Expand to explore our APIs</summary>

### Services and Their Documentation URLs

After starting each service, you can access their Swagger UI documentation at the following URLs:

### 1. Program Catalog Service

- **Port**: 8080
- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v1/api-docs
- **Description**: Provides access to TUM degree programs, modules, and course catalog information

### 2. User Authentication Service

- **Port**: 8083
- **Swagger UI**: http://localhost:8083/api/v1/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8083/api/v1/api-docs
- **Description**: Handles user authentication, registration, and JWT token management
- **Security**: JWT Bearer token authentication configured

### 3. Study Plan Service

- **Port**: 8081
- **Swagger UI**: http://localhost:8081/api/v1/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/api/v1/api-docs
- **Description**: Manages student study plans, course selections, and academic progress tracking
- **Security**: JWT Bearer token authentication configured

### 4. AI Advisor Service

- **Port**: 8082
- **Swagger UI**: http://localhost:8082/api/v1/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8082/api/v1/api-docs
- **Description**: Provides AI-powered academic advice and recommendations for study planning

## How to Use

1. **Start your services** using your preferred method (Docker, Gradle, etc.)
2. **Navigate to the Swagger UI URL** for the service you want to explore
3. **Explore the API endpoints** - you can see all available endpoints, request/response schemas, and try them out directly
4. **For authenticated endpoints** (User Auth and Study Plan services):
   - First authenticate through the User Auth Service
   - Copy the JWT token from the response
   - In the Swagger UI, click the "Authorize" button
   - Enter `Bearer <your-jwt-token>` in the authorization field

</details>

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

## 📄 License

_MIT, Apache 2.0, etc._
"""
