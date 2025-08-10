import os
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings  
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
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
index_name = "marvel-embeddings"


embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small", 
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)


embedding_dimension = 1536  

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name, 
        dimension=embedding_dimension,  
        spec=spec
    )

print(pc.Index(index_name).describe_index_stats())

try:
    with open("urls_20.txt", 'r', encoding='utf-8') as f:
        lines = f.readlines()
except FileNotFoundError:
    print("urls_20.txt not found. Please ensure the file exists.")


headers_to_split_on = [ 
    ("##", "Header 2"),
    ("###", "Header 3")
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
    try:
        markdownDocument = getMarkdownDocument(line.strip())
        markdown_splits = markdown_splitter.split_text(markdownDocument)[:-1]
        
        final_splits = []
        for doc in markdown_splits:
            if len(doc.page_content) > 1000:
                sub_docs = text_splitter.split_documents([doc])
                final_splits.extend(sub_docs)
            else:
                final_splits.append(doc)
                
        # Clean up metadata to reduce size
        for doc in final_splits:
            new_metadata = {}
            if 'Header 2' in doc.metadata:
                new_metadata['section'] = doc.metadata['Header 2'][:100]  # Truncate long sections
            if 'Header 3' in doc.metadata:
                new_metadata['subsection'] = doc.metadata['Header 3'][:100]
            new_metadata['source'] = line.strip()  # Use the URL as source
            doc.metadata = new_metadata

        markdown_splits = final_splits
        namespace = "documents"
        
        docsearch = PineconeVectorStore.from_documents(
            documents=markdown_splits, 
            index_name=index_name, 
            embedding=embeddings,  
            namespace=namespace
        )
        
        print(f"✓ Upserted document from URL: {line.strip()}")
        time.sleep(1)  # Reduced sleep time since OpenAI has higher rate limits
        
    except Exception as e:
        print(f"✗ Error processing {line.strip()}: {e}")
        continue

print("Final index stats:")
print(pc.Index(index_name).describe_index_stats())