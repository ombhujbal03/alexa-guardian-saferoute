"""
Alexa+ Guardian SafeRoute - Master Launcher
Runs the self-contained simulator web application on http://127.0.0.1:5000
"""

import sys
import os

# Set UTF-8 encoding on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Add simulator_app to sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from simulator_app.app import start_server

if __name__ == "__main__":
    start_server(host="127.0.0.1", port=5000)
