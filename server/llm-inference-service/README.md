# LLM Inference Service

The LLM Inference Service provides AI-powered course recommendations and study planning advice using Large Language Models and vector databases. It processes natural language queries and returns intelligent responses based on TUM's course catalog.

## 🎯 Purpose

This service handles all AI/ML operations for the TUM Study Planner, including:

- Natural language processing for course queries
- Vector similarity search for course recommendations
- LLM-powered study planning advice
- Course content analysis and matching

## 🔧 Configuration

### Environment Variables

| Variable                 | Description                        | Required           |
| ------------------------ | ---------------------------------- | ------------------ |
| `OPENAI_API_KEY`         | OpenAI API key for LLM access      | Yes                |
| `WEAVIATE_URL`           | Weaviate database URL              | Yes                |
| `WEAVIATE_API_KEY`       | Weaviate API key (if auth enabled) | No                 |
| `DB_STUDY_DATA_URL`      | PostgreSQL connection string       | Yes                |
| `DB_STUDY_DATA_USERNAME` | Database username                  | Yes                |
| `DB_STUDY_DATA_PASSWORD` | Database password                  | Yes                |


## 🏃‍♂️ Running the Service

### Local Development

```bash
# Navigate to service directory
cd server/llm-inference-service

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export WEAVIATE_URL="http://localhost:8000"
export DB_STUDY_DATA_URL="postgresql://user:pass@localhost:5432/study_data"

# Run the service
python main.py
```

### Docker

```bash
# Build image
docker build -t llm-inference-service .

# Run container
docker run -p 8084:8084 \
  -e OPENAI_API_KEY="your-key" \
  -e WEAVIATE_URL="http://weaviate:8000" \
  llm-inference-service
```

### With Docker Compose

```bash
# From project root
docker-compose -f docker-compose.test.yml up llm-inference-service
```

## 📊 Monitoring

### Prometheus Metrics

- `llm_requests_total` - Total number of LLM requests
- `llm_request_duration_seconds` - Request processing time
- `vector_search_duration_seconds` - Vector search performance
- `cache_hits_total` - Cache hit/miss statistics
- `weaviate_operations_total` - Database operation metrics


## 🧪 Testing

### Unit Tests

```bash
# Run tests
python -m pytest tests/

# With coverage
python -m pytest tests/ --cov=. --cov-report=html
```

### Integration Tests

```bash
# Test LLM integration
python test_auth_flow.py

# Test vector search
python -c "
from main import app
import requests
response = requests.post('http://localhost:8084/search-courses',
  json={'query': 'machine learning', 'limit': 3})
print(response.json())
"
```

## 🔧 Advanced Configuration

### LLM Settings

```python
# Model configuration
MODEL_NAME = "gpt-4"
MAX_TOKENS = 1000
TEMPERATURE = 0.7
```

### Vector Search Tuning

```python
# Search parameters
DEFAULT_SEARCH_LIMIT = 5
SIMILARITY_THRESHOLD = 0.7
VECTOR_DIMENSIONS = 1536  # OpenAI embedding size
```

### Caching Strategy

- **Embedding Cache**: Store frequently used embeddings
- **Response Cache**: Cache similar queries for better performance
- **TTL**: Configurable time-to-live for cached items
