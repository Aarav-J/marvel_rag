from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Header
from typing import Annotated
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings 
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain import hub

import time
import os
from dotenv import load_dotenv 

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
     
load_dotenv()

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
cloud = "aws"
region = "us-east-1"

spec = ServerlessSpec(cloud=cloud, region=region)
index_name = "marvel-embeddings"
# model_name = 'multilingual-e5-large'
# embeddings = PineconeEmbeddings(
#     model=model_name,
#     pinecone_api_key=os.getenv("PINECONE_API_KEY"),
# )

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small", 
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)


embedding_dimension = 1536  

vectorstore = PineconeVectorStore.from_existing_index(
    embedding=embeddings, 
    index_name="marvel-embeddings",
    namespace="documents",
)
index = pc.Index(index_name)

retrieval_qa_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5, "namespace": "documents"},
)

llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"), 
    model_name="gpt-4o",
    temperature=0.0,
    max_tokens=1000,
)

combine_docs_chain = create_stuff_documents_chain(
    llm, retrieval_qa_prompt
)

retrieval_chain = create_retrieval_chain(
    retriever=retriever, 
    combine_docs_chain=combine_docs_chain,
)


def query_marvel(query: str):
    response = retrieval_chain.invoke({"input": query})
    return response['answer']

@app.get("/query/")
async def get_query(query: Annotated[str, Header()]):
    response = query_marvel(query)
    return {"query": query, "response": response}
