import os
import re
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import weaviate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Weaviate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from database_connector import db_connector

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
            
            # Search Weaviate
            result = self.client.query.get("TUMCourse", [
                "courseCode", "courseName", "courseNameEn", "description", 
                "descriptionEn", "semester", "organization", "tumOnlineUrl",
                "ects", "activityType", "fullText"
            ]).with_near_vector({
                "vector": query_vector
            }).with_limit(k).with_additional(["certainty"]).do()
            
            courses = result.get("data", {}).get("Get", {}).get("TUMCourse", [])
            
            # Convert to expected format
            documents = []
            for course in courses:
                doc = type('Document', (), {
                    'page_content': course.get('fullText', ''),
                    'metadata': {
                        'course_code': course.get('courseCode'),
                        'course_name': course.get('courseName'),
                        'course_name_en': course.get('courseNameEn'),
                        'description': course.get('description'),
                        'description_en': course.get('descriptionEn'),
                        'semester': course.get('semester'),
                        'organization': course.get('organization'),
                        'url': course.get('tumOnlineUrl'),
                        'ects': course.get('ects'),
                        'activity_type': course.get('activityType'),
                        'certainty': course.get('_additional', {}).get('certainty', 0)
                    }
                })()
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            print(f"Error in similarity search: {e}")
            return []
    
    def as_retriever(self, search_kwargs=None):
        """Return a retriever interface"""
        if search_kwargs is None:
            search_kwargs = {"k": 5}
        
        class Retriever:
            def __init__(self, store, search_kwargs):
                self.store = store
                self.search_kwargs = search_kwargs
            
            def get_relevant_documents(self, query):
                return self.store.similarity_search(query, **self.search_kwargs)
        
        return Retriever(self, search_kwargs)

app = FastAPI(title="LLM Inference Service with RAG")

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
    course_codes: List[str] = []
    confidence: float = 0.0
    sources: List[str] = []

class CourseInfo(BaseModel):
    course_code: str
    course_name: str
    description: str
    semester: str
    ects: Optional[int] = None

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
        # Initialize Weaviate client
        weaviate_client = weaviate.Client(
            url=os.getenv("WEAVIATE_URL", "http://localhost:8080"),
            timeout_config=(5, 15),
        )
        
        # Initialize embeddings
        embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Check if TUMCourse schema exists
        if not weaviate_client.schema.exists("TUMCourse"):
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

def populate_vector_database():
    """Populate Weaviate with course data"""
    global vector_store
    
    if not vector_store:
        return False
        
    try:
        df = load_course_data()
        if df.empty:
            return False
        
        # Prepare documents for vector store
        documents = []
        metadatas = []
        
        for _, row in df.iterrows():
            # Create a comprehensive text for embedding
            text_content = f"""
            Course Code: {row['course_code']}
            Course Name: {row['course_name']}
            Course Name (EN): {row.get('course_name_en', '')}
            Description: {row['final_description']}
            Semester: {row.get('semester_title', '')}
            Hours per Week: {row.get('hoursperweek', '')}
            Instruction Languages: {row.get('instruction_languages', '')}
            Organization: {row.get('org_name', '')}
            """.strip()
            
            documents.append(text_content)
            metadatas.append({
                'course_code': row['course_code'],
                'course_name': row['course_name'],
                'course_name_en': row.get('course_name_en', ''),
                'description': row['final_description'],
                'semester': row.get('semester_title', ''),
                'url': row.get('tumonline_url', ''),
            })
        
        # Add documents to vector store in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i+batch_size]
            batch_metas = metadatas[i:i+batch_size]
            
            vector_store.add_texts(
                texts=batch_docs,
                metadatas=batch_metas
            )
        
        print(f"Successfully added {len(documents)} course documents to vector store")
        return True
        
    except Exception as e:
        print(f"Error populating vector database: {e}")
        return False

def setup_qa_chain():
    """Setup the QA chain with custom prompt"""
    global qa_chain, vector_store
    
    if not vector_store:
        return False
    
    try:
        # Custom prompt template for course Q&A
        prompt_template = """
        You are an AI study advisor for Technical University Munich (TUM). Use the following course information to answer the student's question about TUM courses.
        
        Context: {context}
        
        Question: {question}
        
        Instructions:
        1. Focus specifically on the courses mentioned or relevant to the question
        2. If a specific course code is mentioned, provide detailed information about that course
        3. If the question is about course topics, programming languages, or content, extract that information from the course descriptions
        4. If you cannot find specific information in the provided context, clearly state that
        5. Always mention the course code when referring to specific courses
        6. Keep your response concise but informative
        7. If multiple courses are relevant, briefly mention each one
        
        Answer:
        """
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Initialize LLM
        llm = ChatOpenAI(
            model_name="gpt-3.5-turbo",
            temperature=0.1,
            openai_api_key=os.getenv("OPENAI_API_KEY")
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

@app.on_event("startup")
async def startup_event():
    """Initialize RAG components on startup"""
    print("Initializing RAG system...")
    
    if not os.getenv("OPENAI_API_KEY"):
        print("Warning: OPENAI_API_KEY not found. RAG functionality will be limited.")
        return
    
    if setup_weaviate():
        print("Weaviate connected successfully")
        
        if setup_qa_chain():
            print("QA chain setup successful")
            print("✅ RAG system ready! Using pre-populated Weaviate database.")
        else:
            print("Failed to setup QA chain")
    else:
        print("Failed to setup Weaviate")
        print("💡 Tip: Make sure Weaviate is running and populated with: python populate_weaviate.py")

@app.post("/chat/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Main chat endpoint with RAG functionality and study plan integration"""
    try:
        if not qa_chain:
            # Fallback to simple response if RAG is not available
            return ChatResponse(
                response="I'm currently unable to access the course database. Please try again later.",
                course_codes=[],
                confidence=0.0,
                sources=[]
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
        source_docs = result.get("source_documents", [])
        
        # Extract course codes from the response and sources
        response_codes = extract_course_codes(response_text)
        all_codes = list(set(mentioned_codes + response_codes))
        
        # Get source URLs and enhance with study plan context
        sources = []
        for doc in source_docs:
            if doc.metadata.get('url'):
                sources.append(doc.metadata['url'])
        
        # Calculate confidence based on source relevance and user context
        base_confidence = min(len(source_docs) * 0.2, 1.0)
        # Boost confidence if we have user context
        confidence = min(base_confidence * 1.2, 1.0) if user_context else base_confidence
        
        # Enhance response with study plan recommendations if applicable
        if user_context and any(word in request.message.lower() for word in ['recommend', 'suggest', 'should take', 'plan']):
            response_text += "\n\n💡 Based on your study plan, I can provide more personalized recommendations if you'd like!"
        
        return ChatResponse(
            response=response_text,
            course_codes=all_codes,
            confidence=confidence,
            sources=sources[:3]  # Limit to top 3 sources
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/course/{course_code}")
async def get_course_info(course_code: str):
    """Get detailed information about a specific course"""
    try:
        df = load_course_data()
        course_data = df[df['course_code'].str.upper() == course_code.upper()]
        
        if course_data.empty:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = course_data.iloc[0]
        return CourseInfo(
            course_code=course['course_code'],
            course_name=course['course_name'],
            description=course['final_description'],
            semester=course.get('semester_title', ''),
            ects=course.get('ects', None)
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