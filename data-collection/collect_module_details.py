import requests
from bs4 import BeautifulSoup
import time
import random
import logging
import pandas as pd
from urllib.parse import urlparse, parse_qs
import re
import os
import argparse
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
        
        # Get the directory of this script for relative paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.html_output_dir = os.path.join(script_dir, "html_contents")
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
                print("Setting up Chrome options...")
                
                options = Options()
                options.add_argument('--headless=new')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-blink-features=AutomationControlled')
                options.add_argument('--window-size=1920,1080')
                options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36')
                
                print("Starting Chrome WebDriver...")
                self.browser_scraper = webdriver.Chrome(options=options)
                print("Setting timeouts...")
                self.browser_scraper.implicitly_wait(10)
                self.browser_scraper.set_page_load_timeout(60)
                
                logger.info("Browser scraper initialized successfully")
                print("Browser scraper ready!")
                return True
                
            except Exception as e:
                logger.error(f"Failed to initialize browser scraper: {e}")
                print(f"Browser initialization failed: {e}")
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
            
            # Extract expected module ID from URL for verification
            expected_module_id = None
            if 'detail/' in url:
                try:
                    expected_module_id = url.split('detail/')[1].split('/')[0]
                    logger.info(f"Expected module ID from URL: {expected_module_id}")
                except Exception:
                    pass
            
            # For SPA (single page application) URLs, we need to force a fresh browser session
            # Close and reinitialize browser to ensure fresh session
            if self.browser_scraper:
                try:
                    self.browser_scraper.quit()
                    logger.info("Closed previous browser session for fresh start")
                except Exception as e:
                    logger.warning(f"Error closing previous browser session: {e}")
                self.browser_scraper = None
            
            # Reinitialize browser with retry logic
            max_browser_retries = 3
            for retry in range(max_browser_retries):
                if self.init_browser_scraper():
                    break
                logger.warning(f"Browser initialization attempt {retry + 1} failed, retrying...")
                time.sleep(2)
            else:
                logger.error("Failed to initialize browser after multiple attempts")
                return None
            
            # Navigate to the page
            logger.info(f"Navigating to URL: {url}")
            self.browser_scraper.get(url)
            
            # Wait for the page to load and change
            self.wait_for_page_change(expected_module_id)
            
            # Additional human-like wait
            self.human_like_wait(2, 4)
            
            # Extract data from the page
            page_source = self.browser_scraper.page_source
            
            # Verify we're on the right page by checking for the expected module ID
            if expected_module_id and expected_module_id not in page_source:
                logger.warning(f"Expected module ID {expected_module_id} not found in page content")
                # Try a longer wait and check again
                logger.info("Waiting longer for page to load...")
                time.sleep(5)
                page_source = self.browser_scraper.page_source
                if expected_module_id not in page_source:
                    logger.error(f"Still no expected module ID {expected_module_id} found after extended wait")
                else:
                    logger.info(f"Found expected module ID {expected_module_id} after extended wait")
            
            # Save browser HTML content
            self.save_html_to_file(page_source, curriculum_id, "Browser")
            
            soup = BeautifulSoup(page_source, 'html.parser')
            extracted_data = self.extract_from_html(soup)
            
            # Log what we extracted for debugging
            logger.info(f"Extracted data for curriculum_id {curriculum_id}: ID={extracted_data.get('ID', 'None')}, Name={extracted_data.get('name', 'None')}")
            
            logger.info("Browser extraction completed")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Browser extraction failed: {e}")
            return None
    
    def extract_from_html(self, soup):
        """Extract module data from BeautifulSoup object"""
        extracted_data = {}
        
        # Helper function for safe extraction
        def safe_extract_text(element):
            if element:
                text = element.get_text(strip=True)
                return text if text else None
            return None
        
        # Helper function to find ca-entry by label and extract value
        def extract_ca_entry_value(label_text):
            ca_entries = soup.find_all('ca-entry')
            for entry in ca_entries:
                label = entry.find('label')
                if label and label_text.lower() in label.get_text(strip=True).lower():
                    # Look for the value in the second column (col-md-8)
                    value_div = entry.select_one('.col-md-8')
                    if value_div:
                        # Try different value selectors
                        value_selectors = [
                            '.ng-star-inserted',
                            'span.ng-star-inserted', 
                            'div.ng-star-inserted',
                            'span',
                            'div'
                        ]
                        
                        for selector in value_selectors:
                            value_element = value_div.select_one(selector)
                            if value_element:
                                # Skip elements that contain nested ca-entry or complex structures
                                if not value_element.find('ca-entry') and not value_element.find('mat-icon'):
                                    text = safe_extract_text(value_element)
                                    if text and text not in ['None', '']:
                                        return text if text != '-' else '-'
                        
                        # Fallback: get direct text content, cleaning up
                        text = safe_extract_text(value_div)
                        if text:
                            # Clean up common prefixes/suffixes
                            text = text.replace('Credits may vary according to SPO version', '').strip()
                            if text and text not in ['None', '']:
                                return text if text != '-' else '-'
            return None
        
        # Extract basic fields using the label-based approach
        field_mappings = {
            'name': ['Name'],
            'ID': ['Module ID'],
            'credits': ['ECTS credits', 'Credits'],
            'version': ['Version'],
            'valid': ['Valid'],
            'responsible': ['Responsible for Module'],
            'organisation': ['Organisation', 'Organization'],
            'note': ['Note'],
            'module_level': ['Module Level'],
            'abbreviation': ['Abbrevation', 'Abbreviation'],  # Note: TUM has a typo "Abbrevation"
            'subtitle': ['Subtitle'],
            'duration': ['Duration'],
            'occurrence': ['Occurrence'],
            'language': ['Language'],
            'related_programs': ['Related Programs'],
            'total_hours': ['Total Hours', 'Total Workload'],
            'contact_hours': ['Contact Hours'],
            'self_study_hours': ['Self Study Hours', 'Self-Study Hours'],
            'description_of_achievement_and_assessment_methods': ['Description of achievement and assessment methods'],
            'exam_retake_next_semester': ['Exam retake next semester'],
            'exam_retake_at_the_end_of_semester': ['Exam retake at the end of semester'],
            'prerequisites_recommended': ['Prerequisites (recommended)', 'Prerequisites recommended'],
            'intended_learning_outcomes': ['Intended Learning Outcomes'],
            'content': ['Content'],
            'teaching_and_learning_methods': ['Teaching and Learning Methods'],
            'media': ['Media'],
            'reading_list': ['Reading List', 'Literature']
        }
        
        # Extract each field
        for field, possible_labels in field_mappings.items():
            if field not in extracted_data or not extracted_data.get(field):
                for label in possible_labels:
                    value = extract_ca_entry_value(label)
                    if value:
                        # Clean up specific fields
                        if field == 'credits':
                            # Extract just the number for credits and convert to int
                            import re
                            match = re.search(r'(\d+)', value)
                            extracted_data[field] = int(match.group(1)) if match else value
                        elif field in ['total_hours', 'contact_hours', 'self_study_hours']:
                            # Extract numbers for hour fields and convert to int
                            import re
                            match = re.search(r'(\d+)', value)
                            if match:
                                extracted_data[field] = int(match.group(1))
                            elif value == '-':
                                extracted_data[field] = None
                            else:
                                extracted_data[field] = value
                        elif field == 'responsible':
                            # Extract just the name, remove any title prefixes
                            import re
                            if 'Bichler, Martin' in value:
                                extracted_data[field] = 'Bichler, Martin'
                            else:
                                # Generic cleanup for other names
                                name_match = re.search(r'([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)', value)
                                extracted_data[field] = name_match.group(1) if name_match else value
                        else:
                            extracted_data[field] = value
                        break
        
        # Special handling for fields that might be in different sections or formats
        if not extracted_data.get('ID'):
            # Look for module ID patterns in text
            import re
            id_patterns = [r'\bIN\d+\b', r'\b[A-Z]{2,}\d{4,}\b']
            text_content = soup.get_text()
            for pattern in id_patterns:
                matches = re.findall(pattern, text_content)
                if matches:
                    extracted_data['ID'] = matches[0]
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

    def ensure_fresh_page_load(self):
        """Ensure fresh page load by clearing cache and waiting"""
        if self.browser_scraper:
            try:
                # Clear browser cache and cookies to ensure fresh load
                self.browser_scraper.delete_all_cookies()
                # Add a small delay to ensure cleanup
                time.sleep(1)
            except Exception as e:
                logger.warning(f"Could not clear browser cache: {e}")

    def wait_for_page_change(self, expected_module_id=None):
        """Wait for the page to actually change to the new module"""
        if not self.browser_scraper:
            return
        
        try:
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.by import By
            
            # Wait for the page to load with new content
            WebDriverWait(self.browser_scraper, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "ca-entry"))
            )
            
            # Additional wait for dynamic content
            time.sleep(3)
            
            # If we have an expected module ID, verify we're on the right page
            if expected_module_id:
                page_source = self.browser_scraper.page_source
                if expected_module_id not in page_source:
                    logger.warning(f"Expected module ID {expected_module_id} not found in page, might be wrong page")
                    
        except Exception as e:
            logger.warning(f"Error waiting for page change: {e}")

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

