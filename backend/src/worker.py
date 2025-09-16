# worker.py
# This module manages the background worker functionality for processing
# inquiry comparison requests using the Azure LLM.

import time
import logging
import threading
import random

# Mock function for testing - replace with real azure_llm.py when available
def azure_llm_compare(query, content, user_id):
    """Mock LLM comparison function for testing"""
    # Simulate very fast processing for tests
    # time.sleep(0.1)  # Commented out to speed up tests
    # Return mock similarity percentage
    return {
        'match_percentage': random.randint(10, 95),
        'user_id': user_id
    }

class Worker:
    """
    Manages background processing of inquiry comparison requests.
    The worker pulls requests from a queue and processes them using Azure LLM.
    """
    def __init__(self, request_queue, results_dict, results_lock):
        """
        Initialize the worker with shared resources.
        
        Args:
            request_queue: Thread-safe queue of incoming requests
            results_dict (dict): Shared dict to store results
            results_lock: Thread lock for safely accessing results_dict
        """
        self.REQUEST_QUEUE = request_queue
        self.RESULTS = results_dict
        self.RESULTS_LOCK = results_lock
        self.worker_thread = None
    
    def start(self):
        """
        Start the worker thread to process requests from the queue.
        
        Returns:
            threading.Thread: The started worker thread
        """
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()
        return self.worker_thread
    
    def _worker_loop(self):
        """
        Main worker loop that processes requests from the queue.
        This function runs in a background thread and does not return
        until a None sentinel value is received in the queue.
        """
        while True:
            req = self.REQUEST_QUEUE.get()
            if req is None:
                break  # Shutdown signal for clean exit
            try:
                request_id, user_id, query, contents = req
                results = []
                total = len(contents)
                for idx, prev in enumerate(contents):
                    # Call the (slow) Azure LLM, passing user_id for traceability
                    result = azure_llm_compare(query, prev, user_id)
                    results.append({
                        'content': prev, 
                        'match_percentage': result['match_percentage'], 
                        'llm_user_id': result['user_id']
                    })
                    # Update progress after each comparison
                    with self.RESULTS_LOCK:
                        self.RESULTS[request_id]['progress'] = int(((idx + 1) / total) * 100)
                # Only keep the top 5 matches
                top_matches = sorted(results, key=lambda x: x['match_percentage'], reverse=True)[:5]

                # Save top 5 matches to CSV in SearchResults/top_5_matches.csv
                import csv
                import os
                output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'SearchResults')
                os.makedirs(output_dir, exist_ok=True)
                output_path = os.path.join(output_dir, 'top_5_matches.csv')
                with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=['content', 'match_percentage', 'llm_user_id'])
                    writer.writeheader()
                    for match in top_matches:
                        writer.writerow(match)

                # Store the result in the shared dictionary, protected by a lock
                with self.RESULTS_LOCK:
                    self.RESULTS[request_id].update({
                        'top_matches': top_matches, 
                        'user_id': user_id, 
                        'status': 'done',
                        'progress': 100
                    })
            except Exception as e:
                logging.exception(f"Error processing request {req}: {e}")
                with self.RESULTS_LOCK:
                    self.RESULTS[request_id] = {
                        'error': 'Internal server error during processing.', 
                        'status': 'failed',
                        'progress': 100
                    }
            finally:
                self.REQUEST_QUEUE.task_done()
