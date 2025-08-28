# from http.server import BaseHTTPRequestHandler
# import json
# import os

# class handler(BaseHTTPRequestHandler):
#     def do_GET(self):
#         self.send_response(200)
#         self.send_header('Content-type', 'application/json')
#         self.send_header('Access-Control-Allow-Origin', '*')
#         self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
#         self.send_header('Access-Control-Allow-Headers', 'Content-Type, Query, Session-Id')
#         self.end_headers()
        
#         response = {
#             "message": "Marvel RAG API is running!", 
#             "status": "healthy",
#             "path": self.path,
#             "env_check": {
#                 "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
#                 "pinecone_key_set": bool(os.getenv("PINECONE_API_KEY"))
#             }
#         }
        
#         self.wfile.write(json.dumps(response).encode())
#         return
    
#     def do_OPTIONS(self):
#         self.send_response(200)
#         self.send_header('Access-Control-Allow-Origin', '*')
#         self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
#         self.send_header('Access-Control-Allow-Headers', 'Content-Type, Query, Session-Id')
#         self.end_headers()
#         return

from http.server import BaseHTTPRequestHandler
 
class handler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
        self.wfile.write('Hello, world!'.encode('utf-8'))
        return