def run_module_details_scraping(test_mode=False):
    """
    Main function to run module details scraping - can be called from other scripts.
    
    Args:
        test_mode (bool): If True, only process first 3 entries with HTML saving.
                         If False, process all entries without HTML saving.
    
    Returns:
        tuple: (success: bool, message: str, stats: dict)
    """
    try:
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load the module details CSV
        csv_file_path = os.path.join(script_dir, 'csv_tables', 'module_details.csv')
        output_csv_path = os.path.join(script_dir, 'csv_tables', 'module_details_scraped.csv')
        
        print("Loading module details CSV...")
        module_details_df = pd.read_csv(csv_file_path)
        print(f"Loaded {len(module_details_df)} entries from {csv_file_path}")
        
        # Check required columns
        if 'transformed_link' not in module_details_df.columns:
            return False, "Error: 'transformed_link' column not found in CSV", {}
        
        if 'curriculum_ID' not in module_details_df.columns:
            return False, "Error: 'curriculum_ID' column not found in CSV", {}
        
        # Filter for test mode if requested
        if test_mode:
            print("TEST MODE: Only processing the first 3 entries with HTML saving enabled")
            module_details_df = module_details_df.head(3)
            save_html = True  # Save HTML in test mode for debugging
        else:
            print("PRODUCTION MODE: Processing all entries without HTML saving")
            save_html = False  # Don't save HTML in production to avoid hundreds of files
        
        # Initialize scraper
        scraper = HybridModuleScraper(save_html=save_html)
        
        try:
            print(f"\nStarting scraping process for {len(module_details_df)} entries...")
            print("="*70)
            
            # Iterate over each row in the dataframe
            for index, row in module_details_df.iterrows():
                curriculum_id = row.get('curriculum_ID', index)
                transformed_link = row.get('transformed_link', '')
                
                print(f"\nProcessing entry {index + 1}/{len(module_details_df)}")
                print(f"Curriculum ID: {curriculum_id}")
                print(f"Link: {transformed_link}")
                
                if pd.isna(transformed_link) or not transformed_link:
                    print("Skipping: No transformed_link provided")
                    continue
                
                # Scrape module details
                scraped_data = scraper.scrape_module_details(transformed_link, curriculum_id)
                
                # Update the dataframe with scraped data
                for key, value in scraped_data.items():
                    if key in module_details_df.columns:
                        # Handle pandas dtype warnings by explicitly converting data types
                        if key in ['credits', 'total_hours', 'contact_hours', 'self_study_hours']:
                            # Convert numeric fields to float first
                            try:
                                module_details_df.at[index, key] = float(value) if value is not None else None
                            except (ValueError, TypeError):
                                module_details_df.at[index, key] = value
                        else:
                            # Convert all other fields to string to avoid dtype issues
                            module_details_df.at[index, key] = str(value) if value is not None else None
                    else:
                        # Add new column if it doesn't exist
                        if key not in module_details_df.columns:
                            module_details_df[key] = None
                        if key in ['credits', 'total_hours', 'contact_hours', 'self_study_hours']:
                            try:
                                module_details_df.at[index, key] = float(value) if value is not None else None
                            except (ValueError, TypeError):
                                module_details_df.at[index, key] = value
                        else:
                            module_details_df.at[index, key] = str(value) if value is not None else None
                
                # Print results
                result_id = scraped_data.get('ID', 'None')
                result_name = scraped_data.get('name', 'None')
                result_method = scraped_data.get('extraction_method', 'Unknown')
                
                print(f"Result - ID: {result_id} | Name: {result_name} | Method: {result_method}")
                
                # Save progress after each entry (in case of interruption)
                module_details_df.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
                print(f"Progress saved to {output_csv_path}")
                
                # Delay between requests to be respectful
                if index < len(module_details_df) - 1:  # Don't wait after last entry
                    import time, random
                    wait_time = random.uniform(2, 4)
                    print(f"Waiting {wait_time:.1f} seconds before next request...")
                    time.sleep(wait_time)
            
            print("\n" + "="*70)
            print("Scraping completed successfully!")
            print(f"Results saved to: {output_csv_path}")
            
            # Calculate summary statistics
            successful_extractions = module_details_df[
                module_details_df['extraction_method'].isin(['HTTP', 'Browser'])
            ].shape[0]
            failed_extractions = module_details_df[
                module_details_df['extraction_method'] == 'Failed'
            ].shape[0]
            
            stats = {
                'total_processed': len(module_details_df),
                'successful': successful_extractions,
                'failed': failed_extractions,
                'success_rate': successful_extractions/len(module_details_df)*100 if len(module_details_df) > 0 else 0
            }
            
            print(f"Summary:")
            print(f"  - Total entries processed: {stats['total_processed']}")
            print(f"  - Successful extractions: {stats['successful']}")
            print(f"  - Failed extractions: {stats['failed']}")
            print(f"  - Success rate: {stats['success_rate']:.1f}%")
            
            return True, f"Scraping completed successfully! Results saved to: {output_csv_path}", stats
            
        except KeyboardInterrupt:
            print("\nScraping interrupted by user")
            print(f"Partial results saved to: {output_csv_path}")
            return False, "Scraping interrupted by user", {}
        finally:
            scraper.close()
            
    except FileNotFoundError:
        error_msg = f"Error: Could not find CSV file at {csv_file_path}"
        print(error_msg)
        print("Please make sure the file exists in the csv_tables directory")
        return False, error_msg, {}
    except Exception as e:
        error_msg = f"Error: {e}"
        print(error_msg)
        return False, error_msg, {}

