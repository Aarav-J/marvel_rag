from http.server import BaseHTTPRequestHandler
import json
import os

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
        """Health check endpoint"""
        try:
            response = {
                "message": "Marvel RAG API is running!", 
                "status": "healthy",
                "path": self.path,
                "env_check": {
                    "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
                    "pinecone_key_set": bool(os.getenv("PINECONE_API_KEY"))
                },
                "endpoints": {
                    "health": "/api/",
                    "query": "/api/query"
                }
            }
            
            self._send_json_response(200, response)
            
        except Exception as e:
            self._send_json_response(500, {
                "error": f"Health check failed: {str(e)}"
            })