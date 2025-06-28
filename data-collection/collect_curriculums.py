import time
import logging
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from bs4 import BeautifulSoup

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE_URL = "https://campus.tum.de/tumonline"

def setup_driver(headless=True):
    """Set up Chrome driver with robust options"""
    chrome_options = Options()
    
    # Headless mode configuration
    if headless:
        chrome_options.add_argument("--headless=new")
        logger.info("Running in headless mode")
        
        # Additional optimizations for headless mode
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-background-timer-throttling")
        chrome_options.add_argument("--disable-backgrounding-occluded-windows")
        chrome_options.add_argument("--disable-renderer-backgrounding")
        chrome_options.add_argument("--disable-features=TranslateUI")
        chrome_options.add_argument("--no-first-run")
        chrome_options.add_argument("--disable-default-apps")
    else:
        logger.info("Running with visible browser")
    
    # Core stability options
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-plugins")
    chrome_options.add_argument("--disable-images")  # Faster loading
    chrome_options.add_argument("--disable-javascript-harmony")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--remote-debugging-port=9222")
    
    # Memory and performance options
    chrome_options.add_argument("--memory-pressure-off")
    chrome_options.add_argument("--max_old_space_size=4096")
    
    # Window size to prevent UI issues
    chrome_options.add_argument("--window-size=1920,1080")
    
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Add prefs to prevent crashes
    prefs = {
        "profile.default_content_setting_values": {
            "notifications": 2,
            "media_stream": 2,
        }
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Set timeouts
    driver.implicitly_wait(10)
    driver.set_page_load_timeout(30)
    
    return driver

def is_driver_alive(driver):
    """Check if the driver session is still alive"""
    try:
        driver.current_url
        return True
    except WebDriverException:
        return False

def switch_to_english(driver):
    """Switch language from DE to EN"""
    try:
        logger.info("Attempting to switch language to English...")
        
        # Wait for language switcher button to be present
        wait = WebDriverWait(driver, 10)
        lang_button = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.coa-lang-switcher"))
        )
        
        # Click the language switcher button
        if safe_click_element(driver, lang_button, "Language switcher button"):
            time.sleep(1)  # Wait for dropdown to open
            
            # Look for English option in the dropdown menu with the specific class and attributes
            try:
                english_option = wait.until(
                    EC.element_to_be_clickable((
                        By.CSS_SELECTOR, 
                        "button[mat-menu-item][title='Language English'], button.mat-mdc-menu-item[title='Language English']"
                    ))
                )
                
                if safe_click_element(driver, english_option, "English language option"):
                    logger.info("Successfully switched to English")
                    time.sleep(1)  # Wait for language change to take effect
                    return True
                else:
                    logger.warning("Failed to click English option")
                    return False
                    
            except TimeoutException:
                # Fallback: try to find by text content
                try:
                    english_option = wait.until(
                        EC.element_to_be_clickable((
                            By.XPATH, 
                            "//button[contains(@class, 'mat-mdc-menu-item') and contains(., 'EN')]"
                        ))
                    )
                    
                    if safe_click_element(driver, english_option, "English language option (fallback)"):
                        logger.info("Successfully switched to English using fallback selector")
                        time.sleep(1)
                        return True
                    else:
                        logger.warning("Failed to click English option with fallback")
                        return False
                        
                except TimeoutException:
                    logger.warning("English option not found in dropdown with any selector")
                    return False
        else:
            logger.warning("Failed to click language switcher")
            return False
            
    except Exception as e:
        logger.error(f"Error switching language: {e}")
        return False

def safe_click_element(driver, element, element_name="element"):
    """Safely click an element with error handling"""
    try:
        if not is_driver_alive(driver):
            logger.error("Driver session is not alive")
            return False
            
        # Scroll element into view
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        time.sleep(0.3)
        
        # Wait for element to be clickable
        WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable(element)
        )
        
        # Try regular click first
        try:
            element.click()
        except WebDriverException:
            # Fallback to JavaScript click
            driver.execute_script("arguments[0].click();", element)
        
        logger.info(f"Successfully clicked: {element_name}")
        return True
        
    except TimeoutException:
        logger.warning(f"Timeout waiting for {element_name} to be clickable")
        return False
    except WebDriverException as e:
        logger.error(f"WebDriver error clicking {element_name}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error clicking {element_name}: {e}")
        return False

