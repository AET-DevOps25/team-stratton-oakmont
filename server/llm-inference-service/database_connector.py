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
        """Get course data from PostgreSQL study_data_db"""
        try:
            query = """
            SELECT 
                course_code,
                course_name,
                course_name_en,
                description,
                description_en,
                semester_title,
                hoursperweek,
                instruction_languages,
                org_name,
                tumonline_url,
                ects_credits
            FROM courses 
            WHERE course_code IS NOT NULL 
                AND course_name IS NOT NULL
            """
            
            df = pd.read_sql(query, self.study_data_engine)
            print(f"Loaded {len(df)} courses from study_data_db")
            return df
            
        except Exception as e:
            print(f"Error loading from PostgreSQL: {e}")
            print("Falling back to CSV file...")
            return self.get_course_data_from_csv()

    def get_course_data_from_csv(self) -> pd.DataFrame:
        """Fallback: Get course data from CSV file"""
        try:
            csv_path = "../data-collection/csv_tables/modules.csv"
            if not os.path.exists(csv_path):
                csv_path = "/app/data/modules.csv"
            
            df = pd.read_csv(csv_path)
            df = df.dropna(subset=['course_code', 'course_name'])
            print(f"Loaded {len(df)} courses from CSV file")
            return df
            
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return pd.DataFrame()

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

# Global database connector instance
db_connector = DatabaseConnector()
