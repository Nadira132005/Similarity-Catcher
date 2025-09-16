import logging
from flask import request, jsonify

def handle_status(request_id, results_dict, results_lock):
    try:
        with results_lock:
            result = results_dict.get(request_id)
        if not result:
            logging.warning(f"Invalid request_id {request_id} requested",
                            extra={"request_id": getattr(request, 'request_id', 'unknown')})
            return jsonify({'error': 'Invalid request_id'}), 404
        return jsonify(result)
    except Exception as e:
        logging.exception(f"Error in /status: {e}",
                         extra={"request_id": getattr(request, 'request_id', 'unknown')})
        return jsonify({'error': 'Internal server error.'}), 500
