import os
import re
import pandas as pd
from fastapi import FastAPI, HTTPException, Header
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
from data_service_client import data_service
from langchain_google_genai import ChatGoogleGenerativeAI
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time


# Load environment variables (only for local development)
# In Kubernetes, environment variables are set directly
if not os.getenv('KUBERNETES_SERVICE_HOST'):  # Not running in Kubernetes
    load_dotenv()

class WeaviateCourseStore:
    """Custom Weaviate wrapper for TUM courses"""
    
    def __init__(self, client, embedding):
        self.client = client
        self.embedding = embedding
    
    def similarity_search(self, query: str, k: int = 5, study_program_filter: Optional[str] = None) -> List[Dict]:
        """Perform similarity search for courses
        
        Args:
            query: Search query
            k: Number of results to return
            study_program_filter: Optional study program ID to filter results
        """
        try:
            # Generate query vector
            query_vector = self.embedding.embed_query(query)

            # Use Weaviate v4 API
            collection = self.client.collections.get("TUMCourse")
            
            # Build the query with optional filter
            query_builder = collection.query.near_vector(
                near_vector=query_vector,
                limit=k,
                return_metadata=['certainty']
            )
            
            # Add study program filter if provided
            if study_program_filter:
                query_builder = query_builder.where(
                    {
                        "path": "study_program_id",
                        "operator": "Equal",
                        "valueText": study_program_filter
                    }
                )
            
            result = query_builder

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
                        'study_program_id': course.get('study_program_id'),
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
    study_plan_id: Optional[str] = None

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

def load_course_data(study_program_id: Optional[str] = None):
    """Load course data from PostgreSQL database or CSV fallback
    
    Args:
        study_program_id: Optional study program ID to filter courses
    """
    return data_service.get_course_data(study_program_id)

def get_conversational_prompt_template():
    """Get the conversational prompt template for the QA chain"""
    return """
    You are an AI study advisor for Technical University Munich (TUM). Use the following course information to answer the student's question in a natural, conversational way.
    
    Context: {context}
    
    Question: {question}
    
    Instructions:
    1. Write your response in a natural, conversational tone as if you're talking to a student
    2. Start with a brief, engaging summary of what the course is about and mention the course code naturally
    3. For specific courses, structure your response naturally:
       - Begin with what the course covers (1 sentence)
       - Mention key details like ECTS credits, language, and level in a flowing manner
       - Highlight interesting or unique aspects of the course
       - Include practical information (prerequisites, assessment methods) when relevant
    4. Keep the response informative but engaging, like a knowledgeable advisor would speak
    5. Focus on courses from the student's study program when possible
    6. Structure the response when appropriate using paragraphs or bullet points if it enhances clarity
    7. Keep your answer concise and to the point, avoiding unnecessary jargon or complexity
    
    Answer:
    """

