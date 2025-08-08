import bs4 as bs
import requests
import time
# start_time = time.time() 

# def write_to_file(filename, content):
#     with open(filename, 'a', encoding='utf-8') as file:
#         file.write(content)

def get_references(url): 
    source = requests.get(url)
    soup = bs.BeautifulSoup(source.text, 'html.parser')
    references = soup.find("ol", class_="references")
    if references is None: 
        return 0
    i = 0 
    for reference in references: 
        if reference.name == "li":
            i+=1
    return i 
# link = "https://marvel.fandom.com/wiki/Category:Characters"


# url_scrape = ["https://marvel.fandom.com/wiki/Category:Characters"]
# i = 0
# for link in url_scrape: 
#     source = requests.get(link)
#     soup = bs.BeautifulSoup(source.text, 'html.parser')
#     characters = soup.find_all("a", class_="category-page__member-link")
#     for character in characters: 
#         link = f"https://marvel.fandom.com/{character.attrs['href']}"
#         print(link)
#         if character.text[:9] == "Category:" or character.text[:9] == "Character": 
#             continue
#         if character.text[-11:] == "(Earth-616)":
#             if get_references(link) > 10:
#                 # link = f"https://marvel.fandom.com/{character.attrs['href']}"
#                 write_to_file("urls.txt", link + "\n")
#             else: 
#                 print("Skipping: ", character.text)
        
#     next_page = soup.find('a', class_='category-page__pagination-next')
#     if next_page:
#         url_scrape.append(next_page.attrs['href'])
#         print("next page found: ", i)
#         i +=1
#     else: 
#         break

# print("URLs have been written to urls.txt")

# # print(get_references("https://marvel.fandom.com/wiki/Franklin_Richards_(Earth-616)"))

# print("Time taken: --- %s seconds ---" % (time.time() - start_time))

with open("urls.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

for line in lines: 
    references = get_references(line.strip())
    with open("urls_20.txt", "a", encoding="utf-8") as file:
        if references > 20: 
            file.write(line)
            print(f"✓ {line.strip()} - {references} references")
        else: 
            print(f"✗ Skipping {line.strip()} - {references} references")
    with open("urls_30.txt", "a", encoding="utf-8") as file:
        if references > 30: 
            file.write(line)
            print(f"✓ {line.strip()} - {references} references")
        else: 
            print(f"✗ Skipping {line.strip()} - {references} references")