import os
import sys
import pandas as pd
import weaviate
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import json
from typing import List, Dict
from weaviate.collections.classes.config import DataType
from weaviate.collections.classes.data import DataObject 

# Load environment variables
load_dotenv()

class WeaviatePopulator:
    def __init__(self):
        self.client = None
        self.embeddings = None
        self.setup_weaviate()
        
    def setup_weaviate(self):
        """Initialize Weaviate client (v4) and Gemini embeddings"""
        try:
            self.client = weaviate.connect_to_local()
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
            print("\u2705 Connected to Weaviate (v4 API) and Gemini Embeddings")
        except Exception as e:
            print(f"\u274c Failed to connect to Weaviate or Gemini: {e}")
            sys.exit(1)
    
    def create_schema(self):
        """Create Weaviate schema for TUM courses (v4, all CSV columns)"""
        try:
            # Delete existing class if it exists
            if "TUMCourse" in self.client.collections.list_all():                print("🗑️  Deleting existing TUMCourse schema...")
            self.client.collections.delete("TUMCourse")
            # All columns from modules.csv
            properties = [
                # 'id' is reserved in Weaviate, so we use 'csv_id' instead
                {"name": "csv_id", "data_type": DataType.INT},
                {"name": "study_program_id", "data_type": DataType.INT},
                {"name": "category", "data_type": DataType.TEXT},
                {"name": "subcategory", "data_type": DataType.TEXT},
                {"name": "course_id_and_name", "data_type": DataType.TEXT},
                {"name": "link", "data_type": DataType.TEXT},
                {"name": "module_id", "data_type": DataType.TEXT},
                {"name": "name", "data_type": DataType.TEXT},
                {"name": "credits", "data_type": DataType.NUMBER},
                {"name": "version", "data_type": DataType.TEXT},
                {"name": "valid", "data_type": DataType.TEXT},
                {"name": "responsible", "data_type": DataType.TEXT},
                {"name": "organisation", "data_type": DataType.TEXT},
                {"name": "note", "data_type": DataType.TEXT},
                {"name": "module_level", "data_type": DataType.TEXT},
                {"name": "abbreviation", "data_type": DataType.TEXT},
                {"name": "subtitle", "data_type": DataType.TEXT},
                {"name": "duration", "data_type": DataType.TEXT},
                {"name": "occurrence", "data_type": DataType.TEXT},
                {"name": "language", "data_type": DataType.TEXT},
                {"name": "related_programs", "data_type": DataType.TEXT},
                {"name": "total_hours", "data_type": DataType.NUMBER},
                {"name": "contact_hours", "data_type": DataType.NUMBER},
                {"name": "self_study_hours", "data_type": DataType.NUMBER},
                {"name": "description_of_achievement_and_assessment_methods", "data_type": DataType.TEXT},
                {"name": "exam_retake_next_semester", "data_type": DataType.TEXT},
                {"name": "exam_retake_at_the_end_of_semester", "data_type": DataType.TEXT},
                {"name": "prerequisites_recommended", "data_type": DataType.TEXT},
                {"name": "intended_learning_outcomes", "data_type": DataType.TEXT},
                {"name": "content", "data_type": DataType.TEXT},
                {"name": "teaching_and_learning_methods", "data_type": DataType.TEXT},
                {"name": "media", "data_type": DataType.TEXT},
                {"name": "reading_list", "data_type": DataType.TEXT},
                {"name": "curriculum_id", "data_type": DataType.INT},
                {"name": "transformed_link", "data_type": DataType.TEXT},
                {"name": "extraction_method", "data_type": DataType.TEXT}
            ]
            self.client.collections.create(
                name="TUMCourse",
                description="TUM course information (all CSV columns)",
                properties=properties
            )
            print("✅ Created TUMCourse schema (all columns)")
        except Exception as e:
            print(f"❌ Failed to create schema: {e}")
            sys.exit(1)
    
    def load_course_data(self) -> pd.DataFrame:
        """Load course data from CSV files (no required columns)"""
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
            
            print(f"📊 Loaded {len(df)} total records")
            df = df.fillna('')
            print(f"📊 {len(df)} records after cleaning")
            return df
            
        except Exception as e:
            print(f"❌ Error loading course data: {e}")
            sys.exit(1)
    
    def prepare_course_data(self, df: pd.DataFrame) -> List[Dict]:
        """Prepare course data for Weaviate (all CSV columns, 'id' renamed to 'csv_id')"""
        courses = []
        for _, row in df.iterrows():
            course = {('csv_id' if col == 'id' else col): row[col] for col in df.columns}
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
                    # Use a fallback if 'fullText' is not present
                    full_text = course.get("fullText")
                    if not full_text:
                        # Compose a fallback text from all fields
                        full_text = " ".join(str(v) for v in course.values() if v)
                    vector = self.embeddings.embed_query(full_text)
                except Exception as e:
                    print(f"⚠️  Failed to generate embedding for row {i}: {e}")
                    continue
                # Use DataObject for v4 API
                batch.append(DataObject(properties=course, vector=vector))
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

    # Close Weaviate client connection
    populator.client.close()

if __name__ == "__main__":
    main()
