from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Header
from typing import Annotated, Dict
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory


# from langchain.chains import create_retrieval_chain
# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain import hub

import time
import os
from dotenv import load_dotenv 

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
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

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5, "namespace": "documents"},
)
index = pc.Index(index_name)

# retrieval_qa_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
# retriever = vectorstore.as_retriever(
#     search_kwargs={"k": 5, "namespace": "documents"},
# )

llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"), 
    model_name="gpt-4o",
    temperature=0.0,
    max_tokens=1000,
)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a precise, helpful assistant answering questions about Marvel content. "
     "Use ONLY the provided context and the running chat history to answer. "
     "If the answer is not in the context, say you don't know and suggest the best next query.\n\n"
     "Answer briefly but completely. If listing items, use concise bullets.\n"
     "Always cite specific sources with titles or ids when you reference context."),
    MessagesPlaceholder("chat_history"),
    ("system",
     "Context from retrieval:\n"
     "{context}\n"
     "— End of context —"),
    ("human", "{input}")
])


rag_chain = ( 
    {
        "input": lambda x: x["input"],  
        "chat_history": lambda x: x.get("chat_history", []),  
        "context": lambda x: retriever.invoke(x["input"])  
    }
    | prompt
    | llm
    | StrOutputParser()
)

_session_store: Dict[str, ChatMessageHistory] = {}

def get_history(session_id: str) -> ChatMessageHistory: 
    if session_id not in _session_store: 
        _session_store[session_id] = ChatMessageHistory()
    return _session_store[session_id]

rag_with_history = RunnableWithMessageHistory(
    rag_chain, 
    lambda session_id: get_history(session_id),
    input_messages_key="input", 
    history_messages_key="chat_history"
)





def query_marvel(query: str, session_id: str):
    response = rag_with_history.invoke(
        {"input": query}, 
        config={"configurable": {"session_id": session_id}}
    )
    return response  # Remove ['answer'] since rag_with_history returns a string directly

@app.get("/query/")
async def get_query(query: Annotated[str, Header(alias="Query")], session_id: Annotated[str, Header(alias="Session-Id")]):
    response = query_marvel(query, session_id)
    return {"query": query, "response": response, "session_id": session_id}
