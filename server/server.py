import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Header
from typing import Annotated, Dict


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://marvel-rag.vercel.app",
        "https://marvel-rag-git-master.vercel.app",
        "https://marvel-rag-aarav-j.vercel.app",
        "https://marveloracle.vercel.app",
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Check for required environment variables
required_env_vars = ["OPENAI_API_KEY", "PINECONE_API_KEY"]
missing_vars = []

for var in required_env_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    logger.error(f"Missing environment variables: {missing_vars}")
    # Don't raise exception in serverless - return error response instead
    app.state.initialization_error = f"Missing required environment variables: {missing_vars}"
else:
    app.state.initialization_error = None

# Global variables for initialized components
retriever = None
rag_with_history = None
query_marvel_func = None

def initialize_components():
    """Initialize all components with proper error handling"""
    global retriever, rag_with_history, query_marvel_func
    
    if app.state.initialization_error:
        return False
    
    try:
        # Initialize components with error handling
        from langchain_text_splitters import MarkdownHeaderTextSplitter
        from langchain_pinecone import PineconeVectorStore
        from pinecone import Pinecone, ServerlessSpec
        from langchain_openai import OpenAIEmbeddings, ChatOpenAI
        from langchain_core.runnables import RunnablePassthrough
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        from langchain_core.output_parsers import StrOutputParser
        from langchain_core.runnables.history import RunnableWithMessageHistory
        from langchain_community.chat_message_histories import ChatMessageHistory

        logger.info("Initializing Pinecone...")
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        
        logger.info("Initializing embeddings...")
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small", 
            openai_api_key=os.getenv("OPENAI_API_KEY"),
        )

        logger.info("Connecting to vector store...")
        vectorstore = PineconeVectorStore.from_existing_index(
            embedding=embeddings, 
            index_name="marvel-embeddings",
            namespace="documents",
        )

        retriever = vectorstore.as_retriever(
            search_kwargs={"k": 5, "namespace": "documents"},
        )

        logger.info("Initializing LLM...")
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
                logger.info(f"No history - using original query: {original_query}")
                return original_query
            
            # Check if query seems context-dependent
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
                logger.info(f"Query seems standalone - using original: {original_query}")
                return original_query
            
            # Rewrite query with history context
            try:
                standalone_query = query_rewriter.invoke({
                    "input": original_query,
                    "chat_history": chat_history
                })
                logger.info(f"Original query: {original_query}")
                logger.info(f"Rewritten query: {standalone_query}")
                return standalone_query.strip()
            except Exception as e:
                logger.error(f"Error rewriting query: {e}")
                return original_query

        rag_chain = ( 
            {
                "input": lambda x: x["input"],  
                "chat_history": lambda x: x.get("chat_history", []),  
                "context": lambda x: retriever.invoke(get_standalone_query(x)),
                "standalone_query": get_standalone_query
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
            try:
                response = rag_with_history.invoke(
                    {"input": query}, 
                    config={"configurable": {"session_id": session_id}}
                )
                return response
            except Exception as e:
                logger.error(f"Error in query_marvel: {e}")
                raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

        query_marvel_func = query_marvel
        logger.info("Server initialization completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Server initialization failed: {e}")
        app.state.initialization_error = str(e)
        return False

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    initialize_components()

@app.get("/")
@app.get("")
async def root():
    return {
        "message": "Marvel RAG API is running!", 
        "status": "healthy" if not hasattr(app.state, 'initialization_error') or not app.state.initialization_error else "error",
        "env_check": {
            "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
            "pinecone_key_set": bool(os.getenv("PINECONE_API_KEY"))
        },
        "initialization_error": getattr(app.state, 'initialization_error', None)
    }

@app.get("/health")
async def health_check():
    if app.state.initialization_error:
        return {
            "status": "unhealthy", 
            "error": app.state.initialization_error
        }
    
    if not retriever:
        # Try to initialize if not already done
        if not initialize_components():
            return {
                "status": "unhealthy", 
                "error": "Failed to initialize components"
            }
    
    try:
        # Test if we can access the vector store
        test_result = retriever.invoke("test query")
        return {
            "status": "healthy", 
            "vector_store": "connected",
            "retriever_test": "passed"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy", 
            "error": str(e)
        }

@app.get("/query/")
@app.get("/query")
async def get_query(
    query: Annotated[str, Header(alias="Query")], 
    session_id: Annotated[str, Header(alias="Session-Id")]
):
    if app.state.initialization_error:
        raise HTTPException(status_code=500, detail=app.state.initialization_error)
    
    if not query_marvel_func:
        # Try to initialize if not already done
        if not initialize_components():
            raise HTTPException(status_code=500, detail="Failed to initialize components")
    
    try:
        logger.info(f"Received query: {query} for session: {session_id}")
        response = query_marvel_func(query, session_id)
        return {"query": query, "response": response, "session_id": session_id}
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def auth_login():
    # Simple pass-through since Appwrite handles authentication
    return {"status": "ok", "message": "Authentication handled by Appwrite"}

@app.post("/auth/logout")
async def auth_logout():
    # Simple pass-through since Appwrite handles authentication
    return {"status": "ok", "message": "Logout handled by Appwrite"}

# Export the app directly - Vercel will handle the ASGI interface
# This is the correct way for Vercel Python runtime

# For development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)