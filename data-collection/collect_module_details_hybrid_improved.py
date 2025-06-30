import requests
from bs4 import BeautifulSoup
import time
import random
import logging
import pandas as pd
from urllib.parse import urlparse, parse_qs
import re
import os
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HybridModuleScraper:
    """
    A hybrid scraper that tries HTTP requests first, then falls back to browser automation if needed.
    This provides the speed benefits of HTTP requests where possible while handling JavaScript-heavy sites.
    """
    
    def __init__(self, save_html=False):
        self.session = requests.Session()
        self.browser_scraper = None
        self.save_html = save_html
        self.html_output_dir = "data-collection/html_contents"
        self.setup_session()
        
        # Create HTML output directory if saving is enabled
        if self.save_html and not os.path.exists(self.html_output_dir):
            os.makedirs(self.html_output_dir)
    
    def setup_session(self):
        """Setup HTTP session with headers to mimic a real browser"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        self.session.timeout = 30
        logger.info("HTTP session setup successfully")
    
    def save_html_to_file(self, html_content, curriculum_id, method):
        """Save HTML content to file for inspection"""
        if not self.save_html:
            return
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"module_{curriculum_id}_{method}_{timestamp}.html"
            filepath = os.path.join(self.html_output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"HTML saved to: {filepath}")
            print(f"HTML content saved to: {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to save HTML: {e}")
    
    def init_browser_scraper(self):
        """Initialize browser scraper only when needed"""
        if self.browser_scraper is None:
            try:
                # Import browser automation libraries only when needed
                from selenium import webdriver
                from selenium.webdriver.chrome.options import Options
                from selenium.webdriver.common.by import By
                from selenium.webdriver.support.ui import WebDriverWait
                from selenium.webdriver.support import expected_conditions as EC
                
                logger.info("Initializing browser scraper as fallback...")
                
                options = Options()
                options.add_argument('--headless=new')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-blink-features=AutomationControlled')
                options.add_argument('--window-size=1920,1080')
                options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36')
                
                self.browser_scraper = webdriver.Chrome(options=options)
                self.browser_scraper.implicitly_wait(10)
                self.browser_scraper.set_page_load_timeout(60)
                
                logger.info("Browser scraper initialized successfully")
                return True
                
            except Exception as e:
                logger.error(f"Failed to initialize browser scraper: {e}")
                return False
        return True
    
    def human_like_wait(self, min_seconds=1, max_seconds=3):
        """Human-like random wait"""
        wait_time = random.uniform(min_seconds, max_seconds)
        time.sleep(wait_time)
    
    def check_for_javascript_requirement(self, html_content):
        """Check if the page requires JavaScript to load content"""
        indicators = [
            "nicht für diesen browser optimiert" in html_content.lower(),
            "not optimised for your browser" in html_content.lower(),
            "not optimized for your browser" in html_content.lower(),
            "javascript" in html_content.lower() and "required" in html_content.lower(),
            len(html_content.strip()) < 1000,  # Very minimal content suggests JS loading
            "<noscript>" in html_content.lower()
        ]
        return any(indicators)
    
    def try_http_extraction(self, url, curriculum_id):
        """Try to extract data using HTTP requests"""
        try:
            logger.info(f"Trying HTTP extraction for: {url}")
            response = self.session.get(url)
            response.raise_for_status()
            
            html_content = response.text
            
            # Save HTTP HTML content
            self.save_html_to_file(html_content, curriculum_id, "HTTP")
            
            # Check if JavaScript is required
            if self.check_for_javascript_requirement(html_content):
                logger.info("JavaScript requirement detected, will need browser fallback")
                return None, True  # None data, needs browser
            
            # Try to extract data from the HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            extracted_data = self.extract_from_html(soup)
            
            # Check if we got useful data
            if extracted_data.get('ID') or extracted_data.get('name'):
                logger.info("Successfully extracted data via HTTP")
                return extracted_data, False  # Got data, no browser needed
            else:
                logger.info("No useful data found in HTTP response")
                return None, True  # No useful data, try browser
                
        except Exception as e:
            logger.error(f"HTTP extraction failed: {e}")
            return None, True  # Failed, try browser
    
    def try_browser_extraction(self, url, curriculum_id):
        """Try to extract data using browser automation"""
        if not self.init_browser_scraper():
            return None
        
        try:
            logger.info(f"Trying browser extraction for: {url}")
            
            # Navigate to the page
            self.browser_scraper.get(url)
            self.human_like_wait(3, 5)
            
            # Wait for dynamic content to load
            try:
                from selenium.webdriver.support.ui import WebDriverWait
                from selenium.webdriver.support import expected_conditions as EC
                from selenium.webdriver.common.by import By
                
                WebDriverWait(self.browser_scraper, 15).until(
                    EC.presence_of_element_located((By.TAG_NAME, "ca-entry"))
                )
            except:
                logger.warning("ca-entry elements not found, continuing anyway")
            
            # Extract data from the page
            page_source = self.browser_scraper.page_source
            
            # Save browser HTML content
            self.save_html_to_file(page_source, curriculum_id, "Browser")
            
            soup = BeautifulSoup(page_source, 'html.parser')
            extracted_data = self.extract_from_html(soup)
            
            logger.info("Browser extraction completed")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Browser extraction failed: {e}")
            return None
    
    def extract_from_html(self, soup):
        """Extract module data from BeautifulSoup object"""
        extracted_data = {}
        
        # Helper function for safe extraction
        def safe_extract(selector):
            try:
                element = soup.select_one(selector)
                if element:
                    text = element.get_text(strip=True)
                    return text if text else None
                return None
            except:
                return None
        
        # Try TUM-specific ca-entry elements first
        ca_entries = soup.select('ca-entry')
        if len(ca_entries) >= 2:
            selectors_to_try = [
                ('ca-entry:nth-of-type(1) .ca-entry-content', 'ca-entry:nth-of-type(2) .ca-entry-content'),
                ('ca-entry:nth-of-type(1)', 'ca-entry:nth-of-type(2)'),
            ]
            
            for name_sel, id_sel in selectors_to_try:
                if not extracted_data.get('name'):
                    extracted_data['name'] = safe_extract(name_sel)
                if not extracted_data.get('ID'):
                    extracted_data['ID'] = safe_extract(id_sel)
                
                if extracted_data.get('name') and extracted_data.get('ID'):
                    break
            
            # Extract additional fields if available
            if len(ca_entries) >= 8:
                field_mappings = [
                    ('credits', 'ca-entry:nth-of-type(3)'),
                    ('version', 'ca-entry:nth-of-type(4)'),
                    ('valid', 'ca-entry:nth-of-type(5)'),
                    ('responsible', 'ca-entry:nth-of-type(6)'),
                    ('organisation', 'ca-entry:nth-of-type(7)'),
                    ('note', 'ca-entry:nth-of-type(8)'),
                ]
                
                for field, selector in field_mappings:
                    if not extracted_data.get(field):
                        extracted_data[field] = safe_extract(f"{selector} .ca-entry-content") or safe_extract(selector)
        
        # Fallback extraction methods
        if not extracted_data.get('ID') or not extracted_data.get('name'):
            # Look for module ID patterns
            if not extracted_data.get('ID'):
                id_patterns = [r'\b\d{6,8}\b']
                for pattern in id_patterns:
                    matches = re.findall(pattern, soup.get_text())
                    if matches:
                        extracted_data['ID'] = matches[0]
                        break
            
            # Look for module names in headers
            if not extracted_data.get('name'):
                for tag in ['h1', 'h2', 'h3']:
                    headers = soup.find_all(tag)
                    for header in headers:
                        text = header.get_text(strip=True)
                        if 15 <= len(text) <= 150 and not text.isdigit():
                            extracted_data['name'] = text
                            break
                    if extracted_data.get('name'):
                        break
        
        return extracted_data
    
    def scrape_module_details(self, transformed_link, curriculum_id, max_retries=3):
        """Main method to scrape module details - simplified for TUM (always needs browser)"""
        
        # Initialize result dictionary
        module_data = {
            'curriculum_ID': curriculum_id,
            'transformed_link': transformed_link,
            'ID': None,
            'name': None,
            'credits': None,
            'version': None,
            'valid': None,
            'responsible': None,
            'organisation': None,
            'note': None,
            'module_level': None,
            'abbreviation': None,
            'subtitle': None,
            'duration': None,
            'occurrence': None,
            'language': None,
            'related_programs': None,
            'total_hours': None,
            'contact_hours': None,
            'self_study_hours': None,
            'description_of_achievement_and_assessment_methods': None,
            'exam_retake_next_semester': None,
            'exam_retake_at_the_end_of_semester': None,
            'prerequisites_recommended': None,
            'intended_learning_outcomes': None,
            'content': None,
            'teaching_and_learning_methods': None,
            'media': None,
            'reading_list': None,
            'extraction_method': None
        }
        
        if not transformed_link:
            return module_data
        
        logger.info(f"Processing curriculum_id {curriculum_id}")
        
        # For TUM, skip HTTP and go straight to browser (since we know it's needed)
        if "campus.tum.de" in transformed_link:
            logger.info(f"TUM URL detected, using browser automation for curriculum_id {curriculum_id}")
            extracted_data = self.try_browser_extraction(transformed_link, curriculum_id)
            
            if extracted_data:
                for key, value in extracted_data.items():
                    if key in module_data:
                        module_data[key] = value
                module_data['extraction_method'] = 'Browser'
                
                if module_data['ID'] or module_data['name']:
                    logger.info(f"Browser extraction successful for curriculum_id {curriculum_id}")
                    return module_data
        else:
            # For non-TUM URLs, try HTTP first then browser fallback
            extracted_data, needs_browser = self.try_http_extraction(transformed_link, curriculum_id)
            
            if extracted_data and (extracted_data.get('ID') or extracted_data.get('name')):
                for key, value in extracted_data.items():
                    if key in module_data:
                        module_data[key] = value
                module_data['extraction_method'] = 'HTTP'
                logger.info(f"HTTP extraction successful for curriculum_id {curriculum_id}")
                return module_data
            
            if needs_browser:
                logger.info(f"Falling back to browser automation for curriculum_id {curriculum_id}")
                extracted_data = self.try_browser_extraction(transformed_link, curriculum_id)
                
                if extracted_data:
                    for key, value in extracted_data.items():
                        if key in module_data:
                            module_data[key] = value
                    module_data['extraction_method'] = 'Browser'
                    
                    if module_data['ID'] or module_data['name']:
                        logger.info(f"Browser extraction successful for curriculum_id {curriculum_id}")
                        return module_data
        
        logger.warning(f"No data extracted for curriculum_id {curriculum_id}")
        module_data['extraction_method'] = 'Failed'
        return module_data
    
    def close(self):
        """Close both HTTP session and browser if initialized"""
        try:
            self.session.close()
            logger.info("HTTP session closed")
        except:
            pass
        
        if self.browser_scraper:
            try:
                self.browser_scraper.quit()
                logger.info("Browser closed")
            except:
                pass

def scrape_all_module_details(module_details_df, save_html=False):
    """Main function to scrape all module details using hybrid approach"""
    scraper = HybridModuleScraper(save_html=save_html)
    
    try:
        updated_df = module_details_df.copy()
        
        # Add extraction_method column if it doesn't exist
        if 'extraction_method' not in updated_df.columns:
            updated_df['extraction_method'] = None
        
        for index, row in module_details_df.iterrows():
            curriculum_id = row['curriculum_ID']
            transformed_link = row['transformed_link']
            
            print(f"\n{'='*50}")
            print(f"Processing curriculum_ID: {curriculum_id}")
            print(f"Link: {transformed_link}")
            
            scraped_data = scraper.scrape_module_details(transformed_link, curriculum_id)
            
            # Update the dataframe
            for key, value in scraped_data.items():
                if key in updated_df.columns:
                    updated_df.at[index, key] = value
            
            print(f"Result - ID: {scraped_data.get('ID', 'None')} | Name: {scraped_data.get('name', 'None')} | Method: {scraped_data.get('extraction_method', 'Unknown')}")
            
            # Shorter delay since HTTP requests are much faster
            time.sleep(random.uniform(1, 2))
        
        return updated_df
        
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        return module_details_df
    finally:
        scraper.close()

def test_single_module(url, curriculum_id, save_html=True):
    """Test function for a single module using hybrid approach with HTML saving"""
    scraper = HybridModuleScraper(save_html=save_html)
    try:
        result = scraper.scrape_module_details(url, curriculum_id)
        print(f"\nTest result: {result}")
        
        if save_html:
            print(f"\nHTML files have been saved to the '{scraper.html_output_dir}' directory")
            print("You can examine these files to see what data is available on the page")
        
        return result
    finally:
        scraper.close()

if __name__ == '__main__':
    # Test with one module and save HTML
    test_url = "https://campus.tum.de/tumonline/ee/ui/ca2/app/desktop/#/slc.cm.reg/student/modules/detail/458129/206?$ctx=lang=en&$scrollTo=toc_details"
    print("Testing hybrid scraper with HTML saving enabled...")
    result = test_single_module(test_url, 2, save_html=True)
    
    # Example of how to use with a DataFrame and HTML saving
    # If you have a module_details_df with curriculum_ID and transformed_link columns:
    # updated_module_details_df = scrape_all_module_details(module_details_df, save_html=True)
    # updated_module_details_df.to_csv('csv_tables/module_details_scraped_hybrid.csv', index=False, encoding='utf-8-sig')