from flask import Flask
from flask_cors import CORS
import logging
import threading
import queue
import datetime
from werkzeug.exceptions import HTTPException
from flask import jsonify

# Import our custom modules
from logger import setup_logging
from worker import Worker
from monitoring import Monitoring
from middleware import RequestMiddleware
from routes.teacher_assistant import ApiRoutes as ApiRoutesTeacherAssistant
from routes.similarity_matcher import ApiRoutes as ApiRoutesSimilarityMatcher

# Create the Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# --- Multi-User, Slow-Endpoint Safe Backend Design ---
# We use a thread-safe queue to buffer incoming requests, and a background worker thread
# to process them one at a time. This ensures that if the Azure LLM endpoint is slow,
# requests are not lost or failed, but are processed in order. Each request is assigned
# a unique request_id, and results are stored in a thread-safe dictionary for later retrieval.

# Thread-safe queue for incoming requests. The maxsize limits how many can wait at once.
REQUEST_QUEUE = queue.Queue(maxsize=20)  # Limit queue size to prevent overload

# Dictionary to store results or status for each request_id. Protected by a lock for thread safety.
RESULTS = {}
RESULTS_LOCK = threading.Lock()

@app.route('/')
def index():
    return {"status": "ok"}, 200


# Global error handler for exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    """
    Global error handler that transforms exceptions to JSON responses.
    
    Args:
        e: The exception that was raised
        
    Returns:
        tuple: (json_response, http_status_code)
    """
    if isinstance(e, HTTPException):
        return jsonify({'error': e.description}), e.code
    
    logging.exception(f"Unhandled exception: {e}")
    return jsonify({'error': 'Internal server error.'}), 500

def initialize_app():
    """
    Initialize and configure all components of the application.
    
    Returns:
        tuple: (worker_thread, api_routes)
    """
    # Set up structured logging
    root_logger, access_logger, metrics_logger = setup_logging()
    
    # Create worker for background processing
    worker = Worker(REQUEST_QUEUE, RESULTS, RESULTS_LOCK)
    worker_thread = worker.start()
    
    # Setup monitoring system
    monitoring = Monitoring(RESULTS, RESULTS_LOCK, REQUEST_QUEUE, worker_thread)
    
    # Register middleware
    RequestMiddleware(app, monitoring)
    
    # Register API routes
    api_routes_teacher_assistant = ApiRoutesTeacherAssistant(app, REQUEST_QUEUE, RESULTS, RESULTS_LOCK, monitoring)
    api_routes_similarity_matcher = ApiRoutesSimilarityMatcher(app, REQUEST_QUEUE, RESULTS, RESULTS_LOCK, monitoring)
    api_routes = (api_routes_teacher_assistant, api_routes_similarity_matcher)
    # Initial metrics collection
    monitoring.collect_metrics()
    
    return worker_thread, api_routes

worker_thread, api_routes = initialize_app()

if __name__ == '__main__':
    # Log startup
    logging.info("Application starting...", 
                extra={"startup_time": datetime.datetime.now().isoformat()})

    
    print("🚀 " + "="*60)
    print("🚀 Similarity Matcher BACKEND STARTING...")
    print("🚀 " + "="*60)
    print(f"🚀 Server running on: http://localhost:8000")
    print("🚀 " + "="*60)
    print("🚀 Backend is Running! ✅")
    print("🚀 " + "="*60)
    # Start the application server
    app.run(debug=True, host='0.0.0.0', port=8000)