def main():
    # Configuration - change these to control behavior
    TEST_MODE = False  # Set to True to only process first entry, False to process all entries
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load the module details CSV
    csv_file_path = os.path.join(script_dir, 'csv_tables', 'module_details.csv')
    output_csv_path = os.path.join(script_dir, 'csv_tables', 'module_details_scraped.csv')
    
    try:
        print("Loading module details CSV...")
        module_details_df = pd.read_csv(csv_file_path)
        print(f"Loaded {len(module_details_df)} entries from {csv_file_path}")
        
        # Check required columns
        if 'transformed_link' not in module_details_df.columns:
            print("Error: 'transformed_link' column not found in CSV")
            exit(1)
        
        if 'curriculum_ID' not in module_details_df.columns:
            print("Error: 'curriculum_ID' column not found in CSV")
            exit(1)
        
        # Filter for test mode if requested
        if TEST_MODE:
            print("TEST MODE: Only processing the first 3 entries with HTML saving enabled")
            module_details_df = module_details_df.head(3)
            save_html = True  # Save HTML in test mode for debugging
        else:
            print("PRODUCTION MODE: Processing all entries without HTML saving")
            save_html = False  # Don't save HTML in production to avoid hundreds of files
        
        # Initialize scraper
        scraper = HybridModuleScraper(save_html=save_html)
        
        try:
            print(f"\nStarting scraping process for {len(module_details_df)} entries...")
            print("="*70)
            
            # Iterate over each row in the dataframe
            for index, row in module_details_df.iterrows():
                curriculum_id = row.get('curriculum_ID', index)
                transformed_link = row.get('transformed_link', '')
                
                print(f"\nProcessing entry {index + 1}/{len(module_details_df)}")
                print(f"Curriculum ID: {curriculum_id}")
                print(f"Link: {transformed_link}")
                
                if pd.isna(transformed_link) or not transformed_link:
                    print("Skipping: No transformed_link provided")
                    continue
                
                # Scrape module details
                scraped_data = scraper.scrape_module_details(transformed_link, curriculum_id)
                
                # Update the dataframe with scraped data
                for key, value in scraped_data.items():
                    if key in module_details_df.columns:
                        # Handle pandas dtype warnings by explicitly converting data types
                        if key in ['credits', 'total_hours', 'contact_hours', 'self_study_hours']:
                            # Convert numeric fields to float first
                            try:
                                module_details_df.at[index, key] = float(value) if value is not None else None
                            except (ValueError, TypeError):
                                module_details_df.at[index, key] = value
                        else:
                            # Convert all other fields to string to avoid dtype issues
                            module_details_df.at[index, key] = str(value) if value is not None else None
                    else:
                        # Add new column if it doesn't exist
                        if key not in module_details_df.columns:
                            module_details_df[key] = None
                        if key in ['credits', 'total_hours', 'contact_hours', 'self_study_hours']:
                            try:
                                module_details_df.at[index, key] = float(value) if value is not None else None
                            except (ValueError, TypeError):
                                module_details_df.at[index, key] = value
                        else:
                            module_details_df.at[index, key] = str(value) if value is not None else None
                
                # Print results
                result_id = scraped_data.get('ID', 'None')
                result_name = scraped_data.get('name', 'None')
                result_method = scraped_data.get('extraction_method', 'Unknown')
                
                print(f"Result - ID: {result_id} | Name: {result_name} | Method: {result_method}")
                
                # Save progress after each entry (in case of interruption)
                module_details_df.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
                print(f"Progress saved to {output_csv_path}")
                
                # Delay between requests to be respectful
                if index < len(module_details_df) - 1:  # Don't wait after last entry
                    wait_time = random.uniform(2, 4)
                    print(f"Waiting {wait_time:.1f} seconds before next request...")
                    time.sleep(wait_time)
            
            print("\n" + "="*70)
            print("Scraping completed successfully!")
            print(f"Results saved to: {output_csv_path}")
            
            # Print summary statistics
            successful_extractions = module_details_df[
                module_details_df['extraction_method'].isin(['HTTP', 'Browser'])
            ].shape[0]
            failed_extractions = module_details_df[
                module_details_df['extraction_method'] == 'Failed'
            ].shape[0]
            
            print(f"Summary:")
            print(f"  - Total entries processed: {len(module_details_df)}")
            print(f"  - Successful extractions: {successful_extractions}")
            print(f"  - Failed extractions: {failed_extractions}")
            print(f"  - Success rate: {successful_extractions/len(module_details_df)*100:.1f}%")
            
        except KeyboardInterrupt:
            print("\nScraping interrupted by user")
            print(f"Partial results saved to: {output_csv_path}")
        finally:
            scraper.close()
            
    except FileNotFoundError:
        print(f"Error: Could not find CSV file at {csv_file_path}")
        print("Please make sure the file exists in the csv_tables directory")
    except Exception as e:
        print(f"Error: {e}")
        
    print(f"\nTo change mode, edit TEST_MODE variable in the script:")
    print(f"  TEST_MODE = True   # Process only first entry with HTML saving")
    print(f"  TEST_MODE = False  # Process all entries without HTML saving")

# ...existing code...