import os
import re
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import weaviate
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Weaviate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from database_connector import db_connector
from langchain_google_genai import ChatGoogleGenerativeAI


from fastapi import FastAPI
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time


# Load environment variables
load_dotenv()

class WeaviateCourseStore:
    """Custom Weaviate wrapper for TUM courses"""
    
    def __init__(self, client, embedding):
        self.client = client
        self.embedding = embedding
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict]:
        """Perform similarity search for courses"""
        try:
            # Generate query vector
            query_vector = self.embedding.embed_query(query)

            # Use Weaviate v4 API
            collection = self.client.collections.get("TUMCourse")
            result = collection.query.near_vector(
                near_vector=query_vector,
                limit=k,
                return_metadata=['certainty']
            )

            # Convert to expected format
            documents = []
            for obj in result.objects:
                course = obj.properties
                certainty = getattr(obj.metadata, 'certainty', 0) if hasattr(obj, 'metadata') else 0
                doc = type('Document', (), {
                    'page_content': course.get('content', ''),
                    'metadata': {
                        'category': course.get('category'),
                        'subcategory': course.get('subcategory'),
                        'module_id': course.get('module_id'),
                        'name': course.get('name'),
                        'credits': course.get('credits'),
                        'responsible': course.get('responsible'),
                        'module_level': course.get('module_level'),
                        'occurrence': course.get('occurrence'),
                        'description_of_achievement_and_assessment_methods': course.get('description_of_achievement_and_assessment_methods'),
                        'intended_learning_outcomes': course.get('intended_learning_outcomes'),
                        'content': course.get('content', ''),
                        'certainty': certainty
                    }
                })()
                documents.append(doc)

            return documents

        except Exception as e:
            print(f"Error in similarity search: {e}")
            return []
    
    def as_retriever(self, search_type=None, search_kwargs=None):
        """Return a retriever interface. Accepts search_type for compatibility but ignores it."""
        if search_kwargs is None:
            search_kwargs = {"k": 5}

        from langchain.schema.retriever import BaseRetriever
        from typing import Any, Dict, List

        class Retriever(BaseRetriever):
            store: Any = None
            search_kwargs: Dict[str, Any] = {}

            def __init__(self, store, search_kwargs):
                super().__init__()
                object.__setattr__(self, 'store', store)
                object.__setattr__(self, 'search_kwargs', search_kwargs)

            def _get_relevant_documents(self, query: str) -> List[Any]:
                return self.store.similarity_search(query, **self.search_kwargs)

        return Retriever(self, search_kwargs)


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing RAG system...")
    rag_ready = False
    if setup_weaviate():
        print("Weaviate connected successfully")
        if setup_qa_chain():
            print("QA chain setup successful")
            print("✅ RAG system ready! Using pre-populated Weaviate database.")
            rag_ready = True
        else:
            print("Failed to setup QA chain")
    else:
        print("Failed to setup Weaviate")
        print("💡 Tip: Make sure Weaviate is running and populated with: python populate_weaviate.py")
    yield

app = FastAPI(title="LLM Inference Service with RAG", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None  # Add user context

class ChatResponse(BaseModel):
    response: str
    module_ids: List[str] = []

class CourseInfo(BaseModel):
    module_id: str
    name: str
    content: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    credits: Optional[int] = None
    responsible: Optional[str] = None
    module_level: Optional[str] = None
    occurrence: Optional[str] = None
    description_of_achievement_and_assessment_methods: Optional[str] = None
    intended_learning_outcomes: Optional[str] = None
    certainty: Optional[float] = None

# Global variables for RAG components
weaviate_client = None
vector_store = None
qa_chain = None
embeddings = None

def extract_course_codes(text: str) -> List[str]:
    """Extract course codes from text using regex patterns"""
    patterns = [
        r'\b(IN\d{4})\b',  # Pattern for IN followed by 4 digits
        r'\b([A-Z]{2,4}\d{4}[A-Z]?)\b',  # General pattern for course codes
        r'\b(\d{10})\b',  # Numeric course codes
    ]
    
    course_codes = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        course_codes.extend([match.upper() for match in matches])
    
    return list(set(course_codes))  # Remove duplicates

def load_course_data():
    """Load course data from PostgreSQL database or CSV fallback"""
    return db_connector.get_course_data()

def setup_weaviate():
    """Initialize Weaviate client and vector store"""
    global weaviate_client, vector_store, embeddings
    
    try:
        import weaviate
        weaviate_host = os.getenv("WEAVIATE_HOST", "localhost")
        weaviate_port = int(os.getenv("WEAVIATE_PORT", "8080"))
        weaviate_grpc_port = int(os.getenv("WEAVIATE_GRPC_PORT", "50051"))
        # Use connect_to_local for robust local/K8s connection
        weaviate_client_local = weaviate.connect_to_local(
            host=weaviate_host,
            port=weaviate_port,
            grpc_port=weaviate_grpc_port
        )
        # Assign to global
        global weaviate_client, embeddings, vector_store
        weaviate_client = weaviate_client_local

        # Use Gemini embeddings
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

        # Check if TUMCourse schema exists
        schema = weaviate_client.collections.list_all()
        if "TUMCourse" not in schema:
            print("⚠️  TUMCourse schema not found in Weaviate!")
            print("Please run the population script first: python populate_weaviate.py")
            return False

        # Create a custom Weaviate wrapper for our schema
        vector_store = WeaviateCourseStore(
            client=weaviate_client,
            embedding=embeddings,
        )

        print("✅ Connected to populated Weaviate database")
        return True

    except Exception as e:
        print(f"Error setting up Weaviate: {e}")

def setup_qa_chain():
    """Setup the QA chain with custom prompt"""
    global qa_chain, vector_store
    
    if not vector_store:
        return False
    
    try:
        # Custom prompt template for course Q&A
        prompt_template = """
        You are an AI study advisor for Technical University Munich (TUM). Use the following course information to answer the student's question in a natural, conversational way.
        
        Context: {context}
        
        Question: {question}
        
        Instructions:
        1. Write your response in a natural, conversational tone as if you're talking to a student
        2. Start with a brief, engaging summary of what the course is about
        3. For specific courses, structure your response naturally:
           - Begin with what the course covers (2-3 sentences)
           - Mention key details like ECTS credits, language, and level in a flowing manner
           - Highlight interesting or unique aspects of the course
           - Include practical information (prerequisites, assessment methods) when relevant
        4. Use connecting phrases and transitions to make the response flow naturally
        5. Avoid bullet points or overly structured lists - integrate information smoothly
        6. Always mention the course code, but work it into the conversation naturally
        7. If discussing programming languages or technical topics, explain them in context
        8. End with something helpful or encouraging when appropriate
        9. Keep the response informative but engaging, like a knowledgeable advisor would speak
        
        Answer:
        """
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Initialize Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-pro",
            temperature=0,
            max_tokens=None,
            max_retries=2
        )
        
        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5}
            ),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )
        
        return True
        
    except Exception as e:
        print(f"Error setting up QA chain: {e}")
        return False


