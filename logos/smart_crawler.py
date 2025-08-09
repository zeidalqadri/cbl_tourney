#!/usr/bin/env python3
"""
Smart Malaysian School Emblem Crawler
Combines automated search with manual fallback options
"""

import requests
import json
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
from typing import List, Dict, Optional
import logging
import webbrowser

class SmartMelakkaCrawler:
    def __init__(self, output_dir: str = "melaka_schools_smart"):
        self.output_dir = Path(output_dir)
        self.setup_directories()
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        self.results = []
        
    def setup_directories(self):
        """Create directory structure"""
        dirs = [
            self.output_dir,
            self.output_dir / 'search_urls',
            self.output_dir / 'found_emblems',
            self.output_dir / 'reports'
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
    
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
    
    def try_direct_searches(self, school: Dict) -> Dict:
        """
        Try some direct URL patterns for Malaysian schools
        """
        results = {
            'direct_attempts': [],
            'successful_urls': []
        }
        
        school_name_clean = re.sub(r'[^\w\s]', '', school['name']).lower().replace(' ', '')
        
        # Common patterns for Malaysian school websites
        url_patterns = [
            f"https://{school_name_clean}.blogspot.com",
            f"https://{school_name_clean}.wordpress.com",
            f"https://www.facebook.com/{school_name_clean}",
            f"https://www.facebook.com/{school_name_clean}melaka",
            f"https://{school_name_clean}.edu.my"
        ]
        
        for url in url_patterns:
            try:
                response = self.session.head(url, timeout=5, allow_redirects=True, verify=False)
                if response.status_code < 400:
                    results['successful_urls'].append({
                        'url': url,
                        'status': response.status_code,
                        'type': self.determine_url_type(url)
                    })
                    self.logger.info(f"✅ Found: {url}")
            except:
                pass
            
            results['direct_attempts'].append(url)
        
        return results
    
    def determine_url_type(self, url: str) -> str:
        """Determine the type of URL"""
        if 'facebook.com' in url:
            return 'facebook'
        elif 'blogspot.com' in url:
            return 'blog'
        elif 'wordpress.com' in url:
            return 'blog'
        elif '.edu.my' in url:
            return 'official'
        else:
            return 'other'
    
    def check_known_education_portals(self, school: Dict) -> List[str]:
        """
        Check known Malaysian education portals for school information
        """
        found_urls = []
        
        # Known education sites that might have school info
        portals = [
            {
                'name': 'SkoolHub',
                'search_url': f"https://skoolhub.edu.my/search?q={quote(school['name'])}"
            },
            {
                'name': 'MySchool Portal',
                'search_url': f"https://myschool.edu.my/find/{quote(school['name'])}"
            }
        ]
        
        for portal in portals:
            found_urls.append({
                'portal': portal['name'],
                'url': portal['search_url'],
                'type': 'education_portal'
            })
        
        return found_urls
    
    def generate_search_urls(self, school: Dict) -> Dict:
        """Generate various search URLs"""
        name = school['name']
        area = school['area']
        
        return {
            'google': {
                'general': f"https://www.google.com/search?q={quote(f'{name} Melaka')}",
                'facebook': f"https://www.google.com/search?q={quote(f'{name} Facebook page Melaka')}",
                'images': f"https://www.google.com/search?q={quote(f'{name} logo lambang emblem')}&tbm=isch",
                'blog': f"https://www.google.com/search?q={quote(f'{name} site:blogspot.com OR site:wordpress.com')}"
            },
            'duckduckgo': {
                'general': f"https://duckduckgo.com/?q={quote(f'{name} Melaka')}",
                'images': f"https://duckduckgo.com/?q={quote(f'{name} logo emblem')}&iax=images&ia=images"
            },
            'bing': {
                'general': f"https://www.bing.com/search?q={quote(f'{name} Melaka')}",
                'images': f"https://www.bing.com/images/search?q={quote(f'{name} logo emblem')}"
            },
            'facebook': f"https://www.facebook.com/search/top?q={quote(f'{name} Melaka')}",
            'google_maps': f"https://www.google.com/maps/search/{quote(f'{name} {area} Melaka')}"
        }
    
    def create_interactive_search_tool(self, schools: List[Dict]):
        """Create an interactive HTML tool for searching"""
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Smart School Emblem Search Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px; }
        .controls { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .school-card { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .school-card h3 { margin-top: 0; color: #333; }
        .search-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0; }
        .search-link { display: block; padding: 10px; text-align: center; background: #f0f0f0; border-radius: 3px; text-decoration: none; color: #333; transition: all 0.3s; }
        .search-link:hover { background: #2196F3; color: white; }
        .direct-urls { background: #e8f5e9; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .found-url { color: #4CAF50; font-weight: bold; }
        .upload-section { background: #fff3e0; padding: 15px; border-radius: 3px; margin: 15px 0; }
        .filter-box { margin: 20px 0; }
        input[type="text"] { width: 300px; padding: 8px; }
        button { padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; }
        button:hover { background: #1976D2; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-box { background: white; padding: 15px; border-radius: 5px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .progress { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
        .progress-bar { flex: 1; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #4CAF50; transition: width 0.3s; }
        .tips { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
    <script>
        let schoolData = """ + json.dumps([{
            'id': f"{s['code']}_{s['name']}",
            'school': s,
            'search_urls': self.generate_search_urls(s),
            'direct_results': self.try_direct_searches(s)
        } for s in schools]) + """;
        
        let processedSchools = JSON.parse(localStorage.getItem('processedSchools') || '[]');
        
        function filterSchools() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const cards = document.getElementsByClassName('school-card');
            
            for (let card of cards) {
                const schoolName = card.getAttribute('data-name').toLowerCase();
                if (schoolName.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        }
        
        function markAsProcessed(schoolId) {
            if (!processedSchools.includes(schoolId)) {
                processedSchools.push(schoolId);
                localStorage.setItem('processedSchools', JSON.stringify(processedSchools));
                document.getElementById('card-' + schoolId).classList.add('processed');
                updateStats();
            }
        }
        
        function updateStats() {
            document.getElementById('processedCount').textContent = processedSchools.length;
            const percentage = (processedSchools.length / schoolData.length * 100).toFixed(1);
            document.getElementById('progressFill').style.width = percentage + '%';
            document.getElementById('progressText').textContent = percentage + '%';
        }
        
        function openAllSearches(schoolId) {
            const school = schoolData.find(s => s.id === schoolId);
            if (school) {
                // Open main searches in new tabs
                window.open(school.search_urls.google.facebook, '_blank');
                window.open(school.search_urls.google.images, '_blank');
                setTimeout(() => {
                    window.open(school.search_urls.duckduckgo.images, '_blank');
                }, 500);
            }
        }
        
        function exportResults() {
            const results = {
                processedSchools: processedSchools,
                totalSchools: schoolData.length,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'school_search_progress.json';
            a.click();
        }
        
        window.onload = function() {
            updateStats();
            
            // Mark schools with found URLs
            schoolData.forEach(school => {
                if (school.direct_results.successful_urls.length > 0) {
                    document.getElementById('card-' + school.id).classList.add('has-urls');
                }
            });
        }
    </script>
</head>
<body>
    <div class="header">
        <h1>🏫 Smart School Emblem Search Tool</h1>
        <p>Interactive tool for finding Malaysian school emblems</p>
    </div>
    
    <div class="tips">
        <h3>💡 Search Tips:</h3>
        <ul>
            <li>Click "Open All Searches" to quickly open Facebook and image searches</li>
            <li>Green highlighted schools have potentially working URLs</li>
            <li>Look for official Facebook pages - they often have the school emblem as profile picture</li>
            <li>Check image search results for high-quality emblems (300x300px or larger)</li>
            <li>Mark schools as "Processed" after checking to track your progress</li>
        </ul>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <h3>Total Schools</h3>
            <div style="font-size: 2em;">""" + str(len(schools)) + """</div>
        </div>
        <div class="stat-box">
            <h3>Processed</h3>
            <div style="font-size: 2em;" id="processedCount">0</div>
        </div>
        <div class="stat-box">
            <h3>Remaining</h3>
            <div style="font-size: 2em;" id="remainingCount">""" + str(len(schools)) + """</div>
        </div>
    </div>
    
    <div class="progress">
        <span>Progress:</span>
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <span id="progressText">0%</span>
    </div>
    
    <div class="controls">
        <input type="text" id="searchInput" placeholder="Search schools..." onkeyup="filterSchools()">
        <button onclick="exportResults()">Export Progress</button>
        <button onclick="localStorage.clear(); location.reload();">Reset Progress</button>
    </div>
"""
        
        for i, school in enumerate(schools):
            school_id = f"{school['code']}_{school['name']}"
            search_urls = self.generate_search_urls(school)
            direct_results = self.try_direct_searches(school)
            
            has_urls_class = 'has-urls' if direct_results['successful_urls'] else ''
            
            html_content += f"""
    <div class="school-card {has_urls_class}" data-name="{school['name']}" id="card-{school_id}">
        <h3>{school['name']} ({school['code']})</h3>
        <p><strong>Type:</strong> {school['type'].capitalize()} | <strong>Area:</strong> {school['area']}</p>
"""
            
            # Show successful direct URLs
            if direct_results['successful_urls']:
                html_content += """        <div class="direct-urls">
            <strong>🎯 Found Direct URLs:</strong><br>
"""
                for url_info in direct_results['successful_urls']:
                    html_content += f"""            <a href="{url_info['url']}" target="_blank" class="found-url">✅ {url_info['type'].capitalize()} Page</a><br>\n"""
                
                html_content += "        </div>\n"
            
            # Search links
            html_content += f"""        <div class="search-links">
            <a href="{search_urls['google']['facebook']}" target="_blank" class="search-link">🔍 Google (Facebook)</a>
            <a href="{search_urls['google']['images']}" target="_blank" class="search-link">🖼️ Google Images</a>
            <a href="{search_urls['duckduckgo']['images']}" target="_blank" class="search-link">🦆 DuckDuckGo Images</a>
            <a href="{search_urls['facebook']}" target="_blank" class="search-link">📘 Facebook Search</a>
            <a href="{search_urls['google']['blog']}" target="_blank" class="search-link">📝 Blog Search</a>
            <a href="{search_urls['google_maps']}" target="_blank" class="search-link">📍 Google Maps</a>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="openAllSearches('{school_id}')">🚀 Open All Searches</button>
            <button onclick="markAsProcessed('{school_id}')" style="background: #4CAF50;">✓ Mark as Processed</button>
        </div>
        
        <div class="upload-section">
            <strong>Found an emblem?</strong> Save it as: <code>{school['type']}/{school['name']}/emblem.png</code>
        </div>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        # Save HTML file
        html_path = self.output_dir / 'interactive_search_tool.html'
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return html_path
    
    def run(self):
        """Main function"""
        print("🏫 Smart Malaysian School Emblem Crawler")
        print("=" * 50)
        
        # Get schools from Wikipedia
        schools = self.get_schools_from_wikipedia()
        
        if not schools:
            print("❌ No schools found")
            return
        
        print(f"📋 Found {len(schools)} schools")
        print("\n🔍 Checking direct URLs...")
        
        # Check direct URLs for all schools
        schools_with_urls = 0
        for school in schools:
            results = self.try_direct_searches(school)
            if results['successful_urls']:
                schools_with_urls += 1
        
        print(f"✅ Found direct URLs for {schools_with_urls} schools")
        
        # Create interactive search tool
        print("\n📄 Creating interactive search tool...")
        html_path = self.create_interactive_search_tool(schools)
        
        print(f"\n✅ Smart search tool created!")
        print(f"📁 Saved to: {html_path}")
        print("\n🚀 Next steps:")
        print("   1. Open the HTML file in your browser")
        print("   2. Use the search links to find school emblems")
        print("   3. Green-highlighted schools have working URLs")
        print("   4. Save found emblems in the suggested folder structure")
        print("   5. Track your progress with the 'Mark as Processed' button")
        
        # Ask to open
        try:
            open_browser = input("\n🌐 Open in browser now? (y/n): ")
            if open_browser.lower() == 'y':
                webbrowser.open(f'file://{html_path.absolute()}')
        except:
            pass

def main():
    crawler = SmartMelakkaCrawler()
    crawler.run()

if __name__ == "__main__":
    main()