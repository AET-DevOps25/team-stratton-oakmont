import requests
import pandas as pd

def get_module_details(semester_keys):
    """
    Fetches module details from the TUM API for the given semesters.

    Args:
        semester_keys (list): A list of semester keys (e.g., ['2024w', '2025s']).

    Returns:
        pandas.DataFrame: A DataFrame containing the details of all modules.
    """
    all_courses = []
    for semester_key in semester_keys:
        offset = 0
        limit = 200
        while True:
            params = {"limit": limit, "offset": offset, "semester_key": semester_key}
            try:
                response = requests.get("https://api.srv.nat.tum.de/api/v1/course/", params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data.get('hits'):
                    break
                
                all_courses.extend(data['hits'])
                
                if offset >= data.get('total_count', 0):
                    break
                offset += limit
            except requests.exceptions.RequestException as e:
                print(f"Error fetching data for semester {semester_key}: {e}")
                break
    
    return pd.json_normalize(all_courses)

if __name__ == '__main__':
    semesters = ['2024w', '2025s']
    courses_df = get_module_details(semesters)
    if not courses_df.empty:
        courses_df.to_csv('csv_tables/courses.csv', index=False, encoding='utf-8-sig')
        print("Successfully saved course details to csv_tables/courses.csv")