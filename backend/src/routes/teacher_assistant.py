from flask import request, jsonify, Blueprint
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from compare_service import handle_compare
from status_service import handle_status
import os
from llm import ask_llm
from functools import reduce

# Get the directory where the src folder is located (parent of routes)
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_dir = os.path.join(SCRIPT_DIR, 'models', 'all-MiniLM-L6-v2')
model = SentenceTransformer(model_dir)
chroma_db_dir = os.path.join(SCRIPT_DIR, 'chroma_db')
# Use shared model directory
chroma_client = chromadb.PersistentClient(path=chroma_db_dir, settings=Settings(anonymized_telemetry=False))

class ApiRoutes:
    def get_top_vectors(self, prompt):
        collection = chroma_client.get_collection(name="api_files")

        query_embedding = model.encode([prompt])[0]
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=10,
            include=["documents", "metadatas"]
        )
        top_results = []
        for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
            top_results.append({
                "filename": metadata.get("filename", "unknown"),
                "content": doc
            })
        return top_results

    def return_top_vectos(self):
        """
        Endpoint to return the top 10 vectors from ChromaDB for a given prompt.
        Expects JSON: {"prompt": "..."}
        Returns: {"results": [{"filename": ..., "content": ...}, ...]}
        """
        data = request.get_json()
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        top_results = self.get_top_vectors(prompt)       
        return jsonify({"results": top_results})
    
    def generate_tests(self):
        data = request.get_json()
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        top_results = self.get_top_vectors(prompt)
        html_files = reduce(lambda acc, s: acc + s["content"] + '\n', top_results, '')
        response = ask_llm(f"<user_issue>{prompt}</user_issue><html_files>{html_files}</html_files>")

        return jsonify({"response": response})
    
    """
    Defines API routes and handlers for the application.
    """
    def __init__(self, app, request_queue, results_dict, results_lock, monitoring):
        """
        Initialize API routes with shared resources.
        
        Args:
            app: The Flask application
            request_queue: Thread-safe queue for incoming requests
            results_dict (dict): Shared dictionary to store results
            results_lock: Thread lock for safely accessing results_dict
            monitoring: The monitoring system instance
        """
        self.REQUEST_QUEUE = request_queue
        self.RESULTS = results_dict
        self.RESULTS_LOCK = results_lock
        self.monitoring = monitoring

        teacher_assistant_api = Blueprint("teacher_assistant", __name__)
        
        # Register routes using add_url_rule for instance methods
        teacher_assistant_api.add_url_rule('/compare', view_func=self.compare_issues, methods=['POST'])
        teacher_assistant_api.add_url_rule('/status/<request_id>', view_func=self.get_status, methods=['GET'])
        teacher_assistant_api.add_url_rule('/health', view_func=self.health_check, methods=['GET'])
        teacher_assistant_api.add_url_rule('/metrics', view_func=self.get_metrics, methods=['GET'])
        teacher_assistant_api.add_url_rule('/admin/logs/clear', view_func=self.clear_logs, methods=['POST'])
        teacher_assistant_api.add_url_rule('/list_uploaded_csvs', view_func=self.list_uploaded_csvs, methods=['GET'])
        teacher_assistant_api.add_url_rule('/download_uploaded_csv/<filename>', view_func=self.download_uploaded_csv, methods=['GET'])
        teacher_assistant_api.add_url_rule('/get-top-vectors', view_func=self.return_top_vectos, methods=['POST'])
        teacher_assistant_api.add_url_rule("/testcases/generate", view_func=self.generate_tests, methods=['POST'])

        app.register_blueprint(teacher_assistant_api, url_prefix="/api/teacher-assistant")
        
    def compare_issues(self):
        """
        Endpoint to compare a new issue with a list of previous issues.
        Accepts a CSV file of previous issues and a new issue text.
          Returns:
            tuple: (response_json, http_status_code)
        """
        try:       
            return handle_compare(request, self.REQUEST_QUEUE, self.RESULTS, self.RESULTS_LOCK)
        except Exception as e:
            import logging
            logging.exception(f"Error in /compare: {e}",
                             extra={"user_id": request.form.get('user_id', 'anonymous'),
                                    "request_id": getattr(request, 'request_id', 'unknown')})
            from flask import jsonify
            return jsonify({'error': 'Internal server error.'}), 500
    
    def get_status(self, request_id):
        """
        Endpoint to get the status of a previously submitted comparison request.
        
        Args:
            request_id (str): The ID of the request to check
            
        Returns:
            tuple: (response_json, http_status_code)
        """
        return handle_status(request_id, self.RESULTS, self.RESULTS_LOCK)
    
    def health_check(self):
        """
        Endpoint to check application health status.
        
        Returns:
            tuple: (response_json, http_status_code)
        """
        return self.monitoring.health_check()
    
    def get_metrics(self):
        """
        Endpoint to get detailed system and application metrics.
        
        Returns:
            tuple: (response_json, http_status_code)
        """
        return self.monitoring.get_metrics()
    
    def clear_logs(self):
        """
        Administrative endpoint to clear log files.
        Protected by an admin key in the request header.
        
        Returns:
            tuple: (response_json, http_status_code)
        """
        admin_key = request.headers.get('Admin-Key')
        return self.monitoring.clear_logs(admin_key)
    
    def list_uploaded_csvs(self):
        """
        Endpoint to list all uploaded CSV files.
        
        Returns:
            tuple: (response_json, http_status_code)
        """
        import os
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploaded_csvs')
        os.makedirs(upload_dir, exist_ok=True)
        files = [f for f in os.listdir(upload_dir) if f.endswith('.csv')]
        return {'files': files}
    
    def download_uploaded_csv(self, filename):
        """
        Endpoint to download a specific uploaded CSV file.
        
        Args:
            filename (str): The name of the file to download
            
        Returns:
            tuple: (response_json, http_status_code)
        """
        import os
        from flask import send_from_directory
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploaded_csvs')
        return send_from_directory(upload_dir, filename, as_attachment=True)
