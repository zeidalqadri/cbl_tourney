#!/usr/bin/env python3
"""
Quick Smart Malaysian School Emblem Crawler
Fast version that completes without timeout
"""

import requests
import json
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import quote
from typing import List, Dict
import logging

class QuickSmartCrawler:
    def __init__(self, output_dir: str = "melaka_schools_quick"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def get_schools_from_wikipedia(self) -> List[Dict]:
        """Fetch school list from Wikipedia"""
        url = "https://en.wikipedia.org/wiki/List_of_schools_in_Malacca"
        
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
            
            return schools
            
        except Exception as e:
            self.logger.error(f"Error fetching Wikipedia: {e}")
            return []
    
    def generate_search_urls(self, school: Dict) -> Dict:
        """Generate search URLs for a school"""
        name = school['name']
        
        # Clean name for URLs
        clean_name = re.sub(r'[^\w\s]', '', name).lower().replace(' ', '')
        
        return {
            'google_search': f"https://www.google.com/search?q={quote(f'{name} Melaka')}",
            'google_images': f"https://www.google.com/search?q={quote(f'{name} logo emblem lambang')}&tbm=isch",
            'facebook_search': f"https://www.facebook.com/search/top?q={quote(f'{name} Melaka')}",
            'direct_facebook': f"https://www.facebook.com/{clean_name}",
            'direct_blog': f"https://{clean_name}.blogspot.com"
        }
    
    def create_search_directory(self, schools: List[Dict]):
        """Create a simple HTML search directory"""
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Melaka Schools - Quick Search Directory</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; }
        .stats { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .school { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .school h3 { margin-top: 0; color: #333; }
        .links { margin: 10px 0; }
        .links a { display: inline-block; margin: 5px 10px 5px 0; padding: 8px 15px; background: #2196F3; color: white; text-decoration: none; border-radius: 3px; }
        .links a:hover { background: #1976D2; }
        .type-primary { border-left: 5px solid #4CAF50; }
        .type-secondary { border-left: 5px solid #2196F3; }
        .search-box { margin: 20px 0; }
        input[type="text"] { width: 300px; padding: 8px; font-size: 16px; }
        .info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .quick-stats { display: flex; gap: 20px; flex-wrap: wrap; }
        .stat-item { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
    <script>
        function filterSchools() {
            var input = document.getElementById('searchInput').value.toLowerCase();
            var schools = document.getElementsByClassName('school');
            var count = 0;
            
            for (var i = 0; i < schools.length; i++) {
                var schoolName = schools[i].getAttribute('data-name').toLowerCase();
                if (schoolName.includes(input)) {
                    schools[i].style.display = '';
                    count++;
                } else {
                    schools[i].style.display = 'none';
                }
            }
            
            document.getElementById('visibleCount').textContent = count;
        }
        
        function copySearchQuery(schoolName) {
            var query = schoolName + ' Melaka logo emblem';
            navigator.clipboard.writeText(query).then(function() {
                alert('Copied to clipboard: ' + query);
            });
        }
    </script>
</head>
<body>
    <div class="header">
        <h1>🏫 Melaka Schools - Quick Search Directory</h1>
        <p>Find school emblems using search engines and social media</p>
    </div>
    
    <div class="info-box">
        <h3>🔍 How to use this directory:</h3>
        <ol>
            <li>Use the search box to find a specific school</li>
            <li>Click the search links to find the school's emblem</li>
            <li>Facebook pages often have the school emblem as profile picture</li>
            <li>Look for high-resolution images (at least 300x300 pixels)</li>
            <li>Save emblems in folders: primary/[school_name]/ or secondary/[school_name]/</li>
        </ol>
    </div>
    
    <div class="stats">
        <div class="quick-stats">
            <div class="stat-item">
                <strong>Total Schools:</strong> """ + str(len(schools)) + """
            </div>
            <div class="stat-item">
                <strong>Primary:</strong> """ + str(sum(1 for s in schools if s['type'] == 'primary')) + """
            </div>
            <div class="stat-item">
                <strong>Secondary:</strong> """ + str(sum(1 for s in schools if s['type'] == 'secondary')) + """
            </div>
            <div class="stat-item">
                <strong>Visible:</strong> <span id="visibleCount">""" + str(len(schools)) + """</span>
            </div>
        </div>
    </div>
    
    <div class="search-box">
        <input type="text" id="searchInput" onkeyup="filterSchools()" placeholder="Search schools by name...">
    </div>
"""
        
        # Create entries for each school
        for school in schools:
            urls = self.generate_search_urls(school)
            school_type_class = f"type-{school['type']}"
            
            html_content += f"""
    <div class="school {school_type_class}" data-name="{school['name']}">
        <h3>{school['name']} ({school['code']})</h3>
        <p><strong>Type:</strong> {school['type'].capitalize()} | <strong>Area:</strong> {school['area']} | <strong>Postcode:</strong> {school['postcode']}</p>
        
        <div class="links">
            <a href="{urls['google_images']}" target="_blank">🖼️ Google Images</a>
            <a href="{urls['facebook_search']}" target="_blank">📘 Facebook Search</a>
            <a href="{urls['google_search']}" target="_blank">🔍 Google Search</a>
            <a href="{urls['direct_facebook']}" target="_blank">📱 Try Direct FB</a>
            <a href="{urls['direct_blog']}" target="_blank">📝 Try Blog</a>
            <a href="#" onclick="copySearchQuery('{school['name']}'); return false;">📋 Copy Search</a>
        </div>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        # Save HTML file
        html_path = self.output_dir / 'search_directory.html'
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return html_path
    
    def create_summary_report(self, schools: List[Dict]):
        """Create a summary JSON report"""
        summary = {
            'generated_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_schools': len(schools),
            'by_type': {
                'primary': sum(1 for s in schools if s['type'] == 'primary'),
                'secondary': sum(1 for s in schools if s['type'] == 'secondary')
            },
            'by_area': {},
            'schools': []
        }
        
        # Count by area
        for school in schools:
            area = school['area']
            if area not in summary['by_area']:
                summary['by_area'][area] = 0
            summary['by_area'][area] += 1
        
        # Add school data with search URLs
        for school in schools:
            school_data = school.copy()
            school_data['search_urls'] = self.generate_search_urls(school)
            summary['schools'].append(school_data)
        
        # Save JSON report
        json_path = self.output_dir / 'schools_summary.json'
        with open(json_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return json_path
    
    def run(self):
        """Main function"""
        print("🏫 Quick Smart Malaysian School Emblem Crawler")
        print("=" * 50)
        
        # Get schools from Wikipedia
        print("📚 Fetching school list from Wikipedia...")
        schools = self.get_schools_from_wikipedia()
        
        if not schools:
            print("❌ No schools found")
            return
        
        print(f"✅ Found {len(schools)} schools")
        
        # Create search directory
        print("\n📄 Creating search directory...")
        html_path = self.create_search_directory(schools)
        print(f"✅ Created: {html_path}")
        
        # Create summary report
        print("\n📊 Creating summary report...")
        json_path = self.create_summary_report(schools)
        print(f"✅ Created: {json_path}")
        
        # Print summary
        print(f"\n📊 Summary:")
        print(f"   Total schools: {len(schools)}")
        print(f"   Primary schools: {sum(1 for s in schools if s['type'] == 'primary')}")
        print(f"   Secondary schools: {sum(1 for s in schools if s['type'] == 'secondary')}")
        
        print(f"\n✅ Quick crawler completed!")
        print(f"📁 Results saved to: {self.output_dir}")
        print(f"\n🚀 Next steps:")
        print(f"   1. Open {html_path.name} in your browser")
        print(f"   2. Search for school emblems using the provided links")
        print(f"   3. Facebook profile pictures often contain school emblems")
        print(f"   4. Save high-quality emblems (300x300px or larger)")

def main():
    crawler = QuickSmartCrawler()
    crawler.run()

if __name__ == "__main__":
    main()