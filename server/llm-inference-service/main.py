import os
import re
import pandas as pd
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import weaviate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Weaviate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from data_service_client import data_service
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time

# Import Gemini support
try:
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  Gemini packages not available. Install with: pip install langchain-google-genai")


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


import requests
import json
from typing import List

class OllamaEmbeddings:
    """Custom embeddings class for Ollama API via Open WebUI"""
    
    def __init__(self, model: str, base_url: str, api_key: str):
        self.model = model
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        
    def embed_query(self, text: str) -> List[float]:
        """Embed a single text query"""
        return self.embed_documents([text])[0]
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple documents"""
        url = f"{self.base_url}/api/embed"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Add authorization header if API key is provided
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        
        data = {
            "model": self.model,
            "input": texts
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            # Handle both single embedding and multiple embeddings
            if 'embeddings' in result:
                return result['embeddings']
            elif 'embedding' in result:
                # Single embedding case
                return [result['embedding']]
            else:
                raise ValueError(f"Unexpected response format: {result}")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error calling Ollama embedding API: {e}")
        except json.JSONDecodeError as e:
            raise Exception(f"Error parsing Ollama API response: {e}")


def get_llm_client(temperature: float = 0.7, model: str = None):
    """Initialize LLM client based on USE_GEMINI environment variable"""
    use_gemini = os.getenv("USE_GEMINI", "false").lower() == "true"
    
    if use_gemini and GEMINI_AVAILABLE:
        print("🤖 Using Gemini AI")
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required when USE_GEMINI=true")
        
        return ChatGoogleGenerativeAI(
            google_api_key=gemini_api_key,
            model=model or "gemini-pro",
            temperature=temperature,
            convert_system_message_to_human=True
        )
    else:
        print("🤖 Using OpenAI/OpenWebUI")
        # Use existing OpenWebUI/OpenAI setup
        base_url = os.getenv("OPENAI_BASE_URL", "https://gpu.aet.cit.tum.de/api")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        return ChatOpenAI(
            base_url=base_url,
            api_key=api_key,
            model=model or "llama3.3:latest",
            temperature=temperature
        )


def get_embeddings_client():
    """Initialize embeddings client based on USE_GEMINI environment variable"""
    use_gemini = os.getenv("USE_GEMINI", "false").lower() == "true"
    
    if use_gemini and GEMINI_AVAILABLE:
        print("📊 Using Gemini embeddings")
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required when USE_GEMINI=true")
        
        return GoogleGenerativeAIEmbeddings(
            google_api_key=gemini_api_key,
            model="models/embedding-001"
        )
    else:
        print("📊 Using custom Ollama embeddings")
        # Use existing custom Ollama embeddings
        base_url = os.getenv("OLLAMA_BASE_URL", "https://gpu.aet.cit.tum.de/ollama")
        api_key = os.getenv("OPENAI_API_KEY")
        embedding_model = os.getenv("EMBEDDING_MODEL", "llama3.3:latest")
        
        return OllamaEmbeddings(
            base_url=base_url,
            api_key=api_key,
            model=embedding_model
        )


import time

app = FastAPI(title="LLM Inference Service with RAG")

@app.on_event("startup")
async def startup_event():
    """Initialize RAG system on startup"""
    global weaviate_client, vector_store, embeddings, qa_chain
    
    print("🚀 === Starting RAG system initialization ===")
    
    try:
        print("🔌 Setting up Weaviate connection...")
        import weaviate
        weaviate_host = os.getenv("WEAVIATE_HOST", "localhost")
        weaviate_port = int(os.getenv("WEAVIATE_PORT", "8000"))
        weaviate_grpc_port = int(os.getenv("WEAVIATE_GRPC_PORT", "50051"))
        
        print(f"🌐 Connecting to Weaviate at {weaviate_host}:{weaviate_port}")
        weaviate_client = weaviate.connect_to_local(
            host=weaviate_host,
            port=weaviate_port,
            grpc_port=weaviate_grpc_port
        )
        print("✅ Weaviate connection established")

        # Setup Open WebUI embeddings
        print("Setting up Open WebUI embeddings...")
        api_key = os.getenv("OPENAI_API_KEY")
        chat_base_url = os.getenv("OPENAI_BASE_URL", "https://gpu.aet.cit.tum.de/api")
        ollama_base_url = os.getenv("OLLAMA_BASE_URL", "https://gpu.aet.cit.tum.de/ollama")
        embedding_model = os.getenv("EMBEDDING_MODEL", "llama3.3:latest")
        
        print(f"🔧 Using model: {embedding_model}")
        print(f"🌐 Using chat API base: {chat_base_url}")
        print(f"🌐 Using Ollama API base: {ollama_base_url}")
        print(f"🔑 API key length: {len(api_key) if api_key else 0}")
        
        # Setup embeddings based on configuration
        print("🔧 Setting up embeddings...")
        try:
            embeddings = get_embeddings_client()
            
            # Test embeddings
            print("🧪 Testing embeddings...")
            test_embedding = embeddings.embed_query("test")
            print(f"✅ Embeddings working (dimension: {len(test_embedding)})")
        except Exception as e:
            print(f"❌ Embeddings failed: {e}")
            import traceback
            traceback.print_exc()
            embeddings = None

        # Check schema
        schema = weaviate_client.collections.list_all()
        if "TUMCourse" not in schema:
            print("⚠️  TUMCourse schema not found!")
            print("Available collections:", list(schema.keys()))
        else:
            print("✅ TUMCourse collection found")
            
            # Create vector store only if embeddings work
            if embeddings is not None:
                print("🔧 Creating vector store...")
                try:
                    vector_store = WeaviateCourseStore(
                        client=weaviate_client,
                        embedding=embeddings,
                    )
                    print("✅ Vector store created")
                    
                    # Setup QA chain
                    if setup_qa_chain():
                        print("✅ QA chain setup successful")
                        print("🎉 RAG system fully initialized with Open WebUI!")
                    else:
                        print("❌ QA chain setup failed")
                except Exception as e:
                    print(f"❌ Vector store creation failed: {e}")
            else:
                print("⚠️ Skipping vector store creation due to embeddings failure")
        
    except Exception as e:
        print(f"❌ RAG setup failed: {e}")
        import traceback
        traceback.print_exc()
        print("💡 RAG system not available, chat will use fallback responses")

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
        weaviate_client = weaviate_client_local

        # Use Open WebUI embeddings API (OpenAI-compatible)
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL", "https://gpu.aet.cit.tum.de/api")
        embedding_model = os.getenv("EMBEDDING_MODEL", "llama3.3:latest")  # Use same model as chat
        
        print(f"🔧 Initializing Open WebUI embeddings with model: {embedding_model}")
        print(f"🌐 Using embeddings API base URL: {base_url}")
        
        embeddings = OpenAIEmbeddings(
            model=embedding_model,
            openai_api_key=api_key,
            openai_api_base=base_url
        )
        # Test the embeddings by embedding a simple query
        test_embedding = embeddings.embed_query("test")
        print(f"✅ Open WebUI embeddings initialized successfully (dimension: {len(test_embedding)})")

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
        return False

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
        
        print("🤖 Initializing LLM...")
        llm = get_llm_client()
        
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
            from langchain_openai import ChatOpenAI
            from langchain.prompts import PromptTemplate
            
            # Use the shared conversational prompt template
            PROMPT = PromptTemplate(
                template=get_conversational_prompt_template(),
                input_variables=["context", "question"]
            )
            
            print("🤖 Initializing LLM for filtered search...")
            llm = get_llm_client()
            
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
