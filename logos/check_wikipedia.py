#!/usr/bin/env python3
"""
Check Wikipedia page structure for Malacca schools
"""

import requests
from bs4 import BeautifulSoup

def check_wikipedia_structure():
    url = "https://en.wikipedia.org/wiki/List_of_schools_in_Malacca"
    
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    print("🔍 Checking Wikipedia page structure...")
    print("=" * 50)
    
    # Find all tables
    tables = soup.find_all('table', class_='wikitable')
    print(f"Found {len(tables)} tables on the page")
    
    for i, table in enumerate(tables[:3]):  # Check first 3 tables
        print(f"\n📊 Table {i+1}:")
        
        # Get headers
        headers = table.find_all('th')
        print("Headers:", [th.get_text().strip() for th in headers[:5]])
        
        # Get first few rows
        rows = table.find_all('tr')[1:4]  # First 3 data rows
        print("\nFirst few rows:")
        
        for j, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            row_data = []
            for cell in cells[:5]:  # First 5 cells
                text = cell.get_text().strip()
                # Check for links
                link = cell.find('a', href=True)
                if link:
                    row_data.append(f"{text} [LINK]")
                else:
                    row_data.append(text)
            print(f"  Row {j+1}: {row_data}")
    
    # Look for school names in different formats
    print("\n🏫 Looking for school name patterns...")
    
    # Try to find all links that might be schools
    all_links = soup.find_all('a', href=True)
    school_links = []
    
    for link in all_links:
        text = link.get_text().strip()
        href = link['href']
        
        # Common Malaysian school name patterns
        if any(pattern in text for pattern in ['SK ', 'SMK ', 'SJK', 'Sekolah', 'School']):
            school_links.append((text, href))
    
    print(f"\nFound {len(school_links)} potential school links")
    for i, (name, href) in enumerate(school_links[:10]):
        print(f"  {i+1}. {name}")

if __name__ == "__main__":
    check_wikipedia_structure()