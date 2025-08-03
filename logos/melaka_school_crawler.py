#!/usr/bin/env python3
"""
Malacca School Emblem Crawler using Wikipedia data
Extracts school names from Wikipedia and searches for their emblems
"""

import requests
import os
import time
import json
import re
from urllib.parse import urljoin, quote_plus
from pathlib import Path
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging

class MelakkaSchoolCrawler:
    def __init__(self, output_dir: str = "melaka_emblems"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('melaka_crawler.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        self.schools_data = []
        
    def fetch_wikipedia_schools(self) -> List[Dict]:
        """
        Fetch list of schools from Wikipedia
        """
        url = "https://en.wikipedia.org/wiki/List_of_schools_in_Malacca"
        self.logger.info(f"Fetching school list from Wikipedia...")
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            schools = []
            
            # Find the main table with school data
            tables = soup.find_all('table', class_='wikitable')
            
            if tables:
                # The main table has headers: School Code, School Name, Postcode, Area, Coordinates
                table = tables[0]
                rows = table.find_all('tr')[1:]  # Skip header row
                
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 4:
                        # Extract data from cells
                        school_code = cells[0].get_text().strip()
                        school_name = cells[1].get_text().strip()
                        postcode = cells[2].get_text().strip()
                        area = cells[3].get_text().strip()
                        
                        # Clean up the school name
                        school_name = re.sub(r'\[.*?\]', '', school_name)  # Remove references
                        school_name = school_name.strip()
                        
                        if school_name and len(school_name) > 3:
                            school_info = {
                                'code': school_code,
                                'name': school_name,
                                'type': self.determine_school_type(school_name),
                                'postcode': postcode,
                                'area': area,
                                'wikipedia_link': None
                            }
                            
                            # Check if school name has a Wikipedia link
                            link = cells[1].find('a', href=True)
                            if link and '/wiki/' in link['href']:
                                school_info['wikipedia_link'] = f"https://en.wikipedia.org{link['href']}"
                            
                            schools.append(school_info)
            
            self.logger.info(f"Found {len(schools)} schools from Wikipedia")
            return schools
            
        except Exception as e:
            self.logger.error(f"Error fetching Wikipedia data: {e}")
            return []
    
    def determine_school_type(self, school_name: str) -> str:
        """
        Determine if school is primary or secondary based on name
        """
        name_upper = school_name.upper()
        
        # Primary school indicators
        if any(x in name_upper for x in ['SK ', 'SJK', 'SEKOLAH KEBANGSAAN', 'SEKOLAH RENDAH', 'PRIMARY']):
            return 'primary'
        # Secondary school indicators
        elif any(x in name_upper for x in ['SMK ', 'SMA ', 'SMJK', 'SEKOLAH MENENGAH', 'SECONDARY', 'HIGH SCHOOL']):
            return 'secondary'
        else:
            return 'unknown'
    
    def search_school_online(self, school_name: str) -> Optional[str]:
        """
        Search for school website using web search
        """
        # Try Google search (note: this is a simple approach, in production use proper API)
        search_query = f"{school_name} Melaka Malaysia official website"
        search_url = f"https://www.google.com/search?q={quote_plus(search_query)}"
        
        try:
            response = self.session.get(search_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for potential school websites in search results
                # This is a simplified approach - in production, use Google Search API
                links = soup.find_all('a', href=True)
                
                for link in links:
                    href = link['href']
                    if '/url?q=' in href:
                        # Extract actual URL from Google redirect
                        actual_url = href.split('/url?q=')[1].split('&')[0]
                        # Check if it might be a school website
                        if any(keyword in actual_url.lower() for keyword in ['school', 'sekolah', 'edu.my', 'blogspot']):
                            return actual_url
                            
        except Exception as e:
            self.logger.debug(f"Search error for {school_name}: {e}")
            
        return None
    
    def find_emblem_on_page(self, url: str, school_name: str) -> List[Dict]:
        """
        Find potential school emblems on a webpage
        """
        try:
            response = self.session.get(url, timeout=15, verify=False)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            emblems = []
            
            # Look for images that might be emblems
            images = soup.find_all('img', src=True)
            
            emblem_keywords = ['logo', 'emblem', 'lambang', 'jata', 'badge', 'crest']
            school_keywords = school_name.lower().split()
            
            for img in images:
                src = img.get('src', '')
                alt = img.get('alt', '').lower()
                title = img.get('title', '').lower()
                class_name = ' '.join(img.get('class', [])).lower()
                
                if src:
                    full_url = urljoin(url, src)
                    
                    # Calculate confidence
                    confidence = 0.0
                    text_to_check = f"{alt} {title} {class_name} {src.lower()}"
                    
                    # Check for emblem keywords
                    for keyword in emblem_keywords:
                        if keyword in text_to_check:
                            confidence += 0.3
                    
                    # Check for school name keywords
                    for keyword in school_keywords:
                        if keyword in text_to_check:
                            confidence += 0.1
                    
                    # Check image attributes
                    if any(ext in src.lower() for ext in ['.png', '.jpg', '.jpeg', '.svg']):
                        confidence += 0.2
                    
                    if confidence > 0.2:
                        emblems.append({
                            'url': full_url,
                            'alt': alt,
                            'confidence': min(confidence, 1.0),
                            'source_page': url
                        })
            
            emblems.sort(key=lambda x: x['confidence'], reverse=True)
            return emblems[:5]  # Return top 5 candidates
            
        except Exception as e:
            self.logger.debug(f"Error finding emblems on {url}: {e}")
            return []
    
    def download_emblem(self, emblem_url: str, school_name: str, school_type: str) -> bool:
        """
        Download and save school emblem
        """
        try:
            response = self.session.get(emblem_url, stream=True, timeout=30, verify=False)
            response.raise_for_status()
            
            # Create directory structure
            type_dir = self.output_dir / school_type
            type_dir.mkdir(exist_ok=True)
            
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', school_name)[:100]
            school_dir = type_dir / safe_name
            school_dir.mkdir(exist_ok=True)
            
            # Determine file extension
            content_type = response.headers.get('content-type', '').lower()
            if 'png' in content_type:
                ext = '.png'
            elif 'jpeg' in content_type or 'jpg' in content_type:
                ext = '.jpg'
            elif 'svg' in content_type:
                ext = '.svg'
            else:
                ext = os.path.splitext(emblem_url)[1] or '.jpg'
            
            filename = f"emblem{ext}"
            filepath = school_dir / filename
            
            # Save image
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Save metadata
            metadata = {
                'school_name': school_name,
                'school_type': school_type,
                'emblem_url': emblem_url,
                'file_path': str(filepath),
                'file_size': filepath.stat().st_size,
                'download_time': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open(school_dir / 'metadata.json', 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.logger.info(f"✅ Downloaded emblem for {school_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to download emblem for {school_name}: {e}")
            return False
    
    def crawl_melaka_schools(self):
        """
        Main crawling function
        """
        print("🏫 Melaka School Emblem Crawler")
        print("=" * 50)
        
        # Step 1: Get schools from Wikipedia
        schools = self.fetch_wikipedia_schools()
        
        if not schools:
            print("❌ No schools found from Wikipedia")
            return
        
        print(f"📋 Found {len(schools)} schools in Melaka")
        print(f"   Primary: {sum(1 for s in schools if s['type'] == 'primary')}")
        print(f"   Secondary: {sum(1 for s in schools if s['type'] == 'secondary')}")
        print(f"   Unknown: {sum(1 for s in schools if s['type'] == 'unknown')}")
        
        # Step 2: Process each school
        successful_downloads = 0
        
        for i, school in enumerate(schools[:20], 1):  # Limit to first 20 for testing
            print(f"\n[{i}/{min(20, len(schools))}] Processing: {school['name']}")
            
            # Try Wikipedia page first if available
            emblems = []
            if school['wikipedia_link']:
                emblems = self.find_emblem_on_page(school['wikipedia_link'], school['name'])
            
            # If no emblem found, try searching for school website
            if not emblems:
                school_url = self.search_school_online(school['name'])
                if school_url:
                    emblems = self.find_emblem_on_page(school_url, school['name'])
            
            # Download best emblem if found
            if emblems:
                best_emblem = emblems[0]
                if self.download_emblem(best_emblem['url'], school['name'], school['type']):
                    successful_downloads += 1
                    school['emblem_found'] = True
                else:
                    school['emblem_found'] = False
            else:
                print(f"   ❌ No emblem found")
                school['emblem_found'] = False
            
            self.schools_data.append(school)
            
            # Be respectful with rate limiting
            time.sleep(2)
        
        # Save final report
        self.save_report(successful_downloads)
        
        print(f"\n📊 Final Summary:")
        print(f"   Total processed: {len(self.schools_data)}")
        print(f"   Successful downloads: {successful_downloads}")
        print(f"   Success rate: {(successful_downloads/len(self.schools_data)*100):.1f}%")
        print(f"   Results saved to: {self.output_dir}")
    
    def save_report(self, successful_downloads: int):
        """
        Save crawling report
        """
        report = {
            'crawl_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_schools': len(self.schools_data),
            'successful_downloads': successful_downloads,
            'success_rate': f"{(successful_downloads/len(self.schools_data)*100):.1f}%",
            'schools': self.schools_data
        }
        
        with open(self.output_dir / 'crawl_report.json', 'w') as f:
            json.dump(report, f, indent=2)

def main():
    crawler = MelakkaSchoolCrawler()
    crawler.crawl_melaka_schools()

if __name__ == "__main__":
    main()