import os
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
# from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain import hub
import time 
from dotenv import load_dotenv
from document import getMarkdownDocument

load_dotenv() 

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
cloud = "aws"
region = 'us-east-1'

spec = ServerlessSpec(cloud=cloud, region=region)
index_name = "marvel"

model_name = 'multilingual-e5-large'
embeddings = PineconeEmbeddings(
    model=model_name,
    pinecone_api_key=os.getenv("PINECONE_API_KEY"),
)
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name, 
        dimension=embeddings.dimension,  # E5 Large dimension
        metric="cosine", 
        spec=spec
    )
print(pc.Index(index_name).describe_index_stats())
try:
    with open("urls_20.txt", 'r', encoding='utf-8') as f:
        lines = f.readlines()
except FileNotFoundError:
    print("doom_clean.md not found. Please ensure the file exists in the markdowns directory.")
# print(doom_clean_md)
lines = lines[:500]
headers_to_split_on = [ 
        ("##", "Header 2"),
        ("###", "Header 3")  # Add more granular splitting
    ]
markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False
    )
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    length_function=len,
)

for line in lines: 
    markdownDocument = getMarkdownDocument(line.strip())
    markdown_splits = markdown_splitter.split_text(markdownDocument)[:-1]
    # markdownDocument = text_splitter.split_documents(markdownDocument)
    final_splits = []
    for doc in markdown_splits:
        if len(doc.page_content) > 1000:
            sub_docs = text_splitter.split_documents([doc])
            final_splits.extend(sub_docs)
        else:
            final_splits.append(doc)
            
    # Clean up metadata to reduce size
    for doc in final_splits:
        # Keep only essential metadata
        new_metadata = {}
        if 'Header 2' in doc.metadata:
            new_metadata['section'] = doc.metadata['Header 2']
        if 'Header 3' in doc.metadata:
            new_metadata['subsection'] = doc.metadata['Header 3']
        new_metadata['source'] = 'doom_clean.md'
        doc.metadata = new_metadata

    markdown_splits = final_splits
    namespace = "documents"
    docsearch = PineconeVectorStore.from_documents(
        documents=markdown_splits, 
        index_name=index_name, 
        embedding=embeddings, 
        namespace=namespace
    )
    print("Upserted document from URL: ", line.strip())
    time.sleep(4)


# First split by headers
# md_header_splits = markdown_splitter.split_text(clean_md)[:-1]

# Then further split large chunks


# final_splits = []
# for doc in md_header_splits:
#     # check if document content is too large
#     if len(doc.page_content) > 1000:
#         # split large documents further
#         sub_docs = text_splitter.split_documents([doc])
#         final_splits.extend(sub_docs)
#     else:
#         final_splits.append(doc)

# # clean up metadata to reduce size
# for doc in final_splits:
#     # keep only essential metadata
#     new_metadata = {}
#     if 'header 2' in doc.metadata:
#         new_metadata['section'] = doc.metadata['header 2']
#     if 'header 3' in doc.metadata:
#         new_metadata['subsection'] = doc.metadata['header 3']
#     new_metadata['source'] = 'doom_clean.md'
#     doc.metadata = new_metadata

# md_header_splits = final_splits
#  # limit to first 10 splits for testing
# namespace = "documents"

# docsearch = pineconevectorstore.from_documents(
#     documents=md_header_splits, 
#     index_name=index_name, 
#     embedding=embeddings, 
#     namespace=namespace
# )
# time.sleep(5)
# print("after upsert: ")
print(pc.Index(index_name).describe_index_stats())