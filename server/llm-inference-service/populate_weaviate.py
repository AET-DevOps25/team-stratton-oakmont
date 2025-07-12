import os
import sys
import pandas as pd
import weaviate
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
import json
from typing import List, Dict

# Load environment variables
load_dotenv()

class WeaviatePopulator:
    def __init__(self):
        self.client = None
        self.embeddings = None
        self.setup_weaviate()
        
    def setup_weaviate(self):
        """Initialize Weaviate client (v4)"""
        try:
            self.client = weaviate.connect_to_local()
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
            print("\u2705 Connected to Weaviate (v4 API)")
        except Exception as e:
            print(f"\u274c Failed to connect to Weaviate: {e}")
            sys.exit(1)
    
    def create_schema(self):
        """Create Weaviate schema for TUM courses (v4)"""
        schema = {
            "class": "TUMCourse",
            "description": "TUM course information",
            "vectorizer": "none",
            "properties": [
                {"name": "courseCode", "dataType": ["string"], "description": "Course code (e.g., IN2003)"},
                {"name": "courseName", "dataType": ["string"], "description": "Course name"},
                {"name": "courseNameEn", "dataType": ["string"], "description": "Course name in English"},
                {"name": "description", "dataType": ["text"], "description": "Course description"},
                {"name": "descriptionEn", "dataType": ["text"], "description": "Course description in English"},
                {"name": "semester", "dataType": ["string"], "description": "Semester when course is offered"},
                {"name": "hoursPerWeek", "dataType": ["int"], "description": "Hours per week"},
                {"name": "instructionLanguages", "dataType": ["string"], "description": "Instruction languages"},
                {"name": "organization", "dataType": ["string"], "description": "Organizing department"},
                {"name": "tumOnlineUrl", "dataType": ["string"], "description": "TUM Online URL"},
                {"name": "ects", "dataType": ["int"], "description": "ECTS credits"},
                {"name": "activityType", "dataType": ["string"], "description": "Activity type (VO, VI, etc.)"},
                {"name": "fullText", "dataType": ["text"], "description": "Full searchable text content"}
            ]
        }
        
        try:
            # Delete existing class if it exists
            if "TUMCourse" in [c.name for c in self.client.collections.list_all()]:
                print("🗑️  Deleting existing TUMCourse schema...")
                self.client.collections.delete("TUMCourse")
            
            # Create new class
            self.client.collections.create(schema)
            print("✅ Created TUMCourse schema (v4)")
            
        except Exception as e:
            print(f"❌ Failed to create schema: {e}")
            sys.exit(1)
    
    def load_course_data(self) -> pd.DataFrame:
        """Load course data from CSV files"""
        try:
            # Try multiple possible paths
            csv_paths = [
                "../data-collection/csv_tables/modules.csv",
                "../../data-collection/csv_tables/modules.csv",
                "/app/data/modules.csv",
                "data/modules.csv"
            ]
            
            df = None
            for path in csv_paths:
                if os.path.exists(path):
                    print(f"📚 Loading course data from {path}")
                    df = pd.read_csv(path)
                    break
            
            if df is None:
                raise FileNotFoundError("Could not find modules.csv file")
            
            # Clean and prepare data
            print(f"📊 Loaded {len(df)} total records")
            df = df.dropna(subset=['course_code', 'course_name'])
            df = df.fillna('')
            
            print(f"📊 {len(df)} records after cleaning")
            return df
            
        except Exception as e:
            print(f"❌ Error loading course data: {e}")
            sys.exit(1)
    
    def prepare_course_data(self, df: pd.DataFrame) -> List[Dict]:
        """Prepare course data for Weaviate"""
        courses = []
        
        for _, row in df.iterrows():
            # Create comprehensive text for embedding
            full_text = f"""
            Course: {row['course_code']} - {row['course_name']}
            English Name: {row.get('course_name_en', '')}
            Description: {row.get('description', '')}
            English Description: {row.get('description_en', '')}
            Semester: {row.get('semester_title', '')}
            Organization: {row.get('org_name', '')}
            Hours per Week: {row.get('hoursperweek', '')}
            Languages: {row.get('instruction_languages', '')}
            Activity: {row.get('activity_name', '')}
            """.strip()
            
            # Prepare course object
            course = {
                "courseCode": str(row['course_code']),
                "courseName": str(row['course_name']),
                "courseNameEn": str(row.get('course_name_en', '')),
                "description": str(row.get('description', '')),
                "descriptionEn": str(row.get('description_en', '')),
                "semester": str(row.get('semester_title', '')),
                "hoursPerWeek": int(row.get('hoursperweek', 0)) if pd.notna(row.get('hoursperweek')) else 0,
                "instructionLanguages": str(row.get('instruction_languages', '')),
                "organization": str(row.get('org_name', '')),
                "tumOnlineUrl": str(row.get('tumonline_url', '')),
                "ects": int(row.get('ects_credits', 0)) if pd.notna(row.get('ects_credits')) else 0,
                "activityType": str(row.get('activity_name', '')),
                "fullText": full_text
            }
            
            courses.append(course)
        
        return courses
    
    def populate_weaviate(self, courses: List[Dict], batch_size: int = 50):
        """Populate Weaviate with course data (v4)"""
        print(f"🚀 Starting to populate Weaviate with {len(courses)} courses...")
        
        try:
            collection = self.client.collections.get("TUMCourse")
            batch = []
            for i, course in enumerate(courses):
                # Generate embedding for the full text
                try:
                    vector = self.embeddings.embed_query(course["fullText"])
                except Exception as e:
                    print(f"⚠️  Failed to generate embedding for {course['courseCode']}: {e}")
                    continue
                
                batch.append({"properties": course, "vector": vector})
                if len(batch) >= batch_size or i == len(courses) - 1:
                    collection.data.insert_many(batch)
                    batch = []
                
                if (i + 1) % 100 == 0:
                    print(f"📝 Processed {i + 1}/{len(courses)} courses...")
            
            print(f"✅ Successfully populated Weaviate with {len(courses)} courses! (v4)")
            
        except Exception as e:
            print(f"❌ Error populating Weaviate: {e}")
            sys.exit(1)
    
    def verify_population(self):
        """Verify that data was loaded correctly (v4)"""
        try:
            collection = self.client.collections.get("TUMCourse")
            count = collection.aggregate.count()
            print(f"✅ Verification: {count} courses in Weaviate (v4)")
            
            # Test a search
            results = collection.query.near_text(query="course", limit=1)
            if results.objects:
                sample = results.objects[0].properties
                print(f"📝 Sample course: {sample['courseCode']} - {sample['courseName']}")
            
        except Exception as e:
            print(f"⚠️  Verification warning: {e}")

def main():
    print("🏗️  TUM Course Data Population for Weaviate")
    print("=" * 50)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key in the .env file")
        sys.exit(1)
    
    populator = WeaviatePopulator()
    
    # Step 1: Create schema
    print("\n1️⃣  Creating Weaviate schema...")
    populator.create_schema()
    
    # Step 2: Load course data
    print("\n2️⃣  Loading course data...")
    df = populator.load_course_data()
    
    # Step 3: Prepare data
    print("\n3️⃣  Preparing course data...")
    courses = populator.prepare_course_data(df)
    
    # Step 4: Populate Weaviate
    print("\n4️⃣  Populating Weaviate...")
    populator.populate_weaviate(courses)
    
    # Step 5: Verify
    print("\n5️⃣  Verifying population...")
    populator.verify_population()
    
    print(f"\n🎉 Data population complete!")
    print(f"📊 Total courses loaded: {len(courses)}")
    print(f"🔍 You can now use the AI chat feature with full course data!")

if __name__ == "__main__":
    main()
