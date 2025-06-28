import pandas as pd
import database
import os
import collect_degree_programs
import collect_curriculums
import collect_module_details

def main():

    # 1. Collect Degree Programs
    print("Collecting degree programs...")
    degree_programs_df = collect_degree_programs.get_degree_programmes()
    if not degree_programs_df.empty:
        degree_programs_df.to_csv('data-collection/csv_tables/degree_programs.csv', index=False, encoding='utf-8-sig')
        print("Degree programs saved to CSV.")

    # 2. Collect Curriculums (Example for M.Sc. Information Systems)
    print("\nCollecting curriculum for M.Sc. Information Systems...")
    msc_info_systems_url = "https://campus.tum.de/tumonline/wbstpcs.showSpoTree?pStStudiumNr=&pSJNr=1621&pStpStpNr=4997&pStartSemester="
    
    # Run in headless mode (no browser window) - change to False for debugging with visible browser
    curriculum_df = collect_curriculums.collect_curriculums(msc_info_systems_url, headless=True)
    
    # TODO: Move somecode into the main function instead of collect_curriculums.py
    if not curriculum_df.empty:
        curriculum_df.to_csv('data-collection/csv_tables/msc_information_systems_curriculum.csv', index=False, encoding='utf-8-sig')
        print("Curriculum for M.Sc. Information Systems saved to CSV.")

    # 3. Collect Module Details
    print("\nCollecting module details...")
    semesters = ['2024w', '2025s']
    courses_df = collect_module_details.get_module_details(semesters)
    if not courses_df.empty:
        courses_df.to_csv('data-collection/csv_tables/courses.csv', index=False, encoding='utf-8-sig')
        print("Module details saved to CSV.")

    # 4. Upload to Database
    print("\nUploading data to the database from CSV files...")
    conn = database.get_db_connection()
    if conn:
        csv_files_to_upload = [
            {
                'file_path': 'data-collection/csv_tables/degree_programs.csv',
                'table_name': 'degree_programs'
            },
            {
                'file_path': 'data-collection/csv_tables/curriculums.csv',
                'table_name': 'curriculums'
            },
            {
                'file_path': 'data-collection/csv_tables/courses.csv',
                'table_name': 'courses'
            },
            {
                'file_path': 'data-collection/csv_tables/module_details_scraped.csv',
                'table_name': 'module_details'
            },
            {
                'file_path': 'data-collection/csv_tables/module_details_dummy.csv',
                'table_name': 'module_details_dummy'
            }
        ]
        
        for csv_info in csv_files_to_upload:
            file_path = csv_info['file_path']
            table_name = csv_info['table_name']
            
            # Check if CSV file exists
            if os.path.exists(file_path):
                try:
                    # Read CSV file into DataFrame
                    df = pd.read_csv(file_path, encoding='utf-8-sig')
                    
                    if not df.empty:
                        # Upload DataFrame to database
                        database.upload_df_to_db(df, table_name, conn)
                        print(f"✅ Successfully uploaded {len(df)} rows from {file_path} to {table_name} table")
                    else:
                        print(f"⚠️  CSV file {file_path} is empty, skipping upload")
                        
                except Exception as e:
                    print(f"❌ Error reading/uploading {file_path}: {e}")
            else:
                print(f"⚠️  CSV file {file_path} not found, skipping upload")
        
        conn.close()
        print("\n✅ Database operations completed.")

if __name__ == '__main__':
    main()