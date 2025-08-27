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

# Add query rewriting chain for handling context-dependent questions
query_rewrite_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "Given the chat history and a follow-up question, rephrase the follow-up question "
     "to be a standalone question that incorporates relevant context from the chat history. "
     "Only include necessary context - don't make it overly long.\n\n"
     "Examples:\n"
     "History: 'Who is Spider-Man?' -> 'Peter Parker is Spider-Man'\n"
     "Follow-up: 'What are his powers?' -> 'What are Spider-Man's/Peter Parker's powers?'\n\n"
     "History: 'Who is the boss of Peter Parker?' -> 'J. Jonah Jameson'\n"
     "Follow-up: 'Who is that?' -> 'Who is J. Jonah Jameson?'\n\n"
     "History: 'Tell me about Iron Man' -> 'Tony Stark is Iron Man...'\n"
     "Follow-up: 'What about his suit?' -> 'What about Iron Man's/Tony Stark's suit?'\n\n"
     "If the follow-up question is already standalone, return it unchanged."),
    MessagesPlaceholder("chat_history"),
    ("human", "Follow-up question: {input}\n\nStandalone question:")
])

query_rewriter = query_rewrite_prompt | llm | StrOutputParser()

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are a precise, helpful assistant answering questions about Marvel content. "
     "Use the provided context from retrieval and the chat history to answer questions. "
     "The context was retrieved using an enhanced query that incorporates conversation history "
     "for better relevance.\n\n"
     "If the answer is not in the context, say you don't know and suggest the best next query.\n"
     "Answer briefly but completely. If listing items, use concise bullets.\n"
     "Always cite specific sources with titles or ids when you reference context."),
    MessagesPlaceholder("chat_history"),
    ("system",
     "Context from retrieval:\n"
     "{context}\n"
     "— End of context —"),
    ("human", "{input}")
])


# Function to get standalone query for retrieval
def get_standalone_query(x):
    chat_history = x.get("chat_history", [])
    original_query = x["input"]
    
    # If no history, use original query
    if not chat_history:
        print(f"No history - using original query: {original_query}")
        return original_query
    
    # Check if query seems context-dependent (short, uses pronouns, etc.)
    context_dependent_indicators = [
        "who is that", "what is that", "tell me more", "what about", 
        "how about", "and him", "and her", "his", "her", "their",
        "it", "this", "these", "those", "they", "them"
    ]
    
    is_context_dependent = (
        len(original_query.split()) <= 4 or
        any(indicator in original_query.lower() for indicator in context_dependent_indicators)
    )
    
    if not is_context_dependent:
        print(f"Query seems standalone - using original: {original_query}")
        return original_query
    
    # Rewrite query with history context
    try:
        standalone_query = query_rewriter.invoke({
            "input": original_query,
            "chat_history": chat_history
        })
        print(f"Original query: {original_query}")
        print(f"Rewritten query: {standalone_query}")
        return standalone_query.strip()
    except Exception as e:
        print(f"Error rewriting query: {e}")
        return original_query

rag_chain = ( 
    {
        "input": lambda x: x["input"],  
        "chat_history": lambda x: x.get("chat_history", []),  
        "context": lambda x: retriever.invoke(get_standalone_query(x)),  # Use rewritten query for retrieval
        "standalone_query": get_standalone_query  # For debugging
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
