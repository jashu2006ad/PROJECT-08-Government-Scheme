import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.config.settings import Config

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", Config.PORT))
    debug = Config.DEBUG
    print(f"Starting GovScheme Backend on port {port} (debug={debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