def click_expandable_elements_robust(driver, max_depth=3, batch_size=10):
    """
    Robustly click on expandable elements with session recovery
    """
    wait = WebDriverWait(driver, 10)
    
    for depth in range(max_depth):
        logger.info(f"Scanning depth level {depth + 1}...")
        
        try:
            if not is_driver_alive(driver):
                logger.error("Driver session died, cannot continue")
                return False
            
            # Find all expandable links
            expandable_links = driver.find_elements(
                By.CSS_SELECTOR, 
                "a.KnotenLink[id$='-toggle']"
            )
            
            logger.info(f"Found {len(expandable_links)} expandable elements at depth {depth + 1}")
            
            if not expandable_links:
                logger.info(f"No more expandable elements found at depth {depth + 1}")
                break
            
            # Process elements in batches to prevent session timeout
            for batch_start in range(0, len(expandable_links), batch_size):
                batch_end = min(batch_start + batch_size, len(expandable_links))
                batch = expandable_links[batch_start:batch_end]
                
                logger.info(f"Processing batch {batch_start//batch_size + 1}: elements {batch_start+1} to {batch_end}")
                
                for i, link in enumerate(batch):
                    global_index = batch_start + i + 1
                    
                    try:
                        if not is_driver_alive(driver):
                            logger.error(f"Driver session died at element {global_index}")
                            return False
                        
                        # Check if already expanded
                        style_attr = link.get_attribute("style")
                        if style_attr and "minus" in style_attr:
                            logger.info(f"Element {global_index} already expanded, skipping...")
                            continue
                        
                        # Get element text for logging
                        try:
                            span_element = link.find_element(By.CSS_SELECTOR, "span.KnotenText")
                            element_text = span_element.text.strip()[:50]  # Limit length
                        except:
                            element_text = f"Element {global_index}"
                        
                        # Safe click
                        if safe_click_element(driver, link, element_text):
                            # Wait for content to load
                            time.sleep(1)
                        else:
                            logger.warning(f"Failed to click element {global_index}: {element_text}")
                        
                        # Check session health every few clicks
                        if global_index % 5 == 0:
                            if not is_driver_alive(driver):
                                logger.error(f"Driver session died after element {global_index}")
                                return False
                            logger.info(f"Session health check passed at element {global_index}")
                        
                    except WebDriverException as e:
                        logger.error(f"WebDriver error at element {global_index}: {e}")
                        if "session deleted" in str(e) or "not connected" in str(e):
                            logger.error("Session terminated, stopping")
                            return False
                    except Exception as e:
                        logger.error(f"Unexpected error at element {global_index}: {e}")
                
                # Pause between batches
                logger.info(f"Completed batch, pausing...")
                time.sleep(1)
            
            # Pause between depth levels
            time.sleep(1)
            
        except WebDriverException as e:
            logger.error(f"WebDriver error at depth {depth + 1}: {e}")
            if "session deleted" in str(e) or "not connected" in str(e):
                return False
        except Exception as e:
            logger.error(f"Unexpected error at depth {depth + 1}: {e}")
    
    return True

def parse_curriculum_data(soup, study_program_id="121"):
    """
    Parse the curriculum data from BeautifulSoup object using the logic from the notebook
    
    Args:
        soup: BeautifulSoup object containing the page HTML
        study_program_id: ID of the study program (default: "121" for M.Sc. Information Systems)
    
    Returns:
        pandas.DataFrame: Parsed curriculum data
    """
    # Create a DataFrame to store the curriculum information
    curriculum_df = pd.DataFrame(columns=["Study_Program_ID", "Name (1)", "Name (2)", "Name (3)", "Link", "Credits", "GF"])
    
    # Get all nodes
    nodes = soup.select("tr.coRow")
    logger.info(f"Found {len(nodes)} curriculum nodes to parse")
    
    # Dictionary to store names by their node IDs for hierarchy tracking
    node_names = {}
    
    # Variables to track previous element
    previous_name_starts_with_bracket = False
    previous_level = -1
    is_first_element = True
    
    for node in nodes[1:]:  # Skip header row
        # Skip invisible nodes
        classes = node.get('class', [])
        if 'invisible' in classes:
            continue
        
        # Get the node information from the tr element
        node_study_program_id = study_program_id
        node_id = node.get('id', '')
        
        # Skip if no node ID
        if not node_id or not node_id.startswith('kn'):
            continue
        
        # Get node name
        tds = node.select("td")
        node_name = ""
        if len(tds) > 0:
            name_elem = tds[0].select_one("div > span > a:first-of-type > span")
            node_name = name_elem.get_text(strip=True) if name_elem else ""
        
        # Get all kn classes (these represent parent nodes in the hierarchy)
        kn_classes = [cls for cls in classes if cls.startswith('kn')]
        
        # Determine current level based on number of kn classes in the class attribute
        current_level = len(kn_classes)
        
        # Check if we should skip this element based on previous element
        # BUT exclude the first element from this rule
        if not is_first_element and previous_name_starts_with_bracket and current_level > previous_level:
            continue
        
        # Store the name for this node ID
        node_names[node_id] = node_name
        
        # Initialize name columns
        name_1, name_2, name_3 = "", "", ""
        
        if current_level == 1:
            # Level 1: 1 kn class in class attribute (child of level 0)
            name_1 = node_name
            name_2 = ""
            name_3 = ""
        elif current_level == 2:
            # Level 2: 2 kn classes in class attribute (child of level 1)
            name_1 = node_names.get(kn_classes[1], "") if len(kn_classes) > 1 else ""
            name_2 = node_name
            name_3 = ""
        elif current_level == 3:
            # Level 3: 3 kn classes in class attribute (child of level 2)
            name_1 = node_names.get(kn_classes[1], "") if len(kn_classes) > 1 else ""
            name_2 = node_names.get(kn_classes[2], "") if len(kn_classes) > 2 else ""
            name_3 = node_name
        else:
            # Skip if more than 3 levels
            continue
        
        # Get other node information
        # Get node_link from td[2]/div/span/a
        node_link = ""
        if len(tds) > 1:
            link_elem = tds[1].select_one("div > span > a")
            # check if its only # 
            node_link = link_elem.get('href', '') if link_elem and link_elem.get('href', '') != '#' else ""
            # if node_link is not empty
            if node_link:
                # Ensure the link is absolute
                node_link = BASE_URL + '/' + node_link

        # Get node_credits from td[4]/div/span
        node_credits = ""
        if len(tds) > 3:
            credits_elem = tds[3].select_one("div > span")
            node_credits = credits_elem.get_text(strip=True) if credits_elem else ""
        
        # Get node_gf from td[5]/div/span
        node_gf = ""
        if len(tds) > 4:
            gf_elem = tds[4].select_one("div > span")
            node_gf = gf_elem.get_text(strip=True) if gf_elem else ""

        # Save in dataframe
        new_row = pd.DataFrame([{
            "ID": len(curriculum_df) + 1, 
            "Study_Program_ID": node_study_program_id,
            "Name (1)": name_1,
            "Name (2)": name_2,
            "Name (3)": name_3,
            "Link": node_link,
            "Credits": node_credits,
            "GF": node_gf,
            "Module_ID": ''
        }])
        curriculum_df = pd.concat([curriculum_df, new_row], ignore_index=True)

        # Update tracking variables for next iteration
        previous_name_starts_with_bracket = node_name.startswith('[')
        previous_level = current_level
        is_first_element = False  # Mark that we've processed the first element
    
    logger.info(f"Successfully parsed {len(curriculum_df)} curriculum entries")
    return curriculum_df

