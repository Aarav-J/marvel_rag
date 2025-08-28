from http.server import BaseHTTPRequestHandler
import json
import os
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Query, Session-Id')
            
            # Get headers
            query = self.headers.get('Query')
            session_id = self.headers.get('Session-Id')
            
            if not query or not session_id:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "error": "Missing Query or Session-Id headers",
                    "received_headers": dict(self.headers)
                }
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Initialize components if needed
            try:
                # Try importing the server components
                sys.path.insert(0, '/var/task')
                from server.server import query_marvel_func, initialize_components
                
                if not query_marvel_func:
                    initialize_components()
                
                # Process the query
                response_text = query_marvel_func(query, session_id)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "query": query,
                    "response": response_text,
                    "session_id": session_id
                }
                
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "error": f"Query processing failed: {str(e)}",
                    "query": query,
                    "session_id": session_id
                }
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {"error": f"Internal server error: {str(e)}"}
            self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Query, Session-Id')
        self.end_headers()
        return
