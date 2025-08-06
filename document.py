from html_to_markdown import convert_to_markdown
import requests
import bs4 as bs
import re

# link = "https://marvel.fandom.com/wiki/Victor_von_Doom_(Earth-616)"
link = "https://marvel.fandom.com/wiki/Vincent_Gonzales_(Earth-616)"

def get_html_content(url): 
    request = requests.get(url)
    soup = bs.BeautifulSoup(request.content, 'html.parser')
    if soup:
        content = soup.find("div", class_="mw-content-ltr")
        if content:
            return content
    print(f"Failed to retrieve content from {url}")
    return None
markdownDocument = convert_to_markdown(get_html_content(link), heading_style="atx") 

def remove_section(title, text): 
    # Pattern to match a specific section header and all content until the next header or end
    pattern = rf'^##\s+{re.escape(title)}.*?(?=^##|\Z)'
    return re.sub(pattern, '', text, flags=re.MULTILINE | re.DOTALL)

def remove_contents(text): 
    # Remove lines that start with "* " (bullet points)
    pattern = r'^\*\s.*$'
    return re.sub(pattern, '', text, flags=re.MULTILINE)

def clean(text): 
    clean = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
    clean = re.sub(r'\[\s*\d+\s*\]', '', clean)
    clean = re.sub(r'\(#cite[^)]*\)', '', clean)
    clean = re.sub(r'(<img\b[^>]*?>|!\[[^\]]*\]\([^\)]*\))', '', clean, flags=re.IGNORECASE|re.DOTALL)
    clean = clean.replace('\\', '')
    clean = re.sub(r'\\', '', clean)
    clean = re.sub(r'\[\]', '', clean)
    clean = re.sub(r' {2,}', ' ', clean)
    return clean
# markdownDocument = remove_section("Links and References", markdownDocument)
markdownDocument = remove_section("See Also", markdownDocument)

markdownDocument = remove_section("Contents", markdownDocument)
# markdownDocument = remove_contents(markdownDocument)

with open("./markdowns/vincent_clean.md", "w", encoding="utf-8") as file:
    file.write(clean(markdownDocument))

print("Markdown document created successfully.")