def collect_curriculums(url, study_program_id="121", headless=True):
    """
    Scrapes the curriculum for a given degree program URL with robust error handling and parsing.

    Args:
        url (str): The URL of the curriculum page.
        study_program_id (str): ID of the study program (default: "121" for M.Sc. Information Systems)
        headless (bool): Whether to run browser in headless mode (default: True)

    Returns:
        pandas.DataFrame: A DataFrame containing the scraped curriculum data.
    """
    driver = None
    
    try:
        driver = setup_driver(headless=headless)
        
        # Navigate to the website
        logger.info(f"Navigating to: {url}")
        driver.get(url)
        
        # Wait for page to load
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        logger.info("Page loaded successfully")
        
        # Switch to English first
        switch_to_english(driver)
        
        # Wait for the form table to be present
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "form table")))
        logger.info("Form table found")
        
        # Click on expandable elements with robust handling
        success = click_expandable_elements_robust(driver, max_depth=4, batch_size=5)
        
        if success:
            logger.info("Finished expanding all elements. Extracting content...")
            
            # Get the final page source
            page_source = driver.page_source
            
            # Save raw HTML for inspection (optional)
            with open("tum_raw_content.html", "w", encoding="utf-8") as f:
                f.write(page_source)
            
            logger.info("Raw content saved to tum_raw_content.html")
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Parse the curriculum data using the logic from the notebook
            curriculum_df = parse_curriculum_data(soup, study_program_id)
            
            return curriculum_df
        else:
            logger.error("Failed to expand all elements due to session issues")
            return pd.DataFrame()
        
    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        return pd.DataFrame()
        
    finally:
        if driver and is_driver_alive(driver):
            try:
                driver.quit()
                logger.info("Driver closed successfully")
            except:
                logger.warning("Error closing driver")

if __name__ == '__main__':
    logger.info("Starting robust TUM curriculum scraper...")
    
    # Example URL for M.Sc. Information Systems (updated URL)
    msc_info_systems_url = "https://campus.tum.de/tumonline/wbstpcs.showSpoTree?pStStudiumNr=&pStpStpNr=4997&pSjNr=1619"
    
    # Run in headless mode by default (change to False for visible browser)
    curriculum_df = collect_curriculums(msc_info_systems_url, study_program_id="121", headless=True)
    
    if not curriculum_df.empty:
        # Ensure the csv_tables directory exists
        import os
        os.makedirs('csv_tables', exist_ok=True)
        
        curriculum_df.to_csv('csv_tables/msc_information_systems_curriculum.csv', index=False, encoding='utf-8-sig')
        logger.info("Successfully saved curriculum to csv_tables/msc_information_systems_curriculum.csv")
        logger.info(f"Total entries saved: {len(curriculum_df)}")
    else:
        logger.error("No curriculum data was collected")