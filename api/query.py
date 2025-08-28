from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import logging
from typing import Dict
import urllib.parse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for initialized components
retriever = None
rag_with_history = None
_session_store: Dict[str, any] = {}

def initialize_components():
    """Initialize all components with proper error handling"""
    global retriever, rag_with_history
    
    if retriever is not None:
        return True  # Already initialized
    
    try:
        # Check for required environment variables
        required_env_vars = ["OPENAI_API_KEY", "PINECONE_API_KEY"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.error(f"Missing environment variables: {missing_vars}")
            return False
        
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

        def get_history(session_id: str): 
            if session_id not in _session_store: 
                from langchain_community.chat_message_histories import ChatMessageHistory
                _session_store[session_id] = ChatMessageHistory()
            return _session_store[session_id]

        rag_with_history = RunnableWithMessageHistory(
            rag_chain, 
            lambda session_id: get_history(session_id),
            input_messages_key="input", 
            history_messages_key="chat_history"
        )

        logger.info("Server initialization completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Server initialization failed: {e}")
        return False

def query_marvel(query: str, session_id: str):
    """Execute a Marvel RAG query"""
    try:
        if not initialize_components():
            raise Exception("Failed to initialize RAG components")
        
        response = rag_with_history.invoke(
            {"input": query}, 
            config={"configurable": {"session_id": session_id}}
        )
        return response
    except Exception as e:
        logger.error(f"Error in query_marvel: {e}")
        raise Exception(f"Query processing failed: {str(e)}")

class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Query, Session-Id')
    
    def _send_json_response(self, status_code: int, data: dict):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        try:
            # Get headers
            query = self.headers.get('Query')
            session_id = self.headers.get('Session-Id')
            
            if not query or not session_id:
                self._send_json_response(400, {
                    "error": "Missing required headers: Query and Session-Id"
                })
                return
            
            # URL decode the query
            query = urllib.parse.unquote(query)
            
            logger.info(f"Received query: {query} for session: {session_id}")
            
            # Process the query
            response = query_marvel(query, session_id)
            
            self._send_json_response(200, {
                "query": query,
                "response": response,
                "session_id": session_id
            })
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            self._send_json_response(500, {
                "error": str(e)
            })
