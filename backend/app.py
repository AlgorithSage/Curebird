import os
from app import create_app

# This file acts as a bridge for deployment platforms (like Render or Cloud Run)
# that expect an 'app.py' file in the root directory.
# It initializes the application using the new modular architecture.

app = create_app()

if __name__ == '__main__':
    # Use the same port and settings as run.py for consistency
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
