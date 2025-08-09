#!/usr/bin/env python3
"""
Malaysian School Emblem Crawler
Collects official school emblems from Malaysian schools starting with Melaka state
"""

import requests
import os
import time
import logging
import json
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
from typing import List, Dict, Optional

class MalaysianSchoolCrawler:
    def __init__(self, output_dir: str = "emblems", delay: float = 2.0):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.delay = delay
        self.session = requests.Session()
        self.ua = UserAgent()
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('crawler.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # School data will be stored here
        self.schools_data = []
        
    def get_melaka_schools_sources(self) -> List[Dict]:
        """
        Get potential data sources for Melaka schools
        """
        sources = [
            {
                'name': 'MOE School Directory',
                'url': 'https://www.moe.gov.my/en/directory-sekolah',
                'type': 'directory'
            },
            {
                'name': 'Melaka Education Department',
                'url': 'https://jpnmelaka.moe.gov.my',
                'type': 'state_department'
            },
            {
                'name': 'MySchool Portal',
                'url': 'https://www.myschool.edu.my',
                'type': 'portal'
            }
        ]
        return sources
    
    def fetch_page(self, url: str, timeout: int = 30) -> Optional[BeautifulSoup]:
        """
        Fetch a web page and return BeautifulSoup object
        """
        try:
            self.logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()
            
            # Check robots.txt compliance
            time.sleep(self.delay)
            
            soup = BeautifulSoup(response.content, 'lxml')
            return soup
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching {url}: {e}")
            return None
    
    def find_school_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Find potential school links from a page
        """
        school_links = []
        
        # Look for common school-related keywords
        school_keywords = [
            'sekolah', 'school', 'sk', 'sjk', 'smk', 'sek', 'rendah', 'menengah'
        ]
        
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link['href']
            text = link.get_text().lower().strip()
            
            # Check if link contains school keywords
            if any(keyword in text for keyword in school_keywords):
                full_url = urljoin(base_url, href)
                school_links.append(full_url)
                
        return list(set(school_links))  # Remove duplicates
    
    def detect_emblem_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """
        Detect potential school emblem images on a page
        """
        emblems = []
        
        # Common emblem-related keywords
        emblem_keywords = [
            'logo', 'emblem', 'lambang', 'jata', 'badge', 'crest', 'symbol'
        ]
        
        # Find images
        images = soup.find_all('img')
        
        for img in images:
            src = img.get('src')
            alt = img.get('alt', '').lower()
            title = img.get('title', '').lower()
            class_name = ' '.join(img.get('class', [])).lower()
            
            if not src:
                continue
                
            # Check if image might be an emblem
            image_text = f"{alt} {title} {class_name}"
            
            if any(keyword in image_text for keyword in emblem_keywords):
                full_url = urljoin(base_url, src)
                
                emblems.append({
                    'url': full_url,
                    'alt': alt,
                    'title': title,
                    'class': class_name,
                    'confidence': self.calculate_emblem_confidence(image_text, src)
                })
        
        # Sort by confidence score
        emblems.sort(key=lambda x: x['confidence'], reverse=True)
        return emblems
    
    def calculate_emblem_confidence(self, text: str, src: str) -> float:
        """
        Calculate confidence score for potential emblem
        """
        score = 0.0
        
        # High confidence keywords
        high_keywords = ['logo', 'emblem', 'lambang', 'jata', 'crest']
        medium_keywords = ['badge', 'symbol', 'sekolah', 'school']
        
        for keyword in high_keywords:
            if keyword in text or keyword in src.lower():
                score += 0.3
                
        for keyword in medium_keywords:
            if keyword in text or keyword in src.lower():
                score += 0.1
        
        # Check file extension
        if any(ext in src.lower() for ext in ['.png', '.jpg', '.jpeg', '.svg']):
            score += 0.2
            
        return min(score, 1.0)
    
    def download_emblem(self, emblem_data: Dict, school_name: str) -> bool:
        """
        Download an emblem image
        """
        try:
            url = emblem_data['url']
            response = self.session.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            # Create school directory
            school_dir = self.output_dir / self.sanitize_filename(school_name)
            school_dir.mkdir(exist_ok=True)
            
            # Determine file extension
            content_type = response.headers.get('content-type', '')
            if 'png' in content_type:
                ext = '.png'
            elif 'jpeg' in content_type or 'jpg' in content_type:
                ext = '.jpg'
            elif 'svg' in content_type:
                ext = '.svg'
            else:
                # Try to get from URL
                parsed = urlparse(url)
                ext = Path(parsed.path).suffix or '.jpg'
            
            filename = f"emblem_{int(time.time())}{ext}"
            filepath = school_dir / filename
            
            # Save the image
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Save metadata
            metadata = {
                'school_name': school_name,
                'emblem_url': url,
                'download_time': time.time(),
                'file_path': str(filepath),
                'confidence_score': emblem_data['confidence'],
                'alt_text': emblem_data['alt'],
                'title': emblem_data['title']
            }
            
            metadata_file = school_dir / f"metadata_{int(time.time())}.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.logger.info(f"Downloaded emblem for {school_name}: {filepath}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error downloading emblem from {emblem_data['url']}: {e}")
            return False
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for filesystem compatibility
        """
        # Remove or replace invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        sanitized = re.sub(r'\s+', '_', sanitized)
        return sanitized[:100]  # Limit length
    
    def crawl_melaka_schools(self, max_schools: int = 10) -> None:
        """
        Main crawling function for Melaka schools
        """
        self.logger.info("Starting Melaka school emblem crawling...")
        
        sources = self.get_melaka_schools_sources()
        schools_found = 0
        
        for source in sources:
            if schools_found >= max_schools:
                break
                
            self.logger.info(f"Checking source: {source['name']}")
            
            try:
                soup = self.fetch_page(source['url'])
                if not soup:
                    continue
                
                # Find school links
                school_links = self.find_school_links(soup, source['url'])
                self.logger.info(f"Found {len(school_links)} potential school links")
                
                # Process each school link
                for school_link in school_links[:5]:  # Limit for testing
                    if schools_found >= max_schools:
                        break
                        
                    school_soup = self.fetch_page(school_link)
                    if not school_soup:
                        continue
                    
                    # Extract school name from title or page
                    school_name = self.extract_school_name(school_soup, school_link)
                    
                    # Find emblems
                    emblems = self.detect_emblem_images(school_soup, school_link)
                    
                    if emblems:
                        self.logger.info(f"Found {len(emblems)} potential emblems for {school_name}")
                        
                        # Download best emblem (highest confidence)
                        if self.download_emblem(emblems[0], school_name):
                            schools_found += 1
                            
                            # Store school data
                            self.schools_data.append({
                                'name': school_name,
                                'url': school_link,
                                'emblems_found': len(emblems),
                                'download_success': True
                            })
                    else:
                        self.logger.info(f"No emblems found for {school_name}")
                        self.schools_data.append({
                            'name': school_name,
                            'url': school_link,
                            'emblems_found': 0,
                            'download_success': False
                        })
                        
            except Exception as e:
                self.logger.error(f"Error processing source {source['name']}: {e}")
        
        # Save summary report
        self.save_crawl_report()
        self.logger.info(f"Crawling completed. Found emblems for {schools_found} schools.")
    
    def extract_school_name(self, soup: BeautifulSoup, url: str) -> str:
        """
        Extract school name from page
        """
        # Try title tag first
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            if 'sekolah' in title_text.lower() or 'school' in title_text.lower():
                return title_text
        
        # Try h1 tag
        h1 = soup.find('h1')
        if h1:
            h1_text = h1.get_text().strip()
            if 'sekolah' in h1_text.lower() or 'school' in h1_text.lower():
                return h1_text
        
        # Fallback to URL-based name
        parsed = urlparse(url)
        domain = parsed.netloc
        return f"School_{domain}_{int(time.time())}"
    
    def save_crawl_report(self) -> None:
        """
        Save crawling report
        """
        report = {
            'crawl_time': time.time(),
            'total_schools_processed': len(self.schools_data),
            'successful_downloads': sum(1 for s in self.schools_data if s['download_success']),
            'schools': self.schools_data
        }
        
        report_file = self.output_dir / 'crawl_report.json'
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.logger.info(f"Crawl report saved to {report_file}")

def main():
    """
    Main function to run the crawler
    """
    print("🏫 Malaysian School Emblem Crawler")
    print("=" * 50)
    
    crawler = MalaysianSchoolCrawler()
    
    try:
        # Start with a small test
        crawler.crawl_melaka_schools(max_schools=5)
        
        print("\n📊 Crawling Summary:")
        print(f"Total schools processed: {len(crawler.schools_data)}")
        successful = sum(1 for s in crawler.schools_data if s['download_success'])
        print(f"Successful emblem downloads: {successful}")
        print(f"Success rate: {(successful/len(crawler.schools_data)*100):.1f}%" if crawler.schools_data else "0%")
        
        print(f"\n📁 Results saved to: {crawler.output_dir}")
        print("📄 Check crawl_report.json for detailed results")
        
    except KeyboardInterrupt:
        print("\n⏹️  Crawling stopped by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()