import sys
import os

# Add server directory to path
server_path = os.path.join(os.path.dirname(__file__), '..', 'server')
sys.path.insert(0, server_path)

# Import the FastAPI app
try:
    from server import app
except ImportError:
    # Fallback import
    import importlib.util
    spec = importlib.util.spec_from_file_location("server", os.path.join(server_path, "server.py"))
    server_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(server_module)
    app = server_module.app

# For direct import by Vercel
application = app
