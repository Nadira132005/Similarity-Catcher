# middleware.py
# This module provides request tracking and monitoring middleware for Flask.

import time
import uuid
import logging
from flask import request

# Get reference to logger
access_logger = logging.getLogger('access')

class RequestMiddleware:
    """
    Flask middleware for tracking and monitoring requests and responses.
    """
    def __init__(self, app, monitoring):
        """
        Initialize middleware with the Flask app and monitoring system.
        
        Args:
            app: The Flask application
            monitoring: The monitoring system instance
        """
        self.app = app
        self.monitoring = monitoring
        
        # Register middleware functions
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """
        Processes each request before it reaches the endpoint.
        Adds tracking information and logs the request.
        """
        # Add timing information for performance tracking
        request.start_time = time.time()
        
        # Add a request_id for tracking
        request.request_id = str(uuid.uuid4())
        
        # Log each received request
        user_id = request.form.get('user_id', 'anonymous') if request.method == 'POST' else request.args.get('user_id', 'anonymous')
        log_data = {
            'method': request.method,
            'path': request.path,
            'ip': request.remote_addr,
            'user_agent': request.user_agent.string,
            'user_id': user_id,
            'request_id': request.request_id
        }
        access_logger.info(f"Request received", extra=log_data)
    
    def after_request(self, response):
        """
        Processes each response after the endpoint has processed it.
        Logs the response and collects metrics periodically.
        
        Args:
            response: The Flask response object
            
        Returns:
            response: The unmodified response
        """
        # Calculate request duration
        duration = time.time() - request.start_time
        
        # Log each response
        log_data = {
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'duration': duration,
            'request_id': getattr(request, 'request_id', 'unknown')
        }
        access_logger.info(f"Request completed", extra=log_data)
        
        # Collect metrics every 10 seconds
        current_time = int(time.time())
        if current_time % 10 == 0:
            self.monitoring.collect_metrics()
        
        return response
