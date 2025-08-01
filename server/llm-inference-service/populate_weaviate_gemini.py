import os
import sys
import pandas as pd
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import json
from typing import List, Dict
from sqlalchemy import create_engine

# Load environment variables
# Try to load from project root first
env_paths = [
    os.path.join(os.path.dirname(__file__), '..', '..', '.env'),  # Project root
    os.path.join(os.path.dirname(__file__), '.env'),  # Current directory
    '.env'  # Current working directory
]

for env_path in env_paths:
    if os.path.exists(env_path):
        print(f"📄 Loading environment variables from {env_path}")
        load_dotenv(env_path)
        break
else:
    print("⚠️ No .env file found, using system environment variables")

class WeaviateGeminiPopulator:
    def __init__(self):
        self.embeddings = None
        self.output_dir = "./gemini-weaviate-export"
        self.setup_gemini()
        
    def setup_gemini(self):
        """Initialize Gemini embeddings (no Weaviate connection needed for export)"""
        try:
            # Setup Gemini embeddings
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                raise ValueError("GEMINI_API_KEY environment variable is required")
            
            print("🤖 Setting up Gemini embeddings...")
            self.embeddings = GoogleGenerativeAIEmbeddings(
                google_api_key=gemini_api_key,
                model="models/embedding-001"
            )
            
            # Test embeddings to get dimension
            test_embedding = self.embeddings.embed_query("test")
            print(f"✅ Gemini embeddings ready (dimension: {len(test_embedding)})")
            
            # Create output directory
            os.makedirs(self.output_dir, exist_ok=True)
            print(f"📁 Export directory created: {self.output_dir}")
            
        except Exception as e:
            print(f"❌ Failed to setup Gemini embeddings: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    def create_schema_export(self):
        """Create Weaviate schema export for TUM courses optimized for Gemini embeddings"""
        try:
            # Create schema for Gemini embeddings (v4 format)
            schema = {
                "class": "TUMCourse",
                "description": "TUM course information with Gemini embeddings",
                "vectorIndexType": "hnsw",
                "vectorizer": "none",  # We provide our own vectors
                "properties": [
                    {"name": "study_program_id", "dataType": ["int"]},
                    {"name": "category", "dataType": ["text"]},
                    {"name": "subcategory", "dataType": ["text"]},
                    {"name": "course_id_and_name", "dataType": ["text"]},
                    {"name": "link", "dataType": ["text"]},
                    {"name": "module_id", "dataType": ["text"]},
                    {"name": "name", "dataType": ["text"]},
                    {"name": "credits", "dataType": ["number"]},
                    {"name": "version", "dataType": ["text"]},
                    {"name": "valid", "dataType": ["text"]},
                    {"name": "responsible", "dataType": ["text"]},
                    {"name": "organisation", "dataType": ["text"]},
                    {"name": "note", "dataType": ["text"]},
                    {"name": "module_level", "dataType": ["text"]},
                    {"name": "abbreviation", "dataType": ["text"]},
                    {"name": "subtitle", "dataType": ["text"]},
                    {"name": "duration", "dataType": ["text"]},
                    {"name": "occurrence", "dataType": ["text"]},
                    {"name": "language", "dataType": ["text"]},
                    {"name": "related_programs", "dataType": ["text"]},
                    {"name": "total_hours", "dataType": ["number"]},
                    {"name": "contact_hours", "dataType": ["number"]},
                    {"name": "self_study_hours", "dataType": ["number"]},
                    {"name": "description_of_achievement_and_assessment_methods", "dataType": ["text"]},
                    {"name": "exam_retake_next_semester", "dataType": ["text"]},
                    {"name": "exam_retake_at_the_end_of_semester", "dataType": ["text"]},
                    {"name": "prerequisites_recommended", "dataType": ["text"]},
                    {"name": "intended_learning_outcomes", "dataType": ["text"]},
                    {"name": "content", "dataType": ["text"]},
                    {"name": "teaching_and_learning_methods", "dataType": ["text"]},
                    {"name": "media", "dataType": ["text"]},
                    {"name": "reading_list", "dataType": ["text"]},
                    {"name": "curriculum_id", "dataType": ["int"]},
                    {"name": "transformed_link", "dataType": ["text"]},
                    {"name": "extraction_method", "dataType": ["text"]},
                    {"name": "csv_id", "dataType": ["int"]},
                    {"name": "embedding_source", "dataType": ["text"]}
                ]
            }
            
            # Save schema to file
            schema_file = os.path.join(self.output_dir, "schema.json")
            with open(schema_file, 'w') as f:
                json.dump({"classes": [schema]}, f, indent=2)
            
            print(f"✅ Created Weaviate schema export: {schema_file}")
            
        except Exception as e:
            print(f"❌ Failed to create schema export: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    def load_course_data(self) -> pd.DataFrame:
        """Load course data from CSV files in data-collection directory"""
        try:
            # Try to find the CSV files in different possible locations
            possible_paths = [
                "../../data-collection/csv_tables/module_details.csv",  # From llm-inference-service dir
                "../data-collection/csv_tables/module_details.csv",     # From server dir
                "data-collection/csv_tables/module_details.csv",        # From project root
                "./module_details.csv"                                   # Current directory
            ]
            
            csv_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    csv_file = path
                    break
            
            if csv_file is None:
                raise FileNotFoundError("Could not find module_details.csv file in any expected location")
            
            print(f"📚 Loading course data from CSV file: {csv_file}")
            df = pd.read_csv(csv_file)
            print(f"📊 Loaded {len(df)} records from CSV file")
            
            # Clean the data
            df = df.fillna('')
            
            # Add some required columns that might be missing
            if 'embedding_source' not in df.columns:
                df['embedding_source'] = 'gemini'
            
            # Rename 'id' column to 'csv_id' if it exists
            if 'id' in df.columns:
                df = df.rename(columns={'id': 'csv_id'})
            
            print(f"📊 {len(df)} records after cleaning")
            print(f"📋 Columns found: {list(df.columns)}")
            return df
            
        except Exception as e:
            print(f"❌ Error loading course data from CSV: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    def prepare_course_data(self, df: pd.DataFrame) -> List[Dict]:
        """Prepare course data for Weaviate with Gemini embeddings"""
        courses = []
        for _, row in df.iterrows():
            course = {('csv_id' if col == 'id' else col): row[col] for col in df.columns}
            course['embedding_source'] = 'gemini'  # Mark as using Gemini embeddings
            courses.append(course)
        return courses
    
    def create_embedding_text(self, course: Dict) -> str:
        """Create a comprehensive text representation of the course for embedding"""
        # Combine the most important text fields
        text_parts = []
        
        # Add course name and module ID
        if course.get('name'):
            text_parts.append(f"Course: {course['name']}")
        if course.get('module_id'):
            text_parts.append(f"Module ID: {course['module_id']}")
        
        # Add category information
        if course.get('category'):
            text_parts.append(f"Category: {course['category']}")
        if course.get('subcategory'):
            text_parts.append(f"Subcategory: {course['subcategory']}")
        
        # Add detailed content
        if course.get('content'):
            text_parts.append(f"Content: {course['content']}")
        if course.get('intended_learning_outcomes'):
            text_parts.append(f"Learning Outcomes: {course['intended_learning_outcomes']}")
        if course.get('description_of_achievement_and_assessment_methods'):
            text_parts.append(f"Assessment: {course['description_of_achievement_and_assessment_methods']}")
        if course.get('prerequisites_recommended'):
            text_parts.append(f"Prerequisites: {course['prerequisites_recommended']}")
        
        # Add practical information
        if course.get('responsible'):
            text_parts.append(f"Responsible: {course['responsible']}")
        if course.get('credits'):
            text_parts.append(f"Credits: {course['credits']} ECTS")
        if course.get('language'):
            text_parts.append(f"Language: {course['language']}")
        if course.get('module_level'):
            text_parts.append(f"Level: {course['module_level']}")
        
        return " | ".join(text_parts)
    
    def create_data_export(self, courses: List[Dict], batch_size: int = 50):
        """Create Weaviate data export with Gemini embeddings"""
        print(f"🚀 Creating data export with {len(courses)} courses using Gemini embeddings...")
        
        try:
            objects = []
            successful_embeds = 0
            
            for i, course in enumerate(courses):
                try:
                    # Create comprehensive text for embedding
                    embedding_text = self.create_embedding_text(course)
                    
                    # Generate embedding using Gemini
                    vector = self.embeddings.embed_query(embedding_text)
                    
                    # Create object in Weaviate v1 batch format
                    obj = {
                        "class": "TUMCourse",
                        "properties": course,
                        "vector": vector
                    }
                    
                    objects.append(obj)
                    successful_embeds += 1
                        
                    if (i + 1) % 50 == 0:
                        print(f"📝 Generated embeddings for {i + 1}/{len(courses)} courses (successful: {successful_embeds})...")
                        
                except Exception as e:
                    print(f"⚠️ Failed to process course {i} (module_id: {course.get('module_id', 'unknown')}): {e}")
                    continue
            
            # Save data to file
            data_file = os.path.join(self.output_dir, "TUMCourse_data.json")
            export_data = {
                "objects": objects,
                "metadata": {
                    "embedding_model": "models/embedding-001",
                    "embedding_provider": "google-genai",
                    "total_courses": len(courses),
                    "successful_embeds": successful_embeds,
                    "export_timestamp": pd.Timestamp.now().isoformat()
                }
            }
            
            with open(data_file, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            print(f"✅ Successfully created data export with {successful_embeds}/{len(courses)} courses!")
            print(f"📄 Data export saved to: {data_file}")
            
        except Exception as e:
            print(f"❌ Error creating data export: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    def verify_export(self):
        """Verify that export files were created successfully"""
        try:
            schema_file = os.path.join(self.output_dir, "schema.json")
            data_file = os.path.join(self.output_dir, "TUMCourse_data.json")
            
            # Check schema file
            if os.path.exists(schema_file):
                with open(schema_file, 'r') as f:
                    schema = json.load(f)
                print(f"✅ Schema export verified: {schema_file}")
                print(f"   Classes: {len(schema.get('classes', []))}")
            else:
                print(f"❌ Schema file not found: {schema_file}")
                return False
            
            # Check data file
            if os.path.exists(data_file):
                with open(data_file, 'r') as f:
                    data = json.load(f)
                objects_count = len(data.get('objects', []))
                metadata = data.get('metadata', {})
                print(f"✅ Data export verified: {data_file}")
                print(f"   Objects: {objects_count}")
                print(f"   Embedding model: {metadata.get('embedding_model', 'N/A')}")
                print(f"   Success rate: {metadata.get('successful_embeds', 0)}/{metadata.get('total_courses', 0)}")
                
                # Show sample vector dimension
                if objects_count > 0:
                    first_vector = data['objects'][0].get('vector', [])
                    print(f"   Vector dimension: {len(first_vector)}")
            else:
                print(f"❌ Data file not found: {data_file}")
                return False
            
            return True
            
        except Exception as e:
            print(f"⚠️ Verification error: {e}")
            return False

def main():
    print("🏗️ TUM Course Data Population for Weaviate (Gemini Embeddings)")
    print("=" * 70)
    
    # Check for required environment variables
    required_vars = ["GEMINI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these variables and try again.")
        sys.exit(1)
    
    populator = WeaviateGeminiPopulator()
    
    # Step 1: Create schema export
    print("\n1️⃣ Creating Weaviate schema export for Gemini embeddings...")
    populator.create_schema_export()
    
    # Step 2: Load course data
    print("\n2️⃣ Loading course data from PostgreSQL...")
    df = populator.load_course_data()
    
    # Step 3: Prepare data
    print("\n3️⃣ Preparing course data...")
    courses = populator.prepare_course_data(df)
    
    # Step 4: Create data export with embeddings
    print("\n4️⃣ Creating data export with Gemini embeddings...")
    populator.create_data_export(courses)
    
    # Step 5: Verify export
    print("\n5️⃣ Verifying export files...")
    if populator.verify_export():
        print(f"\n🎉 Gemini embedding export complete!")
        print(f"📊 Total courses processed: {len(courses)}")
        print(f"🤖 Using Gemini embeddings model: models/embedding-001")
        print(f"� Export directory: {populator.output_dir}")
        print(f"\n📋 Next steps:")
        print(f"   1. Copy the export files to your AWS server")
        print(f"   2. Run the import script to populate Weaviate on AWS")
        print(f"   3. Test the chat functionality with Gemini embeddings")
    else:
        print(f"\n❌ Export verification failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