def setup_weaviate():
    """Initialize Weaviate client and vector store"""
    global weaviate_client, vector_store, embeddings
    
    try:
        import weaviate
        weaviate_host = os.getenv("WEAVIATE_HOST", "localhost")
        weaviate_port = int(os.getenv("WEAVIATE_PORT", "8000"))
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
        # Use the shared conversational prompt template
        PROMPT = PromptTemplate(
            template=get_conversational_prompt_template(),
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
async def chat_with_ai(request: ChatRequest, authorization: Optional[str] = Header(None)):
    """Main chat endpoint with RAG functionality and study plan integration"""
    try:
        if not qa_chain:
            # Fallback to simple response if RAG is not available
            return ChatResponse(
                response="I'm currently unable to access the course database. Please try again later.",
                module_ids=[]
            )
        
        # Extract Bearer token from Authorization header
        bearer_token = None
        debug_mode = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
        
        if authorization and authorization.startswith("Bearer "):
            bearer_token = authorization.split("Bearer ")[1]
            if debug_mode:
                print(f"🔑 Received Bearer token for authentication: {bearer_token[:20]}..." if len(bearer_token) > 20 else f"🔑 Received Bearer token: {bearer_token}")
        else:
            if debug_mode:
                print(f"⚠️ No Authorization header received (authorization={authorization})")
        
        # Get user context and study program ID if study_plan_id is provided
        user_context = ""
        study_program_id = None
        if request.study_plan_id:
            if debug_mode:
                print(f"🔍 Received study plan ID: {request.study_plan_id}")
            try:
                study_plan = await data_service.get_user_study_plan(request.study_plan_id, bearer_token)
                if debug_mode:
                    print(f"🎯 Study plan retrieval result: {study_plan}")
                if study_plan:
                    # Extract study program ID for filtering
                    study_program_id = study_plan.get('degree_program_id') or study_plan.get('degreeProgram', {}).get('id')
                    
                    user_context = f"""
                    User Context:
                    - Study Plan ID: {request.study_plan_id}
                    - Degree Program: {study_plan.get('degree_program', study_plan.get('degreeProgram', {}).get('name', 'Unknown'))}
                    - Current Semester: {study_plan.get('current_semester', study_plan.get('currentSemester', 'Unknown'))}
                    - Study Program ID: {study_program_id}
                    
                    Please consider this context when providing recommendations and focus on courses relevant to this study program.
                    """
                    if debug_mode:
                        print(f"🎯 Using study program filter: {study_program_id}")
                        print(f"📝 User context: {user_context}")
                else:
                    print(f"⚠️ No study plan found for ID: {request.study_plan_id}")
                    if not bearer_token:
                        print("💡 Note: No authentication token provided. User may need to log in.")
                    # Continue with general recommendations without study plan context
            except Exception as e:
                print(f"❌ Failed to retrieve study plan {request.study_plan_id}: {e}")
                # Continue without study plan context
        
        # Create a custom retriever that filters by study program if available
        if study_program_id and vector_store:
            # Create a custom retriever with study program filtering
            from langchain.schema.retriever import BaseRetriever
            from typing import Any, Dict, List

            class FilteredRetriever(BaseRetriever):
                def __init__(self, store, study_program_filter, search_kwargs):
                    super().__init__()
                    object.__setattr__(self, 'store', store)
                    object.__setattr__(self, 'study_program_filter', study_program_filter)
                    object.__setattr__(self, 'search_kwargs', search_kwargs)

                def _get_relevant_documents(self, query: str) -> List[Any]:
                    return self.store.similarity_search(
                        query, 
                        study_program_filter=self.study_program_filter,
                        **self.search_kwargs
                    )

            filtered_retriever = FilteredRetriever(
                vector_store, 
                study_program_id, 
                {"k": 5}
            )
            
            # Create a temporary QA chain with the filtered retriever
            from langchain.chains import RetrievalQA
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain.prompts import PromptTemplate
            
            # Use the shared conversational prompt template
            PROMPT = PromptTemplate(
                template=get_conversational_prompt_template(),
                input_variables=["context", "question"]
            )
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-pro",
                temperature=0,
                max_tokens=None,
                max_retries=2
            )
            
            filtered_qa_chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=filtered_retriever,
                chain_type_kwargs={"prompt": PROMPT},
                return_source_documents=True
            )
            
            # Use the filtered QA chain
            current_qa_chain = filtered_qa_chain
        else:
            # Use the default QA chain
            current_qa_chain = qa_chain
        
        # Enhance the query with user context
        enhanced_query = f"{user_context}\n\nStudent Question: {request.message}" if user_context else request.message
        
        # Extract potential course codes from the question
        mentioned_codes = extract_course_codes(request.message)
        
        # Query the RAG system
        result = current_qa_chain({"query": enhanced_query})
        
        response_text = result["result"]
        
        # Extract course codes from the response and sources
        response_codes = extract_course_codes(response_text)
        all_codes = list(set(mentioned_codes + response_codes))
    
        # Add helpful messages based on context availability
        if request.study_plan_id and not user_context:
            if not bearer_token:
                response_text += "\n\n💡 **Tip**: Log in to get personalized course recommendations based on your study plan!"
            else:
                response_text += "\n\n💡 **Note**: I provided general recommendations. For personalized suggestions, please ensure your study plan is properly configured."
        elif user_context and any(word in request.message.lower() for word in ['recommend', 'suggest', 'should take', 'plan']):
            response_text += "\n\n💡 I've focused on courses from your study program. Would you like more personalized recommendations based on your completed courses?"

        return ChatResponse(
            response=response_text,
            module_ids=all_codes
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/course/{course_code}")
async def get_course_info(course_code: str, study_program_id: Optional[str] = None):
    """Get detailed information about a specific course
    
    Args:
        course_code: The course code to look up
        study_program_id: Optional study program ID to filter results
    """
    try:
        df = load_course_data(study_program_id)
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
