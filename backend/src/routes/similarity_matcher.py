from flask import Blueprint, request, jsonify
from get_projects import get_projects
from status_service import handle_status
from load_csv_to_chroma_db import load_csv_to_chroma
from compare_service import handle_compare
import os
from werkzeug.utils import secure_filename

class ApiRoutes:
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
        
        similarity_matcher_api = Blueprint("api", __name__, url_prefix="/api/similarity-matcher")

        similarity_matcher_api.route("/createProject",methods=["POST"])(self.create_project)
        similarity_matcher_api.route('/getProjects', methods=['GET'])(self.get_projects)
        similarity_matcher_api.route('/compare', methods=['POST'])(self.compare_query)
        similarity_matcher_api.route('/status/<request_id>', methods=['GET'])(self.get_status)
        similarity_matcher_api.route('/health', methods=['GET'])(self.health_check)
        similarity_matcher_api.route('/metrics', methods=['GET'])(self.get_metrics)
        similarity_matcher_api.route('/admin/logs/clear', methods=['POST'])(self.clear_logs)
        similarity_matcher_api.route('/list_uploaded_csvs', methods=['GET'])(self.list_uploaded_csvs)
        similarity_matcher_api.route('/download_uploaded_csv/<filename>', methods=['GET'])(self.download_uploaded_csv)
        similarity_matcher_api.route('/authenticate', methods=['POST'])(self.authenticate)

        app.register_blueprint(similarity_matcher_api)

    def create_project(self):
        """Endpoint to create a new project from a CSV file."""
        try:
            if 'csv_file' not in request.files or 'project_name' not in request.form:
                return jsonify({"error": "Missing 'csv_file' or 'project_name'"}), 400

            csv_file = request.files['csv_file']
            project_name = request.form['project_name'].strip()

            if not csv_file.filename or not project_name:
                return jsonify({"error": "Empty filename or project name"}), 400

            # Save uploaded file
            upload_dir = os.path.join(os.getcwd(), 'resources', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)

            filename = secure_filename(csv_file.filename)
            file_path = os.path.join(upload_dir, filename)

            if not os.path.exists(file_path):
                csv_file.save(file_path)

            # Load data into Chroma
            added_docs = load_csv_to_chroma(file_path, project_name)
            added_count = len(added_docs) if added_docs else 0

            return jsonify({
                "message": f"Project '{project_name}' created.",
                "added_documents": added_count
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500
                   ## save chrom db project name as db file name 
                    ## if the db already exists, return an error
                    ## if the db already exists, but with diferent name add error
                    ## if the db already exists but with diferent name and has some new things similar with new things update the db
    
    def get_projects(self):
        """endpoint to retrieve a list of projects."""
        return get_projects()
    
    def authenticate(self):
        """
        Endpoint to authenticate a user.
        This is a placeholder for actual authentication logic.
        
        Returns:
            tuple: (response_json, http_status_code)

            
        """

        data = request.get_json()

        if not data or 'message' not in data:
            from flask import jsonify
            return jsonify({"error": "Missing 'message' in JSON"}), 400
        
        if data['message'].lower() != 'log in':
            return jsonify({"error": "Invalid message content"}), 400

        return {"id":11,"name":"Raul"}, 200


    def compare_query(self):
        """
        Endpoint to compare a new inquiry with a list of previous query.
        Accepts a CSV file of previous query and a new inquiry text.
          Returns:
            tuple: (response_json, http_status_code)
        """

        return handle_compare(request, self.REQUEST_QUEUE, self.RESULTS, self.RESULTS_LOCK)
    
    def compare_query_multiple(self):
        """Endpoint to compare a query in multipe projects"""
        return handle_compare_multiple(request,self.REQUEST_QUEUE,self.RESULTS, self.RESULTS_LOCK)

        
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
