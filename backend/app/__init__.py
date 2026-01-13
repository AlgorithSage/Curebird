from flask import Flask
from flask_cors import CORS

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        # Import parts of our application
        from . import routes
        
        # Register Blueprints
        app.register_blueprint(routes.app)

        return app
