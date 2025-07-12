# AI Chat Feature Implementation

This document describes the implementation of the AI chat feature for course-specific Q&A.

## Overview

The AI chat feature allows students to ask natural language questions about TUM courses and get relevant answers derived from official course data.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │───▶│  AI Advisor      │───▶│ LLM Inference   │
│   (Frontend)    │    │  Service (Java)  │    │ Service (Python)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Weaviate Vector │
                                                │   Database      │
                                                └─────────────────┘
```

## Components

### 1. Frontend (React)
- **AiChatSidebar**: Enhanced chat interface with course code highlighting, confidence scores, and source links
- **API Integration**: Type-safe API client for communication with backend services

### 2. AI Advisor Service (Java Spring Boot)
- **Gateway Service**: Routes requests between frontend and LLM inference service
- **Error Handling**: Provides fallback responses when services are unavailable
- **Health Monitoring**: Monitors the health of downstream services

### 3. LLM Inference Service (Python FastAPI)
- **RAG Pipeline**: Retrieval-Augmented Generation using LangChain
- **Vector Database**: Weaviate for storing and searching course embeddings
- **Course Extraction**: Automatic detection of course codes in questions and responses
- **Confidence Scoring**: Provides confidence scores based on retrieval relevance

### 4. Vector Database (Weaviate)
- **Course Data Storage**: Stores embedded course descriptions and metadata
- **Similarity Search**: Enables semantic search across course content
- **Scalable Indexing**: Efficient storage and retrieval of course information

## Features Implemented

### ✅ Natural Language Q&A
- Students can ask questions about specific courses using natural language
- AI correctly identifies course codes mentioned in questions (e.g., "IN2003", "Introduction to C++")
- Provides relevant answers from indexed TUM course data

### ✅ Course Code Detection
- Automatic extraction of course codes from questions and responses
- Support for multiple course code formats (IN2003, MGTHN0131, etc.)
- Visual highlighting of detected courses in the chat interface

### ✅ Confidence Scoring
- AI provides confidence scores based on retrieval relevance
- Scores help users understand the reliability of responses
- Low confidence triggers clear disclaimers

### ✅ Source Attribution
- Direct links to official TUM course pages
- Transparent sourcing of information
- Limited to top 3 most relevant sources per response

### ✅ Fallback Handling
- Graceful degradation when AI services are unavailable
- Clear error messages when specific information cannot be found
- Maintains chat functionality even with reduced features

### ✅ Performance Optimization
- Response times under 5 seconds for most queries
- Efficient vector search with similarity thresholds
- Caching of frequently accessed course data

## API Endpoints

### AI Advisor Service (`localhost:8084`)
```
POST /api/v1/chat
GET  /api/v1/course/{courseCode}
GET  /api/v1/health
```

### LLM Inference Service (`localhost:8082`)
```
POST /chat/
GET  /course/{courseCode}
GET  /health
```

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- OpenAI API key
- Node.js 18+ (for frontend development)
- Java 17+ (for backend development)

### Environment Setup

1. **Create environment file:**
```bash
cp server/llm-inference-service/.env.example server/llm-inference-service/.env
```

2. **Add your OpenAI API key:**
```bash
# Edit server/llm-inference-service/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### Development Setup

1. **Start AI services:**
```bash
docker-compose -f docker-compose.ai.yml up -d
```

2. **Start the frontend:**
```bash
cd client
npm install
npm run dev
```

3. **Monitor service health:**
```bash
# Check Weaviate
curl http://localhost:8080/v1/meta

# Check LLM Inference Service
curl http://localhost:8082/health

# Check AI Advisor Service
curl http://localhost:8084/api/v1/health
```

### Testing the Feature

1. **Open the application** in your browser
2. **Click the AI chat icon** in the top-right corner
3. **Ask a course-related question**, for example:
   - "What programming languages are used in IN2003?"
   - "Tell me about the Machine Learning course"
   - "What are the prerequisites for Advanced Algorithms?"

## Data Flow

1. **User Input**: Student types a question in the chat interface
2. **Frontend Processing**: React app sends request to AI Advisor Service
3. **Service Routing**: AI Advisor Service forwards request to LLM Inference Service
4. **Vector Search**: LLM service queries Weaviate for relevant course data
5. **LLM Processing**: OpenAI generates response using retrieved context
6. **Response Enhancement**: System extracts course codes, calculates confidence, and adds sources
7. **UI Display**: Frontend displays response with enhanced metadata

## Data Sources

- **Course Catalog**: `/data-collection/csv_tables/courses.csv`
- **Course Descriptions**: Official TUM course descriptions and syllabi
- **Metadata**: Semester information, ECTS credits, prerequisites, etc.

## Known Limitations

1. **Data Freshness**: Course data needs manual updates from TUM systems
2. **Language Support**: Primarily optimized for English queries
3. **Complex Queries**: May struggle with multi-course comparisons or complex academic planning
4. **Hallucination Risk**: AI may occasionally provide inaccurate information despite RAG

## Future Enhancements

- [ ] Integration with real-time TUM course API
- [ ] Support for study plan generation
- [ ] Prerequisite chain visualization
- [ ] Multi-language support (German)
- [ ] Advanced course recommendation engine
- [ ] Integration with student academic records

## Troubleshooting

### Common Issues

1. **"AI is unavailable"**: Check if all services are running and OpenAI API key is valid
2. **Slow responses**: Verify Weaviate database is populated with course data
3. **No course codes detected**: Ensure question mentions specific course identifiers
4. **Low confidence scores**: May indicate insufficient course data or unclear questions

### Debug Commands

```bash
# Check service logs
docker-compose -f docker-compose.ai.yml logs llm-inference
docker-compose -f docker-compose.ai.yml logs weaviate

# Verify course data loading
curl http://localhost:8082/health

# Test direct API calls
curl -X POST http://localhost:8082/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is IN2003 about?"}'
```
