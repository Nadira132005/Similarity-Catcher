# monitoring.py
# This module provides monitoring and metrics collection functionality
# to track system resources, application health and performance.

import os
import json
import time
import socket
import datetime
import logging
import psutil
from flask import request, jsonify

# Get reference to loggers
metrics_logger = logging.getLogger('metrics')

class Monitoring:
    """
    Handles monitoring and health check functionality for the application.
    """
    def __init__(self, results_dict, results_lock, request_queue, worker_thread):
        """
        Initialize the monitoring system with references to application resources.
        
        Args:
            results_dict (dict): The shared results dictionary
            results_lock: Lock for thread-safe access to results
            request_queue: The request processing queue
            worker_thread: Reference to the worker thread
        """
        self.RESULTS = results_dict
        self.RESULTS_LOCK = results_lock
        self.REQUEST_QUEUE = request_queue
        self.worker_thread = worker_thread
    
    def collect_metrics(self):
        """
        Collects system and application metrics and logs them.
        Used for monitoring performance and resource usage over time.
        """
        try:
            # Collect system metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Application-specific metrics
            with self.RESULTS_LOCK:
                total_results = len(self.RESULTS)
                done_results = len([r for r in self.RESULTS.values() if r.get('status') == 'done'])
                failed_results = len([r for r in self.RESULTS.values() if r.get('status') == 'failed'])
            
            queue_size = self.REQUEST_QUEUE.qsize()
            
            metrics = {
                'timestamp': datetime.datetime.now().isoformat(),
                'system': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available_mb': memory.available // (1024 * 1024),
                    'disk_percent': disk.percent,
                    'disk_free_gb': disk.free // (1024 * 1024 * 1024),
                },
                'app': {
                    'queue_size': queue_size,
                    'total_results': total_results,
                    'done_results': done_results,
                    'failed_results': failed_results,
                }
            }
            metrics_logger.info(json.dumps(metrics))
        except Exception as e:
            logging.exception(f"Error collecting metrics: {e}")

    def health_check(self):
        """
        Performs a health check on the application.
        Checks if worker thread is running and queue isn't full.
        
        Returns:
            tuple: (response_json, http_status_code)
        """
        # Check if worker thread is running
        worker_alive = self.worker_thread.is_alive()
        
        # Check if queue isn't blocked
        queue_ok = self.REQUEST_QUEUE.qsize() < self.REQUEST_QUEUE.maxsize
        
        # If both conditions are met, service is healthy
        if worker_alive and queue_ok:
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.datetime.now().isoformat(),
                'worker': 'alive',
                'queue': {
                    'size': self.REQUEST_QUEUE.qsize(),
                    'max_size': self.REQUEST_QUEUE.maxsize
                }
            }), 200
        else:
            # Report specific query
            query = []
            if not worker_alive:
                query.append('Worker thread is not running')
            if not queue_ok:
                query.append('Request queue is full')
            
            return jsonify({
                'status': 'unhealthy',
                'timestamp': datetime.datetime.now().isoformat(),
                'query': query
            }), 503

    def get_metrics(self):
        """
        Collects and returns detailed system and application metrics.
        
        Returns:
            tuple: (metrics_json, http_status_code)
        """
        try:
            # Host information
            hostname = socket.gethostname()
            
            # System statistics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Current process statistics
            process = psutil.Process()
            proc_memory = process.memory_info()
            
            # Application statistics
            with self.RESULTS_LOCK:
                total_results = len(self.RESULTS)
                results_status = {
                    'done': len([r for r in self.RESULTS.values() if r.get('status') == 'done']),
                    'processing': len([r for r in self.RESULTS.values() if r.get('status') == 'processing']),
                    'failed': len([r for r in self.RESULTS.values() if r.get('status') == 'failed']),
                }
            
            return jsonify({
                'timestamp': datetime.datetime.now().isoformat(),
                'hostname': hostname,
                'system': {
                    'cpu_percent': cpu_percent,
                    'memory': {
                        'total_mb': memory.total // (1024 * 1024),
                        'available_mb': memory.available // (1024 * 1024),
                        'used_mb': memory.used // (1024 * 1024),
                        'percent': memory.percent
                    },
                    'disk': {
                        'total_gb': disk.total // (1024 * 1024 * 1024),
                        'free_gb': disk.free // (1024 * 1024 * 1024),
                        'used_gb': disk.used // (1024 * 1024 * 1024),
                        'percent': disk.percent
                    }
                },
                'process': {
                    'memory_mb': proc_memory.rss // (1024 * 1024),
                    'threads': process.num_threads(),
                    'cpu_percent': process.cpu_percent(interval=0.1)
                },
                'app': {
                    'queue_size': self.REQUEST_QUEUE.qsize(),
                    'queue_max_size': self.REQUEST_QUEUE.maxsize,
                    'results': {
                        'total': total_results,
                        'status': results_status
                    }
                }
            })
        except Exception as e:
            logging.exception(f"Error generating metrics: {e}")
            return jsonify({'error': 'Failed to collect metrics'}), 500

    def clear_logs(self, admin_key):
        """
        Administrative endpoint to clear log files.
        Protected by an admin key from environment variable.
        
        Args:
            admin_key (str): Authentication key for admin operations
            
        Returns:
            tuple: (response_json, http_status_code)
        """
        # Use environment variable for admin key
        env_admin_key = os.environ.get('ADMIN_KEY')
        if not env_admin_key:
            logging.warning("ADMIN_KEY environment variable not set! Using default insecure key.")
            env_admin_key = 'supersecretadminkey'  # fallback for legacy/testing
        if admin_key != env_admin_key:
            logging.warning("Unauthorized attempt to clear logs", 
                          extra={"ip": request.remote_addr, 
                                "request_id": getattr(request, 'request_id', 'unknown')})
            return jsonify({'error': 'Unauthorized'}), 401
        
        try:
            log_dir = os.path.join(os.path.dirname(__file__), 'logs')
            logs_cleared = []
            
            for log_file in ['app.log', 'access.log', 'metrics.log']:
                path = os.path.join(log_dir, log_file)
                if os.path.exists(path):
                    # Open the file and truncate it
                    with open(path, 'w') as f:
                        pass
                    logs_cleared.append(log_file)
            
            logging.info("Logs cleared by admin", 
                        extra={"logs_cleared": logs_cleared, 
                              "request_id": getattr(request, 'request_id', 'unknown')})
            return jsonify({
                'status': 'success',
                'logs_cleared': logs_cleared
            })
        except Exception as e:
            logging.exception(f"Error clearing logs: {e}")
            return jsonify({'error': 'Failed to clear logs'}), 500
