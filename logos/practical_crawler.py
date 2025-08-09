#!/usr/bin/env python3
"""
Practical Malaysian School Emblem Crawler
Generates search URLs and provides a semi-automated workflow
"""

import requests
import json
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import quote
import webbrowser
from typing import List, Dict

class PracticalMelakkaSchoolCrawler:
    def __init__(self, output_dir: str = "melaka_schools"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def get_schools_from_wikipedia(self) -> List[Dict]:
        """
        Fetch school list from Wikipedia
        """
        url = "https://en.wikipedia.org/wiki/List_of_schools_in_Malacca"
        print("📚 Fetching school list from Wikipedia...")
        
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
            
            print(f"✅ Found {len(schools)} schools")
            return schools
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def generate_search_urls(self, school_name: str) -> Dict[str, str]:
        """
        Generate search URLs for different platforms
        """
        clean_name = school_name.strip()
        
        urls = {
            'google_search': f"https://www.google.com/search?q={quote(clean_name + ' Melaka')}",
            'google_images': f"https://www.google.com/search?q={quote(clean_name + ' Melaka logo lambang emblem')}&tbm=isch",
            'facebook': f"https://www.facebook.com/search/top?q={quote(clean_name + ' Melaka')}",
            'duckduckgo': f"https://duckduckgo.com/?q={quote(clean_name + ' Melaka logo')}&t=h_&iax=images&ia=images"
        }
        
        return urls
    
    def create_search_directory(self, schools: List[Dict]) -> None:
        """
        Create a searchable directory with URLs
        """
        search_data = []
        
        for school in schools:
            search_urls = self.generate_search_urls(school['name'])
            
            school_data = {
                'code': school['code'],
                'name': school['name'],
                'type': school['type'],
                'area': school['area'],
                'search_urls': search_urls,
                'search_tips': [
                    f"Look for official {school['name']} Facebook page",
                    f"Search for '{school['name']} blog' or website",
                    "Check profile pictures and about sections for emblems",
                    "Look for high-resolution versions (300x300px or larger)"
                ]
            }
            
            search_data.append(school_data)
        
        # Save as JSON
        with open(self.output_dir / 'school_search_directory.json', 'w') as f:
            json.dump(search_data, f, indent=2)
        
        # Create HTML file for easy browsing
        self.create_html_directory(search_data)
        
        print(f"📁 Created search directory for {len(schools)} schools")
    
    def create_html_directory(self, search_data: List[Dict]) -> None:
        """
        Create an HTML file for easy browsing
        """
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Melaka Schools Search Directory</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .school { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .school h3 { margin-top: 0; color: #333; }
        .links { margin: 10px 0; }
        .links a { margin-right: 15px; text-decoration: none; color: #0066cc; }
        .links a:hover { text-decoration: underline; }
        .tips { background: #f5f5f5; padding: 10px; border-radius: 3px; margin-top: 10px; }
        .type-primary { border-left: 5px solid #4CAF50; }
        .type-secondary { border-left: 5px solid #2196F3; }
        .search-box { margin: 20px 0; padding: 10px; background: #f0f0f0; }
        input[type="text"] { width: 300px; padding: 5px; }
    </style>
    <script>
        function filterSchools() {
            var input = document.getElementById('searchInput').value.toLowerCase();
            var schools = document.getElementsByClassName('school');
            
            for (var i = 0; i < schools.length; i++) {
                var schoolName = schools[i].getAttribute('data-name').toLowerCase();
                if (schoolName.includes(input)) {
                    schools[i].style.display = '';
                } else {
                    schools[i].style.display = 'none';
                }
            }
        }
    </script>
</head>
<body>
    <h1>🏫 Melaka Schools Emblem Search Directory</h1>
    
    <div class="search-box">
        <label>Search schools: </label>
        <input type="text" id="searchInput" onkeyup="filterSchools()" placeholder="Type school name...">
    </div>
    
    <p>Total schools: <strong>""" + str(len(search_data)) + """</strong></p>
    
"""
        
        for school in search_data:
            school_type_class = f"type-{school['type']}"
            html_content += f"""
    <div class="school {school_type_class}" data-name="{school['name']}">
        <h3>{school['name']} ({school['code']})</h3>
        <p><strong>Type:</strong> {school['type'].capitalize()} | <strong>Area:</strong> {school['area']}</p>
        
        <div class="links">
            <strong>Search links:</strong>
            <a href="{school['search_urls']['google_images']}" target="_blank">🔍 Google Images</a>
            <a href="{school['search_urls']['google_search']}" target="_blank">🌐 Google Search</a>
            <a href="{school['search_urls']['facebook']}" target="_blank">📘 Facebook</a>
            <a href="{school['search_urls']['duckduckgo']}" target="_blank">🦆 DuckDuckGo</a>
        </div>
        
        <div class="tips">
            <strong>Search tips:</strong>
            <ul>
"""
            
            for tip in school['search_tips']:
                html_content += f"                <li>{tip}</li>\n"
            
            html_content += """            </ul>
        </div>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        # Save HTML file
        html_path = self.output_dir / 'school_search_directory.html'
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"📄 Created HTML directory: {html_path}")
    
    def create_download_template(self) -> None:
        """
        Create a template for recording downloaded emblems
        """
        template = {
            'instructions': [
                "1. Use the search directory to find school emblems",
                "2. Download high-quality emblems (min 300x300px recommended)",
                "3. Save emblems in folders: melaka_schools/primary/[school_name]/ or melaka_schools/secondary/[school_name]/",
                "4. Update this file with download information"
            ],
            'downloads': []
        }
        
        template_path = self.output_dir / 'download_tracking.json'
        with open(template_path, 'w') as f:
            json.dump(template, f, indent=2)
        
        print(f"📝 Created download tracking template: {template_path}")
    
    def run(self):
        """
        Main function to run the practical crawler
        """
        print("🏫 Practical Melaka School Emblem Crawler")
        print("=" * 50)
        
        # Get schools from Wikipedia
        schools = self.get_schools_from_wikipedia()
        
        if not schools:
            return
        
        # Create search directory
        self.create_search_directory(schools)
        
        # Create download template
        self.create_download_template()
        
        # Summary
        print(f"\n📊 Summary:")
        print(f"   Primary schools: {sum(1 for s in schools if s['type'] == 'primary')}")
        print(f"   Secondary schools: {sum(1 for s in schools if s['type'] == 'secondary')}")
        print(f"\n✅ Next steps:")
        print(f"   1. Open {self.output_dir}/school_search_directory.html in your browser")
        print(f"   2. Use the search links to find school emblems")
        print(f"   3. Download emblems and organize them in the folder structure")
        print(f"   4. Update download_tracking.json with your progress")
        
        # Ask if user wants to open the HTML file
        open_browser = input("\n🌐 Open search directory in browser? (y/n): ")
        if open_browser.lower() == 'y':
            html_path = self.output_dir / 'school_search_directory.html'
            webbrowser.open(f'file://{html_path.absolute()}')

def main():
    crawler = PracticalMelakkaSchoolCrawler()
    crawler.run()

if __name__ == "__main__":
    main()