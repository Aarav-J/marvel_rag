from html_to_markdown import convert_to_markdown
import requests
import bs4 as bs
import re

link = "https://marvel.fandom.com/wiki/Victor_von_Doom_(Earth-616)"
# link = "https://marvel.fandom.com/wiki/Vincent_Gonzales_(Earth-616)"

def get_html_content(url): 
    request = requests.get(url)
    soup = bs.BeautifulSoup(request.content, 'html.parser')
    if soup:
        content = soup.find("div", class_="mw-content-ltr")
        if content:
            return content
    print(f"Failed to retrieve content from {url}")
    return None
markdownDocument = convert_to_markdown(get_html_content(link)) 

def remove_section(title, text): 
    pattern = rf'(?ms)^({re.escape(title)}\r?\n-+\r?\n).*?(?=(?:^[^\r\n].*\r?\n-+\r?\n)|\Z)'
    return re.sub(pattern, '', text)
# def remove_section(text, title):
#     """
#     Remove a Setext (underline) section titled `title`—
#     i.e.:
    
#     Title
#     -----
#     …body…
    
#     —up to the next underlined heading or end of doc.
#     """
#     # (?m)  multiline: ^ matches start of line
#     # (?s)  dotall:   . matches newlines
#     pattern = rf'''
#       ^[ \t]*{re.escape(title)}[ \t]*\r?\n   # the "Contents" line
#       [ \t]*-+[ \t]*\r?\n                   # the underline (----)
#       .*?                                   # non-greedy eat everything...
#       (?=(?:^[ \t]*\S.*\r?\n[ \t]*-+[ \t]*\r?\n)|\Z)
#       # …right up to (but not consuming) the next
#       # line+underline or end of file
#     '''
#     return re.sub(pattern, "", text, flags=re.MULTILINE|re.DOTALL|re.VERBOSE)
def remove_contents(text): 
    pattern = r'''
      (?m)                   # multi-line mode: ^ matches start of line
      ^\*\s.*(?:\r?\n        # 1) a line beginning with "* "
         (?:[ \t]+[+\*\-]\s.*\r?\n)*  # 2) zero or more indented sub-bullets ("+ ", "* ", or "- ")
      )
    '''
    return re.sub(pattern, '', text, flags=re.VERBOSE)

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
markdownDocument = remove_section("Links and References", markdownDocument)
markdownDocument = remove_section("See Also", markdownDocument)

markdownDocument = remove_section("Contents", markdownDocument)
markdownDocument = remove_contents(markdownDocument)

with open("doom_no_contents.md", "w", encoding="utf-8") as file:
    file.write(clean(markdownDocument))

print("Markdown document created successfully.")