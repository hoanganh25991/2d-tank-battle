#!/usr/bin/env python3
"""
Simple HTTP server for serving the 2D Tank Battle game.
This is the recommended way to run the game locally.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 8080
HOST = "localhost"


class GameHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler for the tank battle game."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

        # Set proper MIME types
        if self.path.endswith(".js"):
            self.send_header("Content-Type", "application/javascript")
        elif self.path.endswith(".css"):
            self.send_header("Content-Type", "text/css")
        elif self.path.endswith(".html"):
            self.send_header("Content-Type", "text/html")

        super().end_headers()

    def log_message(self, format, *args):
        """Custom logging format."""
        print(f"[{self.address_string()}] {format % args}")


def find_free_port(start_port=8000, max_attempts=10):
    """Find a free port starting from start_port."""
    import socket

    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((HOST, port))
                return port
        except OSError:
            continue
    return None


def main():
    """Main server function."""
    # Change to the game directory
    game_dir = Path(__file__).parent.absolute()
    os.chdir(game_dir)

    # Check if index.html exists
    if not Path("index.html").exists():
        print("❌ Error: index.html not found in current directory")
        print(f"   Current directory: {game_dir}")
        sys.exit(1)

    # Find available port
    port = find_free_port(PORT)
    if port is None:
        print(f"❌ Error: No free ports available starting from {PORT}")
        sys.exit(1)

    # Create server
    try:
        with socketserver.TCPServer((HOST, port), GameHTTPRequestHandler) as httpd:
            server_url = f"http://{HOST}:{port}"

            print("🎮 2D Tank Battle Server")
            print("=" * 40)
            print(f"🚀 Server running at: {server_url}")
            print(f"📁 Serving directory: {game_dir}")
            print("🎯 Game ready! Press Ctrl+C to stop")
            print("=" * 40)

            # Try to open browser automatically
            try:
                webbrowser.open(server_url)
                print("🌐 Opening game in your default browser...")
            except Exception:
                print("💡 Manually open your browser and navigate to the URL above")

            # Serve forever
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        print("👋 Thanks for playing 2D Tank Battle!")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
