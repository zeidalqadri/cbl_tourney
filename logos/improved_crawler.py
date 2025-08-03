#!/usr/bin/env python3
"""
Improved Malaysian School Emblem Crawler
Uses multiple strategies to find school emblems
"""

import requests
import os
import time
import json
import re
from urllib.parse import urljoin, quote
from pathlib import Path
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Tuple
import logging
from PIL import Image
from io import BytesIO

class ImprovedMelakkaSchoolCrawler:
    def __init__(self, output_dir: str = "school_emblems"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Track statistics
        self.stats = {
            'total_schools': 0,
            'emblems_found': 0,
            'search_methods': {}
        }
        
    def get_melaka_schools_from_wikipedia(self) -> List[Dict]:
        """
        Get list of schools from Wikipedia page
        """
        url = "https://en.wikipedia.org/wiki/List_of_schools_in_Malacca"
        self.logger.info("Fetching school list from Wikipedia...")
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            schools = []
            table = soup.find('table', class_='wikitable')
            
            if table:
                rows = table.find_all('tr')[1:]  # Skip header
                
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 4:
                        school_info = {
                            'code': cells[0].get_text().strip(),
                            'name': cells[1].get_text().strip(),
                            'postcode': cells[2].get_text().strip(),
                            'area': cells[3].get_text().strip(),
                            'type': 'secondary' if 'SMK' in cells[1].get_text() else 'primary'
                        }
                        schools.append(school_info)
            
            self.logger.info(f"Found {len(schools)} schools")
            return schools
            
        except Exception as e:
            self.logger.error(f"Error fetching Wikipedia: {e}")
            return []
    
    def search_school_emblem(self, school_name: str) -> Optional[Tuple[str, str]]:
        """
        Search for school emblem using multiple strategies
        """
        # Strategy 1: Try Google Images search
        emblem_url, method = self.search_google_images(school_name)
        if emblem_url:
            return emblem_url, method
        
        # Strategy 2: Try school Facebook page
        emblem_url, method = self.search_facebook(school_name)
        if emblem_url:
            return emblem_url, method
        
        # Strategy 3: Try Malaysian education portals
        emblem_url, method = self.search_education_portals(school_name)
        if emblem_url:
            return emblem_url, method
        
        # Strategy 4: Try school blog/website
        emblem_url, method = self.search_school_website(school_name)
        if emblem_url:
            return emblem_url, method
        
        return None, None
    
    def search_google_images(self, school_name: str) -> Tuple[Optional[str], str]:
        """
        Search Google Images for school emblem
        """
        # Note: This is a simplified approach. In production, use Google Custom Search API
        query = f"{school_name} Melaka logo lambang emblem"
        search_url = f"https://www.google.com/search?q={quote(query)}&tbm=isch"
        
        try:
            # This won't work directly due to Google's anti-bot measures
            # In production, use Google Custom Search API
            return None, "google_images"
        except Exception as e:
            self.logger.debug(f"Google Images search error: {e}")
            return None, "google_images"
    
    def search_facebook(self, school_name: str) -> Tuple[Optional[str], str]:
        """
        Search Facebook for school page
        """
        # Facebook pages often have school emblems as profile pictures
        # Note: In production, use Facebook Graph API
        query = f"{school_name} Melaka"
        search_url = f"https://www.facebook.com/search/top?q={quote(query)}"
        
        try:
            # This is a placeholder - Facebook requires authentication
            # In production, use Facebook Graph API
            return None, "facebook"
        except Exception as e:
            self.logger.debug(f"Facebook search error: {e}")
            return None, "facebook"
    
    def search_education_portals(self, school_name: str) -> Tuple[Optional[str], str]:
        """
        Search Malaysian education portals
        """
        # List of education portals that might have school information
        portals = [
            "https://www.moe.gov.my",
            "https://sapsnkra.moe.gov.my",
            "https://emisonline.moe.gov.my"
        ]
        
        # This is simplified - in production, implement proper search
        return None, "education_portals"
    
    def search_school_website(self, school_name: str) -> Tuple[Optional[str], str]:
        """
        Try to find school's official website or blog
        """
        # Common patterns for Malaysian school websites
        patterns = [
            f"{school_name.replace(' ', '').lower()}.blogspot.com",
            f"{school_name.replace(' ', '').lower()}.wordpress.com",
            f"{school_name.replace(' ', '').lower()}.edu.my"
        ]
        
        for pattern in patterns:
            try:
                url = f"https://{pattern}"
                response = self.session.get(url, timeout=5, verify=False)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for images that might be logos
                    images = soup.find_all('img')
                    for img in images:
                        src = img.get('src', '')
                        alt = img.get('alt', '').lower()
                        
                        if any(keyword in alt or keyword in src.lower() 
                               for keyword in ['logo', 'emblem', 'lambang']):
                            full_url = urljoin(url, src)
                            return full_url, "school_website"
                            
            except Exception as e:
                self.logger.debug(f"Website search error for {pattern}: {e}")
                
        return None, "school_website"
    
    def download_and_validate_emblem(self, url: str, school_name: str, school_type: str) -> bool:
        """
        Download emblem and validate it's not a generic icon
        """
        try:
            response = self.session.get(url, stream=True, timeout=30, verify=False)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not any(img_type in content_type for img_type in ['image/png', 'image/jpeg', 'image/jpg']):
                return False
            
            # Download to memory first for validation
            img_data = BytesIO(response.content)
            
            # Open with PIL to validate
            try:
                img = Image.open(img_data)
                width, height = img.size
                
                # Skip if too small (likely an icon)
                if width < 100 or height < 100:
                    self.logger.debug(f"Image too small: {width}x{height}")
                    return False
                
                # Skip if it's a common web icon size
                if (width, height) in [(16, 16), (32, 32), (48, 48), (64, 64)]:
                    self.logger.debug("Skipping common icon size")
                    return False
                
            except Exception as e:
                self.logger.error(f"Image validation error: {e}")
                return False
            
            # Save the emblem
            type_dir = self.output_dir / school_type
            type_dir.mkdir(exist_ok=True)
            
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', school_name)[:100]
            school_dir = type_dir / safe_name
            school_dir.mkdir(exist_ok=True)
            
            # Determine extension
            ext = '.png' if 'png' in content_type else '.jpg'
            filename = f"emblem{ext}"
            filepath = school_dir / filename
            
            # Save the validated image
            img_data.seek(0)
            with open(filepath, 'wb') as f:
                f.write(img_data.read())
            
            # Save metadata
            metadata = {
                'school_name': school_name,
                'school_type': school_type,
                'emblem_url': url,
                'file_path': str(filepath),
                'image_size': f"{width}x{height}",
                'file_size': filepath.stat().st_size,
                'download_time': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open(school_dir / 'metadata.json', 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.logger.info(f"✅ Downloaded emblem for {school_name} ({width}x{height})")
            return True
            
        except Exception as e:
            self.logger.error(f"Download error for {school_name}: {e}")
            return False
    
    def create_manual_search_list(self, schools: List[Dict]) -> None:
        """
        Create a list of schools that need manual searching
        """
        manual_search = []
        
        for school in schools:
            if not school.get('emblem_found', False):
                manual_search.append({
                    'name': school['name'],
                    'type': school['type'],
                    'area': school.get('area', ''),
                    'search_suggestions': [
                        f"{school['name']} Facebook page",
                        f"{school['name']} official website",
                        f"{school['name']} logo lambang"
                    ]
                })
        
        # Save manual search list
        with open(self.output_dir / 'manual_search_needed.json', 'w') as f:
            json.dump(manual_search, f, indent=2)
        
        self.logger.info(f"Created manual search list for {len(manual_search)} schools")
    
    def crawl_schools(self, limit: int = 10):
        """
        Main crawling function
        """
        print("🏫 Improved Melaka School Emblem Crawler")
        print("=" * 50)
        
        # Get schools from Wikipedia
        schools = self.get_melaka_schools_from_wikipedia()
        
        if not schools:
            print("❌ No schools found")
            return
        
        self.stats['total_schools'] = len(schools)
        print(f"📋 Found {len(schools)} schools in Melaka")
        
        # Process schools
        for i, school in enumerate(schools[:limit], 1):
            print(f"\n[{i}/{min(limit, len(schools))}] Processing: {school['name']}")
            
            # Search for emblem
            emblem_url, method = self.search_school_emblem(school['name'])
            
            if emblem_url:
                print(f"   🔍 Found potential emblem via {method}")
                if self.download_and_validate_emblem(emblem_url, school['name'], school['type']):
                    school['emblem_found'] = True
                    self.stats['emblems_found'] += 1
                    self.stats['search_methods'][method] = self.stats['search_methods'].get(method, 0) + 1
                else:
                    school['emblem_found'] = False
                    print(f"   ❌ Emblem validation failed")
            else:
                school['emblem_found'] = False
                print(f"   ❌ No emblem found")
            
            time.sleep(2)  # Rate limiting
        
        # Create manual search list for remaining schools
        self.create_manual_search_list(schools)
        
        # Save final report
        self.save_report(schools[:limit])
        
        # Print summary
        print(f"\n📊 Crawling Summary:")
        print(f"   Total processed: {min(limit, len(schools))}")
        print(f"   Emblems found: {self.stats['emblems_found']}")
        print(f"   Success rate: {(self.stats['emblems_found']/min(limit, len(schools))*100):.1f}%")
        print(f"\n📁 Results saved to: {self.output_dir}")
    
    def save_report(self, schools: List[Dict]):
        """
        Save detailed crawling report
        """
        report = {
            'crawl_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'statistics': self.stats,
            'schools_processed': schools
        }
        
        with open(self.output_dir / 'crawl_report.json', 'w') as f:
            json.dump(report, f, indent=2)

def main():
    crawler = ImprovedMelakkaSchoolCrawler()
    crawler.crawl_schools(limit=5)  # Start with 5 schools for testing

if __name__ == "__main__":
    main()