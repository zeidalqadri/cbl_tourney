#!/usr/bin/env python3
"""
Google-Enhanced Malaysian School Emblem Crawler
Automatically searches Google to find school Facebook pages and websites
"""

import requests
import json
import time
import re
import os
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse, quote
from typing import List, Dict, Optional, Tuple
import logging
from googlesearch import search
from fake_useragent import UserAgent
from PIL import Image
from io import BytesIO
import hashlib

class GoogleEnhancedMelakkaCrawler:
    def __init__(self, output_dir: str = "melaka_schools_enhanced"):
        self.output_dir = Path(output_dir)
        self.setup_directories()
        
        self.session = requests.Session()
        self.ua = UserAgent()
        self.update_user_agent()
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.output_dir / 'crawler.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load progress if exists
        self.progress = self.load_progress()
        
        # Statistics
        self.stats = {
            'schools_processed': 0,
            'facebook_pages_found': 0,
            'websites_found': 0,
            'emblems_downloaded': 0,
            'search_errors': 0
        }
        
    def setup_directories(self):
        """Create directory structure"""
        dirs = [
            self.output_dir,
            self.output_dir / 'search_results',
            self.output_dir / 'downloaded_emblems' / 'primary',
            self.output_dir / 'downloaded_emblems' / 'secondary',
            self.output_dir / 'reports'
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
    
    def update_user_agent(self):
        """Update session with random user agent"""
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def load_progress(self) -> Dict:
        """Load saved progress"""
        progress_file = self.output_dir / 'search_results' / 'progress.json'
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                return json.load(f)
        return {'processed_schools': [], 'found_urls': {}, 'emblem_candidates': {}}
    
    def save_progress(self):
        """Save current progress"""
        progress_file = self.output_dir / 'search_results' / 'progress.json'
        with open(progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def get_schools_from_wikipedia(self) -> List[Dict]:
        """Fetch school list from Wikipedia"""
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
    
    def google_search_school(self, school_name: str, area: str) -> Dict:
        """
        Perform Google search for school and return found URLs
        """
        results = {
            'facebook_urls': [],
            'website_urls': [],
            'other_urls': []
        }
        
        # Search queries
        queries = [
            f"{school_name} Melaka Facebook page",
            f"{school_name} {area} official website",
            f"{school_name} Melaka blog site:blogspot.com OR site:wordpress.com"
        ]
        
        for query in queries:
            try:
                self.logger.info(f"Searching: {query}")
                
                # Perform Google search
                search_results = list(search(query, num_results=5, sleep_interval=2))
                
                for url in search_results:
                    # Categorize URLs
                    if 'facebook.com' in url:
                        results['facebook_urls'].append(url)
                    elif any(domain in url for domain in ['.edu.my', 'blogspot.com', 'wordpress.com']):
                        results['website_urls'].append(url)
                    else:
                        results['other_urls'].append(url)
                
                # Rate limiting
                time.sleep(5)
                
            except Exception as e:
                self.logger.error(f"Search error for {query}: {e}")
                self.stats['search_errors'] += 1
                
                # If we get blocked, wait longer
                if "429" in str(e) or "captcha" in str(e).lower():
                    self.logger.warning("Rate limit detected, waiting 60 seconds...")
                    time.sleep(60)
        
        return results
    
    def extract_facebook_page_info(self, url: str) -> Optional[Dict]:
        """
        Extract information from Facebook page
        """
        try:
            response = self.session.get(url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for profile picture (often the school emblem)
            profile_img_patterns = [
                {'tag': 'img', 'attrs': {'class': re.compile('profilePic')}},
                {'tag': 'img', 'attrs': {'alt': re.compile('profile picture', re.I)}},
                {'tag': 'image', 'attrs': {}}  # SVG images
            ]
            
            for pattern in profile_img_patterns:
                img = soup.find(pattern['tag'], pattern['attrs'])
                if img and img.get('src'):
                    return {
                        'page_url': url,
                        'profile_image': img['src'],
                        'type': 'facebook_profile'
                    }
                    
        except Exception as e:
            self.logger.debug(f"Facebook extraction error: {e}")
            
        return None
    
    def find_emblems_on_website(self, url: str, school_name: str) -> List[Dict]:
        """
        Find potential emblems on a school website
        """
        emblems = []
        
        try:
            response = self.session.get(url, timeout=10, verify=False)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Common patterns for school emblems
            emblem_patterns = [
                {'tag': 'img', 'keywords': ['logo', 'emblem', 'lambang', 'jata', 'badge']},
                {'tag': 'img', 'attrs': {'class': re.compile('logo|emblem|header', re.I)}},
                {'tag': 'img', 'attrs': {'id': re.compile('logo|emblem', re.I)}},
                {'tag': 'img', 'attrs': {'alt': re.compile(school_name[:10], re.I)}}
            ]
            
            found_images = set()
            
            for pattern in emblem_patterns:
                if 'attrs' in pattern:
                    images = soup.find_all(pattern['tag'], pattern['attrs'])
                else:
                    images = soup.find_all(pattern['tag'])
                
                for img in images:
                    src = img.get('src')
                    if not src:
                        continue
                        
                    # Make URL absolute
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        parsed = urlparse(url)
                        src = f"{parsed.scheme}://{parsed.netloc}{src}"
                    elif not src.startswith('http'):
                        src = url.rsplit('/', 1)[0] + '/' + src
                    
                    # Check keywords if specified
                    if 'keywords' in pattern:
                        img_text = f"{img.get('alt', '')} {img.get('title', '')} {src}".lower()
                        if not any(kw in img_text for kw in pattern['keywords']):
                            continue
                    
                    # Calculate confidence score
                    confidence = self.calculate_emblem_confidence(img, src, school_name)
                    
                    if confidence > 0.3 and src not in found_images:
                        found_images.add(src)
                        emblems.append({
                            'url': src,
                            'source_page': url,
                            'confidence': confidence,
                            'alt': img.get('alt', ''),
                            'type': 'website_image'
                        })
            
            # Sort by confidence
            emblems.sort(key=lambda x: x['confidence'], reverse=True)
            
        except Exception as e:
            self.logger.debug(f"Website parsing error for {url}: {e}")
            
        return emblems[:5]  # Return top 5 candidates
    
    def calculate_emblem_confidence(self, img_tag, src: str, school_name: str) -> float:
        """
        Calculate confidence score for an image being a school emblem
        """
        score = 0.0
        
        # Check image attributes
        alt = img_tag.get('alt', '').lower()
        title = img_tag.get('title', '').lower()
        classes = ' '.join(img_tag.get('class', [])).lower()
        
        # High confidence keywords
        high_keywords = ['logo', 'emblem', 'lambang', 'jata', 'badge', 'crest']
        for keyword in high_keywords:
            if keyword in alt or keyword in title or keyword in classes or keyword in src.lower():
                score += 0.3
        
        # School name match
        school_words = school_name.lower().split()
        for word in school_words:
            if len(word) > 3 and word in alt or word in title:
                score += 0.2
        
        # Image location (header images more likely to be logos)
        if any(loc in classes for loc in ['header', 'top', 'nav']):
            score += 0.2
        
        # File naming patterns
        if re.search(r'logo|emblem|lambang', src, re.I):
            score += 0.3
        
        # Reasonable dimensions (if available)
        width = img_tag.get('width')
        height = img_tag.get('height')
        if width and height:
            try:
                w, h = int(width), int(height)
                if 100 <= w <= 500 and 100 <= h <= 500:
                    score += 0.1
            except:
                pass
        
        return min(score, 1.0)
    
    def download_and_validate_emblem(self, emblem_info: Dict, school: Dict) -> bool:
        """
        Download and validate emblem image
        """
        try:
            url = emblem_info['url']
            
            # Update user agent before download
            self.update_user_agent()
            
            response = self.session.get(url, stream=True, timeout=30, verify=False)
            response.raise_for_status()
            
            # Validate content type
            content_type = response.headers.get('content-type', '').lower()
            if not any(img_type in content_type for img_type in ['image/', 'octet-stream']):
                self.logger.debug(f"Invalid content type: {content_type}")
                return False
            
            # Download to memory for validation
            img_data = BytesIO(response.content)
            
            # Validate with PIL
            try:
                img = Image.open(img_data)
                width, height = img.size
                
                # Skip if too small
                if width < 100 or height < 100:
                    self.logger.debug(f"Image too small: {width}x{height}")
                    return False
                
                # Skip common web icons
                if (width, height) in [(16, 16), (32, 32), (48, 48), (64, 64), (88, 31)]:
                    self.logger.debug("Skipping common icon size")
                    return False
                
            except Exception as e:
                self.logger.error(f"Image validation error: {e}")
                return False
            
            # Save the emblem
            school_type = school['type']
            safe_name = re.sub(r'[<>:"/\\|?*]', '_', school['name'])[:100]
            
            school_dir = self.output_dir / 'downloaded_emblems' / school_type / safe_name
            school_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate unique filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            ext = self.get_image_extension(content_type, url)
            filename = f"emblem_{url_hash}{ext}"
            filepath = school_dir / filename
            
            # Save image
            img_data.seek(0)
            with open(filepath, 'wb') as f:
                f.write(img_data.read())
            
            # Save metadata
            metadata = {
                'school': school,
                'emblem_info': emblem_info,
                'file_path': str(filepath),
                'image_size': f"{width}x{height}",
                'file_size': filepath.stat().st_size,
                'download_time': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            with open(school_dir / f'metadata_{url_hash}.json', 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.logger.info(f"✅ Downloaded emblem for {school['name']} ({width}x{height})")
            self.stats['emblems_downloaded'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Download error: {e}")
            return False
    
    def get_image_extension(self, content_type: str, url: str) -> str:
        """Get appropriate file extension"""
        if 'png' in content_type:
            return '.png'
        elif 'jpeg' in content_type or 'jpg' in content_type:
            return '.jpg'
        elif 'svg' in content_type:
            return '.svg'
        elif 'webp' in content_type:
            return '.webp'
        else:
            # Try to get from URL
            ext = os.path.splitext(urlparse(url).path)[1]
            return ext if ext in ['.png', '.jpg', '.jpeg', '.svg', '.webp'] else '.jpg'
    
    def process_school(self, school: Dict) -> Dict:
        """
        Process a single school: search, find URLs, download emblems
        """
        school_id = f"{school['code']}_{school['name']}"
        
        # Skip if already processed
        if school_id in self.progress['processed_schools']:
            self.logger.info(f"Skipping already processed: {school['name']}")
            return self.progress['found_urls'].get(school_id, {})
        
        self.logger.info(f"\n{'='*50}")
        self.logger.info(f"Processing: {school['name']} ({school['code']})")
        
        # Perform Google search
        search_results = self.google_search_school(school['name'], school['area'])
        
        # Track found URLs
        school_urls = {
            'school': school,
            'search_results': search_results,
            'emblems_found': [],
            'emblems_downloaded': []
        }
        
        # Process Facebook pages
        for fb_url in search_results['facebook_urls'][:2]:  # Check first 2 Facebook results
            self.logger.info(f"Checking Facebook: {fb_url}")
            fb_info = self.extract_facebook_page_info(fb_url)
            if fb_info:
                school_urls['emblems_found'].append(fb_info)
                self.stats['facebook_pages_found'] += 1
        
        # Process websites
        for site_url in search_results['website_urls'][:3]:  # Check first 3 websites
            self.logger.info(f"Checking website: {site_url}")
            emblems = self.find_emblems_on_website(site_url, school['name'])
            if emblems:
                school_urls['emblems_found'].extend(emblems)
                self.stats['websites_found'] += 1
        
        # Try to download best emblems
        for emblem in school_urls['emblems_found'][:3]:  # Try top 3 candidates
            if self.download_and_validate_emblem(emblem, school):
                school_urls['emblems_downloaded'].append(emblem)
        
        # Update progress
        self.progress['processed_schools'].append(school_id)
        self.progress['found_urls'][school_id] = school_urls
        self.save_progress()
        
        self.stats['schools_processed'] += 1
        
        return school_urls
    
    def generate_html_report(self, results: List[Dict]):
        """Generate visual HTML report"""
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Melaka Schools Emblem Search Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .stats { background: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .school { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .school h3 { margin-top: 0; color: #333; }
        .success { border-left: 5px solid #4CAF50; }
        .partial { border-left: 5px solid #FF9800; }
        .failed { border-left: 5px solid #F44336; }
        .emblems { display: flex; gap: 15px; margin: 15px 0; flex-wrap: wrap; }
        .emblem { border: 1px solid #ddd; padding: 10px; border-radius: 5px; text-align: center; }
        .emblem img { max-width: 150px; max-height: 150px; }
        .urls { background: #f9f9f9; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .urls a { display: block; margin: 5px 0; color: #2196F3; text-decoration: none; }
        .urls a:hover { text-decoration: underline; }
        .confidence { font-size: 0.9em; color: #666; }
        .filter-box { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
        .filter-box button { margin: 5px; padding: 8px 15px; border: none; border-radius: 3px; cursor: pointer; }
        .filter-box button.active { background: #2196F3; color: white; }
    </style>
    <script>
        function filterSchools(status) {
            const schools = document.getElementsByClassName('school');
            for (let school of schools) {
                if (status === 'all' || school.classList.contains(status)) {
                    school.style.display = 'block';
                } else {
                    school.style.display = 'none';
                }
            }
            
            // Update active button
            const buttons = document.querySelectorAll('.filter-box button');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }
    </script>
</head>
<body>
    <div class="header">
        <h1>🏫 Melaka Schools Emblem Search Results</h1>
        <p>Generated: """ + time.strftime('%Y-%m-%d %H:%M:%S') + """</p>
    </div>
    
    <div class="stats">
        <h2>📊 Statistics</h2>
        <p><strong>Total Schools Processed:</strong> """ + str(self.stats['schools_processed']) + """</p>
        <p><strong>Facebook Pages Found:</strong> """ + str(self.stats['facebook_pages_found']) + """</p>
        <p><strong>Websites Found:</strong> """ + str(self.stats['websites_found']) + """</p>
        <p><strong>Emblems Downloaded:</strong> """ + str(self.stats['emblems_downloaded']) + """</p>
        <p><strong>Search Errors:</strong> """ + str(self.stats['search_errors']) + """</p>
    </div>
    
    <div class="filter-box">
        <strong>Filter:</strong>
        <button onclick="filterSchools('all')" class="active">All Schools</button>
        <button onclick="filterSchools('success')">With Emblems</button>
        <button onclick="filterSchools('partial')">URLs Found</button>
        <button onclick="filterSchools('failed')">No Results</button>
    </div>
"""
        
        for result in results:
            school = result['school']
            
            # Determine status
            if result.get('emblems_downloaded'):
                status_class = 'success'
                status_text = '✅ Emblem Downloaded'
            elif result.get('emblems_found'):
                status_class = 'partial'
                status_text = '🔍 Emblems Found (Not Downloaded)'
            else:
                status_class = 'failed'
                status_text = '❌ No Results'
            
            html_content += f"""
    <div class="school {status_class}">
        <h3>{school['name']} ({school['code']})</h3>
        <p><strong>Type:</strong> {school['type'].capitalize()} | <strong>Area:</strong> {school['area']} | <strong>Status:</strong> {status_text}</p>
"""
            
            # Show found URLs
            if result.get('search_results'):
                html_content += """        <div class="urls">
            <strong>Found URLs:</strong>
"""
                for fb_url in result['search_results'].get('facebook_urls', [])[:2]:
                    html_content += f'            <a href="{fb_url}" target="_blank">📘 Facebook Page</a>\n'
                
                for site_url in result['search_results'].get('website_urls', [])[:2]:
                    html_content += f'            <a href="{site_url}" target="_blank">🌐 Website</a>\n'
                
                html_content += "        </div>\n"
            
            # Show emblems
            if result.get('emblems_found'):
                html_content += """        <div class="emblems">
"""
                for emblem in result['emblems_found'][:3]:
                    downloaded = emblem in result.get('emblems_downloaded', [])
                    status_icon = '✅' if downloaded else '❓'
                    
                    html_content += f"""            <div class="emblem">
                <img src="{emblem['url']}" alt="School emblem" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"150\"><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dy=\".3em\">Failed to load</text></svg>'">
                <div class="confidence">Confidence: {emblem['confidence']:.2f} {status_icon}</div>
                <div><a href="{emblem.get('source_page', '#')}" target="_blank">Source</a></div>
            </div>
"""
                
                html_content += "        </div>\n"
            
            html_content += "    </div>\n"
        
        html_content += """
</body>
</html>
"""
        
        # Save HTML report
        report_path = self.output_dir / 'reports' / 'search_results.html'
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        self.logger.info(f"📄 Generated HTML report: {report_path}")
    
    def create_manual_review_list(self):
        """Create list of schools needing manual review"""
        manual_review = []
        
        for school_id, data in self.progress['found_urls'].items():
            if not data.get('emblems_downloaded'):
                review_item = {
                    'school': data['school'],
                    'found_urls': {
                        'facebook': data['search_results'].get('facebook_urls', []),
                        'websites': data['search_results'].get('website_urls', [])
                    },
                    'emblems_found_not_downloaded': len(data.get('emblems_found', [])),
                    'reason': 'No emblems successfully downloaded'
                }
                manual_review.append(review_item)
        
        # Save manual review list
        review_path = self.output_dir / 'reports' / 'manual_review.json'
        with open(review_path, 'w') as f:
            json.dump(manual_review, f, indent=2)
        
        self.logger.info(f"📝 Created manual review list: {review_path}")
        self.logger.info(f"   {len(manual_review)} schools need manual review")
    
    def crawl(self, limit: Optional[int] = None):
        """
        Main crawling function
        """
        print("🏫 Google-Enhanced Melaka School Emblem Crawler")
        print("=" * 50)
        
        # Get schools from Wikipedia
        schools = self.get_schools_from_wikipedia()
        
        if not schools:
            print("❌ No schools found")
            return
        
        # Apply limit if specified
        if limit:
            schools = schools[:limit]
        
        print(f"📋 Processing {len(schools)} schools")
        print(f"⏰ Estimated time: {len(schools) * 20} seconds ({len(schools) * 20 / 60:.1f} minutes)")
        print("\nStarting search...\n")
        
        results = []
        
        for i, school in enumerate(schools, 1):
            print(f"\n[{i}/{len(schools)}] {school['name']}")
            
            try:
                result = self.process_school(school)
                results.append(result)
                
                # Progress update
                if result.get('emblems_downloaded'):
                    print(f"   ✅ Downloaded {len(result['emblems_downloaded'])} emblem(s)")
                elif result.get('emblems_found'):
                    print(f"   🔍 Found {len(result['emblems_found'])} emblem(s) (download failed)")
                else:
                    print(f"   ❌ No emblems found")
                
            except KeyboardInterrupt:
                print("\n\n⚠️  Crawling interrupted by user")
                break
            except Exception as e:
                self.logger.error(f"Error processing {school['name']}: {e}")
                print(f"   ❌ Error: {e}")
            
            # Rate limiting between schools
            time.sleep(3)
        
        # Generate reports
        print("\n📊 Generating reports...")
        self.generate_html_report(results)
        self.create_manual_review_list()
        
        # Save final statistics
        stats_path = self.output_dir / 'reports' / 'statistics.json'
        with open(stats_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        
        # Print summary
        print(f"\n{'='*50}")
        print("📊 Crawling Summary:")
        print(f"   Schools processed: {self.stats['schools_processed']}")
        print(f"   Facebook pages found: {self.stats['facebook_pages_found']}")
        print(f"   Websites found: {self.stats['websites_found']}")
        print(f"   Emblems downloaded: {self.stats['emblems_downloaded']}")
        print(f"   Search errors: {self.stats['search_errors']}")
        print(f"\n📁 Results saved to: {self.output_dir}")
        print(f"   View report: {self.output_dir}/reports/search_results.html")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Google-Enhanced School Emblem Crawler')
    parser.add_argument('--limit', type=int, help='Limit number of schools to process')
    parser.add_argument('--resume', action='store_true', help='Resume from previous progress')
    
    args = parser.parse_args()
    
    crawler = GoogleEnhancedMelakkaCrawler()
    
    try:
        crawler.crawl(limit=args.limit)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()