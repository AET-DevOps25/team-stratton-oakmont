import requests
import pandas as pd
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://campus.tum.de/tumonline"

def get_degree_programmes():
    """
    Scrapes the TUM website for a list of degree programs.
    
    Returns:
        pandas.DataFrame: A DataFrame containing the scraped degree programs.
    """
    degree_programs_url = f"{BASE_URL}/wbstpportfolio.wbStpList?pOrgNr=1&pSort=&pLanguageCode=EN&pStpStatus=N&pSjNr=1621"
    
    try:
        response = requests.get(degree_programs_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the page: {e}")
        return pd.DataFrame()

    soup = BeautifulSoup(response.content, "html.parser")
    rows = soup.select("form > table > tbody > tr")[1:]
    
    data = []
    for row in rows:
        tds = row.find_all("td")
        if len(tds) < 6:
            continue
            
        curriculum_div = tds[2].find("div")
        spans = curriculum_div.find_all("span") if curriculum_div else []
        
        curriculum_link = ""
        if len(spans) > 0 and spans[0].find("a"):
            href = spans[0].find("a")["href"]
            if href and not href.strip().lower().startswith("javascript"):
                curriculum_link = urljoin(BASE_URL, href)

        modulhandbuch_link = ""
        if len(spans) > 2 and spans[2].find("a"):
            href = spans[2].find("a")["href"]
            if href and not href.strip().lower().startswith("javascript"):
                modulhandbuch_link = urljoin(BASE_URL, href)

        data.append({
            "Degree": tds[0].get_text(strip=True),
            "ID": tds[1].get_text(strip=True),
            "Curriculum": curriculum_div.get_text(strip=True) if curriculum_div else "",
            "Field of studies": tds[3].get_text(strip=True),
            "ECTS Credits": tds[4].get_text(strip=True),
            "Semester": tds[5].get_text(strip=True),
            "Curriculum Link": curriculum_link,
            "Modulhandbuch Link": modulhandbuch_link,
        })
        
    return pd.DataFrame(data)

if __name__ == '__main__':
    degree_programs_df = get_degree_programmes()
    if not degree_programs_df.empty:
        degree_programs_df.to_csv('csv_tables/degree_programs.csv', index=False, encoding='utf-8-sig')
        print("Successfully saved degree programs to csv_tables/degree_programs.csv")