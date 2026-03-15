import logging
from flask import Flask, jsonify
from flask_cors import CORS
from api.routes import bp

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(bp, url_prefix="/api")

    @app.get("/")
    def index():
        return jsonify({"message": "StockPulse API", "docs": "/api/health"})

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Not found", "hint": "Frontend runs on port 5173"}), 404

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
