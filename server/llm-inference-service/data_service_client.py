import os
import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional
import httpx
import asyncio

class DataServiceClient:
    def __init__(self):
        # Study Data DB connection (course catalog)
        self.study_data_engine = create_engine(
            f"postgresql://{os.getenv('STUDY_DATA_DB_USER', 'postgres')}:"
            f"{os.getenv('STUDY_DATA_DB_PASSWORD', 'password')}@"
            f"{os.getenv('STUDY_DATA_DB_HOST', 'localhost')}:"
            f"{os.getenv('STUDY_DATA_DB_PORT', '5432')}/"
            f"{os.getenv('STUDY_DATA_DB_NAME', 'study_data_db')}"
        )
        
        # Study Plan Service URL (instead of direct DB connection)
        self.study_plan_service_url = os.getenv('STUDY_PLAN_SERVICE_URL', 'http://localhost:8081')
        
        # Debug mode (enable detailed logging)
        self.debug_mode = os.getenv('DEBUG_MODE', 'false').lower() == 'true'

    def get_course_data(self, study_program_id: Optional[str] = None) -> pd.DataFrame:
        """Get course data from curriculums_x_module_details in PostgreSQL study_data_db with CSV fallback
        
        Args:
            study_program_id: Optional study program ID to filter courses
        """
        try:
            query = """
            SELECT 
                study_program_id,
                category,
                subcategory,
                course_id_and_name,
                link,
                module_id,
                name,
                credits,
                version,
                valid,
                responsible,
                organisation,
                note,
                module_level,
                abbreviation,
                subtitle,
                duration,
                occurrence,
                language,
                related_programs,
                total_hours,
                contact_hours,
                self_study_hours,
                description_of_achievement_and_assessment_methods,
                exam_retake_next_semester,
                exam_retake_at_the_end_of_semester,
                prerequisites_recommended,
                intended_learning_outcomes,
                content,
                teaching_and_learning_methods,
                media,
                reading_list,
                curriculum_id,
                transformed_link,
                extraction_method,
                id as csv_id
            FROM curriculums_x_module_details
            WHERE module_id IS NOT NULL AND name IS NOT NULL
            """
            
            # Add study program filter if provided
            if study_program_id:
                query += f" AND study_program_id = '{study_program_id}'"
                
            df = pd.read_sql(query, self.study_data_engine)
            print(f"✅ Loaded {len(df)} courses from PostgreSQL curriculums_x_module_details" +
                  (f" (filtered by study_program_id: {study_program_id})" if study_program_id else ""))
            return df
        except Exception as e:
            print(f"❌ Error loading from PostgreSQL: {e}")
            print("🔄 Attempting to load from CSV fallback...")
            return self._load_csv_fallback(study_program_id)

    async def get_user_study_plan(self, study_plan_id: str, bearer_token: Optional[str] = None) -> Optional[dict]:
        """Get user's study plan from Study Plan Service API
        
        Args:
            study_plan_id: The study plan ID from the frontend URL
            bearer_token: Optional Bearer token for authentication
        """
        try:
            headers = {"Content-Type": "application/json"}
            if bearer_token:
                headers["Authorization"] = f"Bearer {bearer_token}"
                if self.debug_mode:
                    print(f"🔐 Using Bearer token authentication for study plan {study_plan_id}")
            else:
                if self.debug_mode:
                    print(f"⚠️ No Bearer token provided for study plan {study_plan_id}")
                
            if self.debug_mode:
                print(f"🌐 Making request to: {self.study_plan_service_url}/api/v1/study-plans/{study_plan_id}")
                print(f"📋 Request headers: {headers}")
                
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.study_plan_service_url}/api/v1/study-plans/{study_plan_id}",
                    headers=headers,
                    timeout=10.0
                )
                
                if self.debug_mode:
                    print(f"📊 Response status: {response.status_code}")
                
                if response.status_code != 200 and self.debug_mode:
                    try:
                        error_body = response.text
                        print(f"❌ Response body: {error_body}")
                    except:
                        print("❌ Could not read response body")
                
                if response.status_code == 200:
                    study_plan_data = response.json()
                    print(f"✅ Retrieved study plan {study_plan_id} from Study Plan Service")
                    return study_plan_data
                elif response.status_code == 401:
                    print(f"🔐 Study Plan Service returned 401 Unauthorized - invalid or expired token")
                    return None
                elif response.status_code == 403:
                    print(f"� Study Plan Service returned 403 Forbidden - insufficient permissions")
                    return None
                elif response.status_code == 404:
                    print(f"📭 Study Plan Service returned 404 Not Found - study plan {study_plan_id} does not exist")
                    return None
                else:
                    print(f"❌ Study Plan Service returned status {response.status_code}")
                    if response.status_code >= 400:
                        try:
                            error_data = response.json()
                            print(f"❌ Error details: {error_data}")
                        except:
                            print(f"❌ Response body: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Error calling Study Plan Service: {e}")
            # Log the full error for debugging
            import traceback
            print(f"� Full error trace: {traceback.format_exc()}")
            return None

    def _load_csv_fallback(self, study_program_id: Optional[str] = None) -> pd.DataFrame:
        """Load course data from CSV files as fallback when PostgreSQL is not available
        
        Args:
            study_program_id: Optional study program ID to filter courses
        """
        try:
            # Try to load module_details.csv which should have the most complete data
            # Path is relative to the project root (two levels up from server/llm-inference-service)
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                   'data-collection', 'csv_tables', 'module_details.csv')
            
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
                
                # Filter by study program ID if provided
                if study_program_id and 'study_program_id' in df.columns:
                    df = df[df['study_program_id'] == study_program_id]
                    print(f"📁 Loaded {len(df)} courses from CSV fallback (filtered by study_program_id: {study_program_id}): {csv_path}")
                else:
                    print(f"📁 Loaded {len(df)} courses from CSV fallback: {csv_path}")
                
                # Ensure we have the required columns and rename if necessary
                if 'module_id' in df.columns and 'name' in df.columns:
                    df = df.fillna('')
                    # Add missing columns that might be expected
                    expected_columns = [
                        'study_program_id', 'category', 'subcategory', 'course_id_and_name',
                        'link', 'module_id', 'name', 'credits', 'version', 'valid', 
                        'responsible', 'organisation', 'note', 'module_level', 
                        'abbreviation', 'subtitle', 'duration', 'occurrence', 'language',
                        'related_programs', 'total_hours', 'contact_hours', 'self_study_hours',
                        'description_of_achievement_and_assessment_methods', 
                        'exam_retake_next_semester', 'exam_retake_at_the_end_of_semester',
                        'prerequisites_recommended', 'intended_learning_outcomes', 'content',
                        'teaching_and_learning_methods', 'media', 'reading_list',
                        'curriculum_id', 'transformed_link', 'extraction_method', 'csv_id'
                    ]
                    
                    for col in expected_columns:
                        if col not in df.columns:
                            df[col] = ''
                    
                    return df[df['module_id'].notna() & df['name'].notna()]
                else:
                    print(f"❌ CSV file missing required columns: module_id, name")
            
            # If module_details.csv doesn't work, try other CSV files
            print("🔄 Trying alternative CSV files...")
            for csv_name in ['module_details_scraped.csv', 'modules.csv']:
                alt_csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                           'data-collection', 'csv_tables', csv_name)
                if os.path.exists(alt_csv_path):
                    df = pd.read_csv(alt_csv_path)
                    if 'module_id' in df.columns:
                        # Filter by study program ID if provided
                        if study_program_id and 'study_program_id' in df.columns:
                            df = df[df['study_program_id'] == study_program_id]
                            print(f"📁 Using alternative CSV: {csv_name} ({len(df)} records, filtered by study_program_id: {study_program_id})")
                        else:
                            print(f"📁 Using alternative CSV: {csv_name} ({len(df)} records)")
                        df = df.fillna('')
                        return df[df['module_id'].notna()]
            
            print("❌ No suitable CSV fallback found")
            return pd.DataFrame()  # Return empty DataFrame if no CSV works
            
        except Exception as e:
            print(f"❌ Error loading CSV fallback: {e}")
            return pd.DataFrame()

# Global data service client instance
data_service = DataServiceClient()
