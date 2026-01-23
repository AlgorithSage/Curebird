#!/usr/bin/env python
"""
WSGI entry point for Cloud Run deployment.
This file creates the Flask application instance that gunicorn will use.
"""
import os
import sys

# Add the parent directory to the path so we can import from 'app' package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

# Create the Flask application instance
# Gunicorn will look for this 'application' variable
application = create_app()

# Also create 'app' for compatibility
app = application

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    application.run(host='0.0.0.0', port=port)
