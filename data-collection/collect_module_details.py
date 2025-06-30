from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup
import time
import random
import logging
import undetected_chromedriver as uc
import pandas as pd

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StealthModuleScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        self.setup_driver()
    
    def setup_driver(self):
        """Setup undetected Chrome driver"""
        try:
            # Use undetected-chromedriver without specifying version
            options = uc.ChromeOptions()
            
            if self.headless:
                options.add_argument('--headless=new')
            
            # Essential stealth options
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_argument('--disable-extensions')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--lang=en-US')
            
            # Disable images for faster loading
            options.add_argument('--disable-images')
            
            # Additional options
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Create driver without specifying version (let it auto-detect)
            self.driver = uc.Chrome(options=options)
            
            # Set timeouts
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(60)
            
            logger.info("Undetected Chrome driver setup successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup undetected driver: {e}")
            # Fallback to regular driver
            self.setup_regular_driver()
    
    def setup_regular_driver(self):
        """Fallback to regular Chrome driver"""
        try:
            options = Options()
            
            if self.headless:
                options.add_argument('--headless=new')
            
            # Anti-detection options
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=options)
            
            # Execute stealth scripts
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Set timeouts
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(60)
            
            logger.info("Regular Chrome driver setup successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup regular driver: {e}")
            raise
    
    def human_like_wait(self, min_seconds=2, max_seconds=5):
        """Human-like random wait"""
        wait_time = random.uniform(min_seconds, max_seconds)
        time.sleep(wait_time)
    
    def check_for_browser_error(self):
        """Check if page contains browser optimization error"""
        try:
            page_source = self.driver.page_source.lower()
            error_phrases = [
                "nicht für diesen browser optimiert",
                "not optimised for your browser",
                "not optimized for your browser",
                "browser wird nicht unterstützt",
                "browser is not supported"
            ]
            return any(phrase in page_source for phrase in error_phrases)
        except:
            return False
    
    def try_accessing_main_page_first(self):
        """Try accessing the main TUM page first to establish session"""
        try:
            logger.info("Accessing main TUM page first...")
            self.driver.get("https://campus.tum.de/tumonline/")
            self.human_like_wait(3, 5)
            
            # Try to find and click English language option
            try:
                english_links = self.driver.find_elements(By.PARTIAL_LINK_TEXT, "English")
                if english_links:
                    english_links[0].click()
                    self.human_like_wait(2, 3)
                    logger.info("Switched to English")
            except:
                pass
            
            return True
        except Exception as e:
            logger.error(f"Failed to access main page: {e}")
            return False
    
    def scrape_module_details(self, transformed_link, curriculum_id, max_retries=3):
        """Scrape module details"""
        
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
            'reading_list': None
        }
        
        if not transformed_link:
            return module_data
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1} for curriculum_id {curriculum_id}")
                
                # On first attempt, try accessing main page first
                if attempt == 0:
                    self.try_accessing_main_page_first()
                
                # Navigate to target page
                logger.info(f"Navigating to: {transformed_link}")
                self.driver.get(transformed_link)
                
                # Wait for page load
                self.human_like_wait(5, 8)
                
                # Check for browser error
                if self.check_for_browser_error():
                    logger.warning(f"Browser optimization error detected (attempt {attempt + 1})")
                    
                    if attempt < max_retries - 1:
                        # Try different strategies
                        if attempt == 1:
                            # Clear cookies and try again
                            self.driver.delete_all_cookies()
                            logger.info("Cleared cookies, retrying...")
                        
                        # Wait longer before retry
                        self.human_like_wait(10, 15)
                        continue
                    else:
                        logger.error(f"Still getting browser error for curriculum_id {curriculum_id}, skipping...")
                        return module_data
                
                # Look for content
                logger.info("Looking for ca-entry elements...")
                
                # Wait for ca-entry elements
                try:
                    WebDriverWait(self.driver, 15).until(
                        EC.presence_of_element_located((By.TAG_NAME, "ca-entry"))
                    )
                    logger.info("Found ca-entry elements")
                except TimeoutException:
                    logger.warning("No ca-entry elements found within timeout")
                
                # Get page source and parse
                page_source = self.driver.page_source
                soup = BeautifulSoup(page_source, 'html.parser')
                
                # Helper function
                def safe_extract(selector):
                    try:
                        element = soup.select_one(selector)
                        if element:
                            text = element.get_text(strip=True)
                            return text if text else None
                        return None
                    except:
                        return None
                
                # Extract basic data
                ca_entries = soup.select('ca-entry')
                logger.info(f"Found {len(ca_entries)} ca-entry elements in page source")
                
                if len(ca_entries) >= 2:
                    # Try different selectors for name and ID
                    selectors_to_try = [
                        ('ca-entry:nth-of-type(1) .ca-entry-content', 'ca-entry:nth-of-type(2) .ca-entry-content'),
                        ('ca-entry:nth-of-type(1)', 'ca-entry:nth-of-type(2)'),
                        ('ca-entry:first-child .ca-entry-content', 'ca-entry:nth-child(2) .ca-entry-content'),
                        ('ca-entry:first-child', 'ca-entry:nth-child(2)')
                    ]
                    
                    for name_sel, id_sel in selectors_to_try:
                        if not module_data['name']:
                            module_data['name'] = safe_extract(name_sel)
                        if not module_data['ID']:
                            module_data['ID'] = safe_extract(id_sel)
                        
                        if module_data['name'] and module_data['ID']:
                            break
                    
                    # Extract other basic fields if we have enough entries
                    if len(ca_entries) >= 8:
                        if not module_data['credits']:
                            module_data['credits'] = safe_extract('ca-entry:nth-of-type(3) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(3)')
                        if not module_data['version']:
                            module_data['version'] = safe_extract('ca-entry:nth-of-type(4) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(4)')
                        if not module_data['valid']:
                            module_data['valid'] = safe_extract('ca-entry:nth-of-type(5) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(5)')
                        if not module_data['responsible']:
                            module_data['responsible'] = safe_extract('ca-entry:nth-of-type(6) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(6)')
                        if not module_data['organisation']:
                            module_data['organisation'] = safe_extract('ca-entry:nth-of-type(7) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(7)')
                        if not module_data['note']:
                            module_data['note'] = safe_extract('ca-entry:nth-of-type(8) .ca-entry-content') or safe_extract('ca-entry:nth-of-type(8)')
                
                # Fallback: look for any text that might be module ID or name
                if not module_data['ID'] or not module_data['name']:
                    logger.info("Using fallback extraction...")
                    all_text_elements = soup.find_all(['div', 'span', 'p', 'td', 'th'])
                    
                    for element in all_text_elements:
                        text = element.get_text(strip=True)
                        if text:
                            # Look for module ID (6+ digit number)
                            if not module_data['ID'] and text.isdigit() and 6 <= len(text) <= 8:
                                module_data['ID'] = text
                                logger.info(f"Found ID via fallback: {text}")
                            
                            # Look for module name (reasonable length text)
                            if (not module_data['name'] and 
                                15 <= len(text) <= 150 and 
                                not text.isdigit() and 
                                "optimiert" not in text.lower() and
                                "error" not in text.lower()):
                                module_data['name'] = text
                                logger.info(f"Found name via fallback: {text[:50]}...")
                            
                            if module_data['ID'] and module_data['name']:
                                break
                
                # Log what we found
                logger.info(f"Extracted - ID: {module_data['ID']}, Name: {module_data['name']}")
                
                # If we found something useful, return it
                if module_data['ID'] or module_data['name']:
                    logger.info(f"Successfully extracted data for curriculum_id {curriculum_id}")
                    return module_data
                else:
                    logger.warning(f"No useful data extracted for curriculum_id {curriculum_id} (attempt {attempt + 1})")
                    
            except Exception as e:
                logger.error(f"Error on attempt {attempt + 1} for curriculum_id {curriculum_id}: {str(e)}")
            
            # Wait before retry
            if attempt < max_retries - 1:
                wait_time = random.uniform(8, 12)
                logger.info(f"Waiting {wait_time:.1f} seconds before retry...")
                time.sleep(wait_time)
        
        logger.error(f"Max retries reached for curriculum_id {curriculum_id}")
        return module_data
    
    def close(self):
        """Close the browser"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Browser closed successfully")
            except:
                pass

def scrape_all_module_details(module_details_df, headless=True):
    """Main function to scrape all module details"""
    scraper = StealthModuleScraper(headless=headless)
    
    try:
        updated_df = module_details_df.copy()
        
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
            
            print(f"Result - ID: {scraped_data.get('ID', 'None')} | Name: {scraped_data.get('name', 'None')}")
            
            # Random delay between requests
            time.sleep(random.uniform(3, 6))
        
        return updated_df
        
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        return module_details_df
    finally:
        scraper.close()

# Test with just one row first
def test_single_module(url, curriculum_id, headless=False):
    """Test function for a single module"""
    scraper = StealthModuleScraper(headless=headless)
    try:
        result = scraper.scrape_module_details(url, curriculum_id)
        print(f"Test result: {result}")
        return result
    finally:
        scraper.close()

if __name__ == '__main__':
    # Test with one module (with visible browser for debugging)
    test_url = "https://campus.tum.de/tumonline/ee/ui/ca2/app/desktop/#/slc.cm.reg/student/modules/detail/458129/206?$ctx=lang=en&$scrollTo=toc_details"
    result = test_single_module(test_url, 2, headless=False)
    
    # Example of how to use with a DataFrame
    # If you have a module_details_df with curriculum_ID and transformed_link columns:
    # updated_module_details_df = scrape_all_module_details(module_details_df, headless=True)
    # updated_module_details_df.to_csv('csv_tables/module_details_scraped.csv', index=False, encoding='utf-8-sig')