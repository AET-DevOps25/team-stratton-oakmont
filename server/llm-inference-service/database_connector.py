import os
import pandas as pd
from sqlalchemy import create_engine, text
from typing import Optional

class DatabaseConnector:
    def __init__(self):
        # Study Data DB connection (course catalog)
        self.study_data_engine = create_engine(
            f"postgresql://{os.getenv('STUDY_DATA_DB_USER', 'postgres')}:"
            f"{os.getenv('STUDY_DATA_DB_PASSWORD', 'password')}@"
            f"{os.getenv('STUDY_DATA_DB_HOST', 'localhost')}:"
            f"{os.getenv('STUDY_DATA_DB_PORT', '5432')}/"
            f"{os.getenv('STUDY_DATA_DB_NAME', 'study_data_db')}"
        )
        
        # Study Plan DB connection (user data)
        self.study_plan_engine = create_engine(
            f"postgresql://{os.getenv('STUDY_PLAN_DB_USER', 'postgres')}:"
            f"{os.getenv('STUDY_PLAN_DB_PASSWORD', 'password')}@"
            f"{os.getenv('STUDY_PLAN_DB_HOST', 'localhost')}:"
            f"{os.getenv('STUDY_PLAN_DB_PORT', '5432')}/"
            f"{os.getenv('STUDY_PLAN_DB_NAME', 'study_plan_db')}"
        )

    def get_course_data(self) -> pd.DataFrame:
        """Get course data from curriculums_x_module_details in PostgreSQL study_data_db with CSV fallback"""
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
            df = pd.read_sql(query, self.study_data_engine)
            print(f"✅ Loaded {len(df)} courses from PostgreSQL curriculums_x_module_details")
            return df
        except Exception as e:
            print(f"❌ Error loading from PostgreSQL: {e}")
            print("🔄 Attempting to load from CSV fallback...")
            return self._load_csv_fallback()

    def get_user_study_plan(self, user_id: str) -> Optional[dict]:
        """Get user's current study plan and completed courses"""
        try:
            query = """
            SELECT 
                sp.id as study_plan_id,
                sp.degree_program,
                sp.current_semester,
                sp.target_graduation,
                array_agg(DISTINCT spc.course_code) as completed_courses,
                array_agg(DISTINCT spp.course_code) as planned_courses
            FROM study_plans sp
            LEFT JOIN study_plan_completed spc ON sp.id = spc.study_plan_id
            LEFT JOIN study_plan_planned spp ON sp.id = spp.study_plan_id
            WHERE sp.user_id = :user_id
            GROUP BY sp.id, sp.degree_program, sp.current_semester, sp.target_graduation
            """
            
            result = self.study_plan_engine.execute(text(query), user_id=user_id).fetchone()
            
            if result:
                return {
                    'study_plan_id': result.study_plan_id,
                    'degree_program': result.degree_program,
                    'current_semester': result.current_semester,
                    'target_graduation': result.target_graduation,
                    'completed_courses': result.completed_courses or [],
                    'planned_courses': result.planned_courses or []
                }
            return None
            
        except Exception as e:
            print(f"Error getting user study plan: {e}")
            return None

    def _load_csv_fallback(self) -> pd.DataFrame:
        """Load course data from CSV files as fallback when PostgreSQL is not available"""
        try:
            # Try to load module_details.csv which should have the most complete data
            # Path is relative to the project root (two levels up from server/llm-inference-service)
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                   'data-collection', 'csv_tables', 'module_details.csv')
            
            if os.path.exists(csv_path):
                df = pd.read_csv(csv_path)
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
                        print(f"📁 Using alternative CSV: {csv_name} ({len(df)} records)")
                        df = df.fillna('')
                        return df[df['module_id'].notna()]
            
            print("❌ No suitable CSV fallback found")
            return pd.DataFrame()  # Return empty DataFrame if no CSV works
            
        except Exception as e:
            print(f"❌ Error loading CSV fallback: {e}")
            return pd.DataFrame()

# Global database connector instance
db_connector = DatabaseConnector()