@app.post("/chat/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Main chat endpoint with RAG functionality and study plan integration"""
    try:
        if not qa_chain:
            # Fallback to simple response if RAG is not available
            return ChatResponse(
                response="I'm currently unable to access the course database. Please try again later.",
                module_ids=[]
        )
        
        # Get user context if user_id is provided
        user_context = ""
        if request.user_id:
            study_plan = db_connector.get_user_study_plan(request.user_id)
            if study_plan:
                user_context = f"""
                User Context:
                - Degree Program: {study_plan['degree_program']}
                - Current Semester: {study_plan['current_semester']}
                - Completed Courses: {', '.join(study_plan['completed_courses'][:10])}
                - Planned Courses: {', '.join(study_plan['planned_courses'][:10])}
                
                Please consider this context when providing recommendations.
                """
        
        # Enhance the query with user context
        enhanced_query = f"{user_context}\n\nStudent Question: {request.message}" if user_context else request.message
        
        # Extract potential course codes from the question
        mentioned_codes = extract_course_codes(request.message)
        
        # Query the RAG system
        result = qa_chain({"query": enhanced_query})
        
        response_text = result["result"]
        
        # Extract course codes from the response and sources
        response_codes = extract_course_codes(response_text)
        all_codes = list(set(mentioned_codes + response_codes))
    
        # Enhance response with study plan recommendations if applicable
        if user_context and any(word in request.message.lower() for word in ['recommend', 'suggest', 'should take', 'plan']):
            response_text += "\n\n💡 Based on your study plan, I can provide more personalized recommendations if you'd like!"

        return ChatResponse(
            response=response_text,
            module_ids=all_codes
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/course/{course_code}")
async def get_course_info(course_code: str):
    """Get detailed information about a specific course"""
    try:
        df = load_course_data()
        course_data = df[df['module_id'].str.upper() == course_code.upper()]
        
        if course_data.empty:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = course_data.iloc[0]
        return CourseInfo(
            module_id=course['module_id'],
            name=course['name'],
            content=course['content'],
            category=course.get('category', None),
            subcategory=course.get('subcategory', None),
            credits=course.get('credits', None),
            responsible=course.get('responsible', None),
            module_level=course.get('module_level', None),
            occurrence=course.get('occurrence', None),
            description_of_achievement_and_assessment_methods=course.get('description_of_achievement_and_assessment_methods', None),
            intended_learning_outcomes=course.get('intended_learning_outcomes', None),
            certainty=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting course info: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "rag_available": qa_chain is not None,
        "vector_store_available": vector_store is not None
    }

@app.get("/")
async def root():
    return {"message": "LLM Inference Service with RAG is running"}
  
# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.middleware("http")
async def prometheus_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.labels(
        method=request.method, 
        endpoint=request.url.path, 
        status=response.status_code
    ).inc()
    REQUEST_DURATION.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/infer/")
async def infer(data: dict):
    # This is a placeholder for the actual LLM inference logic.
    # For example, using a pre-loaded model
    prompt = data.get("prompt", "")
    # Replace with actual LLM call
    response = f"LLM response to: {prompt}" 
    return {"inference": response}

# Add other endpoints here
