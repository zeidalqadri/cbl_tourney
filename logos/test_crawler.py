#!/usr/bin/env python3
"""
Test version of Malaysian School Emblem Crawler
Uses working data sources and includes test cases
"""

import requests
import os
import time
import json
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import re
import logging

class TestMalaysianSchoolCrawler:
    def __init__(self, output_dir: str = "test_emblems"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.ua = UserAgent()
        
        # More robust session setup
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        })
        
        # Disable SSL verification for testing (not recommended for production)
        requests.packages.urllib3.disable_warnings()
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def test_real_school_websites(self):
        """
        Test with real Malaysian school websites
        """
        print("🧪 Testing Malaysian School Emblem Crawler")
        print("=" * 50)
        
        # Real Malaysian school websites for testing
        test_schools = [
            {
                'name': 'SMK Sultan Abu Bakar, Pahang',
                'url': 'https://smksultanabubakar.blogspot.com/',
                'type': 'secondary'
            },
            {
                'name': 'SK Taman Tun Dr Ismail',
                'url': 'https://skttdi.wordpress.com/',
                'type': 'primary'
            },
            {
                'name': 'SMK Bandar Utama Damansara',
                'url': 'https://smkbudaman.blogspot.com/',
                'type': 'secondary'
            }
        ]
        
        results = []
        
        for school in test_schools:
            print(f"\n🏫 Testing: {school['name']}")
            print(f"🔗 URL: {school['url']}")
            
            try:
                # Fetch the page
                response = self.session.get(school['url'], timeout=15, verify=False)
                if response.status_code == 200:
                    print("✅ Page loaded successfully")
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find potential emblem images
                    emblems = self.find_school_emblems(soup, school['url'])
                    
                    if emblems:
                        print(f"🖼️  Found {len(emblems)} potential emblems:")
                        for i, emblem in enumerate(emblems[:3], 1):
                            print(f"   {i}. {emblem['url']}")
                            print(f"      Confidence: {emblem['confidence']:.2f}")
                            print(f"      Alt text: {emblem['alt']}")
                        
                        # Try to download the best emblem
                        best_emblem = emblems[0]
                        if self.download_test_emblem(best_emblem, school['name']):
                            print("✅ Emblem downloaded successfully")
                        else:
                            print("❌ Failed to download emblem")
                            
                        results.append({
                            'school': school['name'],
                            'url': school['url'],
                            'emblems_found': len(emblems),
                            'download_success': True
                        })
                    else:
                        print("❌ No emblems found")
                        results.append({
                            'school': school['name'],
                            'url': school['url'],
                            'emblems_found': 0,
                            'download_success': False
                        })
                else:
                    print(f"❌ Failed to load page (Status: {response.status_code})")
                    
            except Exception as e:
                print(f"❌ Error: {e}")
                
            time.sleep(2)  # Be respectful
            
        # Save test results
        self.save_test_results(results)
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Schools tested: {len(results)}")
        successful = sum(1 for r in results if r['download_success'])
        print(f"Successful downloads: {successful}")
        print(f"Success rate: {(successful/len(results)*100):.1f}%")
        
        return results
    
    def find_school_emblems(self, soup, base_url):
        """
        Find potential school emblems on a page
        """
        emblems = []
        
        # Keywords that might indicate school emblems
        emblem_keywords = [
            'logo', 'emblem', 'lambang', 'jata', 'badge', 'crest', 'symbol',
            'sekolah', 'school', 'sk', 'smk', 'sjk'
        ]
        
        # Find all images
        images = soup.find_all('img', src=True)
        
        for img in images:
            src = img.get('src', '')
            alt = img.get('alt', '').lower()
            title = img.get('title', '').lower()
            
            # Create full URL
            if src:
                full_url = urljoin(base_url, src)
                
                # Calculate confidence based on keywords
                confidence = 0.0
                text_to_check = f"{alt} {title} {src.lower()}"
                
                for keyword in emblem_keywords:
                    if keyword in text_to_check:
                        if keyword in ['logo', 'emblem', 'lambang', 'jata']:
                            confidence += 0.3
                        else:
                            confidence += 0.1
                
                # Bonus for image file extensions
                if any(ext in src.lower() for ext in ['.png', '.jpg', '.jpeg', '.svg']):
                    confidence += 0.2
                
                # Bonus for reasonable image size attributes
                width = img.get('width', '')
                height = img.get('height', '')
                try:
                    if width and height:
                        w, h = int(width), int(height)
                        if 50 <= w <= 500 and 50 <= h <= 500:  # Reasonable emblem size
                            confidence += 0.1
                except ValueError:
                    pass
                
                if confidence > 0.1:  # Only include images with some confidence
                    emblems.append({
                        'url': full_url,
                        'alt': alt,
                        'title': title,
                        'confidence': min(confidence, 1.0)
                    })
        
        # Sort by confidence
        emblems.sort(key=lambda x: x['confidence'], reverse=True)
        return emblems
    
    def download_test_emblem(self, emblem_data, school_name):
        """
        Download an emblem for testing
        """
        try:
            url = emblem_data['url']
            response = self.session.get(url, stream=True, timeout=30, verify=False)
            response.raise_for_status()
            
            # Create school directory
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', school_name)[:50]
            school_dir = self.output_dir / safe_name
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
                ext = '.jpg'  # Default
            
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
                'file_size': filepath.stat().st_size
            }
            
            metadata_file = school_dir / f"metadata_{int(time.time())}.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Download error: {e}")
            return False
    
    def save_test_results(self, results):
        """
        Save test results to file
        """
        report = {
            'test_time': time.time(),
            'total_schools_tested': len(results),
            'successful_downloads': sum(1 for r in results if r['download_success']),
            'results': results
        }
        
        report_file = self.output_dir / 'test_report.json'
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Test report saved to: {report_file}")

def main():
    """
    Run the test crawler
    """
    crawler = TestMalaysianSchoolCrawler()
    results = crawler.test_real_school_websites()
    
    # Show downloaded files
    print(f"\n📁 Files downloaded to: {crawler.output_dir}")
    if crawler.output_dir.exists():
        for item in crawler.output_dir.iterdir():
            if item.is_dir():
                print(f"   📂 {item.name}/")
                for file in item.iterdir():
                    print(f"      📄 {file.name}")

if __name__ == "__main__":
    main()