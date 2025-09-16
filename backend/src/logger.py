# logger.py
# This module sets up structured logging for the application.
# It provides different loggers for application logs, access logs, and metrics logs
# with JSON formatting and log rotation.

import os
import json
import logging
import datetime
from logging.handlers import RotatingFileHandler

def setup_logging():
    """
    Sets up structured JSON logging with different log files for
    application logs, access logs, and metrics.
    
    Returns:
        tuple: (root_logger, access_logger, metrics_logger)
    """
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # JSON formatter for structured logging
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                'timestamp': datetime.datetime.fromtimestamp(record.created).isoformat(),
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'line': record.lineno
            }
            if hasattr(record, 'user_id'):
                log_data['user_id'] = record.user_id
            if hasattr(record, 'request_id'):
                log_data['request_id'] = record.request_id
            return json.dumps(log_data)
    
    # Root logger for general application logging
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(file_handler)
    
    # Special logger for access logs
    access_logger = logging.getLogger('access')
    access_file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'access.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )
    access_file_handler.setFormatter(JsonFormatter())
    access_logger.addHandler(access_file_handler)
    access_logger.setLevel(logging.INFO)
    
    # Logger for metrics
    metrics_logger = logging.getLogger('metrics')
    metrics_file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'metrics.log'),
        maxBytes=10*1024*1024,
        backupCount=5
    )
    metrics_file_handler.setFormatter(JsonFormatter())
    metrics_logger.addHandler(metrics_file_handler)
    metrics_logger.setLevel(logging.INFO)
    
    return root_logger, access_logger, metrics_logger

def log_user_action(user_id, action):
    """
    Logs a user action for tracking and auditing purposes.
    
    Args:
        user_id (str): The ID of the user performing the action
        action (str): Description of the action performed
    """
    logging.info(f"User {user_id}: {action}")
