# Project Grading Checklist (100 Points Total)

This document outlines the grading criteria for the project. The total points available are 100, with an opportunity for up to 5 bonus points.

## ⚠️ Important!

If team contributions are not reasonably distributed, communication is not transparent, or you cannot confidently explain your work during the presentation, your project will be graded as failed.

---

### Overview of Categories

| Category                         | Points   |
| :------------------------------- | :------- |
| Functional Application           | 20       |
| GenAI Integration                | 10       |
| Containerization & Local Setup   | 10       |
| CI/CD & Deployment               | 20       |
| Monitoring & Observability       | 10       |
| Testing & Structured Engineering Process | 20       |
| Documentation & Weekly Reporting | 10       |
| Final Presentation               | Pass/Fail|
| Bonus                            | Up to +5 |

---

## 1. Functional Application (20 Points)

| Criteria                                                                    | Points |
| :-------------------------------------------------------------------------- | :----- |
| End-to-end functionality between all components (client, server, database)  | 6      |
| Smooth and usable user interface                                            | 4      |
| REST API is well-structured and matches functional needs                    | 4      |
| Server-side has at least 3 microservices                                    | 4      |
| Application topic is appropriately chosen and fits project objectives     | 2      |

## 2. GenAI Integration (10 Points)

| Criteria                                                          | Points |
| :---------------------------------------------------------------- | :----- |
| GenAI module is well-embedded and fulfills a real user-facing purpose | 4      |
| Implemented using LangChain and connects to cloud/local LLM       | 4      |
| Modularity of the GenAI logic as a microservice                   | 2      |

## 3. Containerization & Local Setup (10 Points)

| Criteria                                                                                                                                              | Points |
| :---------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| Each component is containerized and runnable in isolation                                                                                             | 6      |
| `docker-compose.yml` enables local development and testing with minimal effort and provides sane defaults (no complex env setup required) | 4      |

## 4. CI/CD & Deployment (20 Points)

| Criteria                                                                                                 | Points |
| :------------------------------------------------------------------------------------------------------- | :----- |
| CI pipeline with build, test, and Docker image generation via GitHub Actions                             | 8      |
| CD pipeline set up to automatically deploy to Kubernetes on every merge                                  | 6      |
| Deployment works on our infrastructure or Cloud, alternative Kubernetes environments (e.g., Minikube, TUM Infra, Azure) | 6      |

## 5. Monitoring & Observability (10 Points)

| Criteria                                          | Points |
| :------------------------------------------------ | :----- |
| Prometheus integrated and collecting meaningful metrics | 4      |
| Grafana dashboards for system behavior visualization  | 4      |
| At least one alert rule set up                    | 2      |

## 6. Testing & Structured Engineering Process (20 Points)

| Criteria                                                                                                                                       | Points |
| :--------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| Test cases implemented for server/client and GenAI logic                                                                                       | 6      |
| Evidence of software engineering process: documented requirements, architecture models, such as top-level architecture, use case diagramm and analysis object model | 10     |
| Tests run automatically in CI and cover key functionality                                                                                      | 4      |

## 7. Documentation & Weekly Reporting (10 Points)

| Criteria                                                                                                                                                                                                                                 | Points |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| `README.md` or Wiki includes setup instructions, architecture overview, usage guide, and a clear mapping of student responsibilities                                                                                           | 2      |
| Documentation of CI/CD setup, and GenAI usage included                                                                                                                                                                                 | 2      |
| Deployment and local setup instructions are clear, reproducible, and platform-specific (e.g. commands for local setup, with sane defaults)                                                                                             | 2      |
| Subsystems have documented interfaces (API-driven deployment, e.g., Swagger/OpenAPI)                                                                                                                                                 | 2      |
| Monitoring instructions included in the documentation and exported as files                                                                                                                                                            | 2      |

## 8. Final Presentation (Pass/Fail)

| Criteria                                                              |
| :-------------------------------------------------------------------- |
| All students present their own subsystem                              |
| Live demo of application and DevOps setup                             |
| Team reflects on what worked well, what didn't, and answers follow-up technical questions |

## 🏅 Bonus Points (up to +5)

| Criteria                                                                       | Points |
| :----------------------------------------------------------------------------- | :----- |
| Advanced Kubernetes use (e.g., self-healing, custom operators, auto-scaling)   | +1     |
| Full RAG pipeline implementation (with vector DB like Weaviate)                | +1     |
| GenAI served with self-hosted LLMs in Kubernetes or via external API (e.g., GPT-4.1 nano in Azure via Llama.cpp) | +1     |
| Real-world-grade observability (e.g., log aggregation, tracing)                | +1     |
| Beautiful, original UI or impactful project topic                              | +1     |