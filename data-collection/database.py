import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    # Get the directory where this script is located
    current_dir = Path(__file__).parent
    env_path = current_dir.parent / '.env'
    load_dotenv(dotenv_path=env_path, override=True)

    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_TUM_URL"),
            dbname=os.getenv("DB_TUM_NAME"),
            user=os.getenv("DB_TUM_USER"),
            password=os.getenv("DB_TUM_PASSWORD"),
            port=os.getenv("DB_TUM_PORT")
        )
        return conn
    except psycopg2.OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return None

def upload_df_to_db(df, table_name, conn):
    """Uploads a pandas DataFrame to a specified table in the database."""
    if conn is None:
        print("No database connection available.")
        return

    try:
        cursor = conn.cursor()
        
        # Drop table if it exists
        cursor.execute(f"DROP TABLE IF EXISTS {table_name};")
        
        # Create table
        columns = ", ".join([f'"{col}" TEXT' for col in df.columns])
        create_query = f"CREATE TABLE IF NOT EXISTS {table_name} ({columns});"
        cursor.execute(create_query)
        
        # Insert rows
        quoted_columns = ", ".join([f'"{col}"' for col in df.columns])
        placeholders = ", ".join(["%s"] * len(df.columns))
        insert_query = f"INSERT INTO {table_name} ({quoted_columns}) VALUES ({placeholders});"
        
        data = [tuple(row) for row in df.itertuples(index=False, name=None)]
        cursor.executemany(insert_query, data)
        
        conn.commit()
        cursor.close()
        print(f"Successfully uploaded {len(df)} rows to '{table_name}' table!")
        
    except Exception as e:
        print(f"Error uploading to database: {e}")
        conn.rollback()