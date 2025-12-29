from flask import request, jsonify, Blueprint
from sentence_transformers import SentenceTransformer
from compare_service import handle_compare
from status_service import handle_status
from chroma_instance import get_chroma_client
import os
from llm import ask_llm
from functools import reduce

# Get the directory where the src folder is located (parent of routes)
SCRIPT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_dir = os.path.join(SCRIPT_DIR, 'models', 'all-MiniLM-L6-v2')
model = SentenceTransformer(model_dir)
# Use shared ChromaDB instance
chroma_client = get_chroma_client()

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
        project_name = data.get('project_name', 'api_files')  # Default to old behavior

        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        try:
            # Check if collection exists
            existing_collections = [c.name for c in chroma_client.list_collections()]
            if project_name not in existing_collections:
                return jsonify({
                    'error': f'Collection [{project_name}] does not exist. Please select a valid project.'
                }), 400

            # Get problems from specified project
            collection = chroma_client.get_collection(name=project_name)

            # Check if collection has any documents
            col_data = collection.get()
            if not col_data['ids'] or len(col_data['ids']) == 0:
                return jsonify({
                    'error': f'Project [{project_name}] has no problems. Please upload a PDF with content first.'
                }), 400

            query_embedding = model.encode([prompt])[0]
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(25, len(col_data['ids'])),  # Get top 25 relevant problems
                include=["documents", "metadatas"]
            )

            # Build context from similar problems
            problems_context = "\n\n".join([
                f"Problem {i+1}: {doc}"
                for i, doc in enumerate(results['documents'][0])
            ])

            if not problems_context.strip():
                return jsonify({
                    'error': f'No problems found in project [{project_name}].'
                }), 400

            # Generate test using LLM
            from llm import generate_test_with_modified_problems
            response = generate_test_with_modified_problems(problems_context)

            return jsonify({"response": response, "project_name": project_name})

        except Exception as e:
            import logging
            logging.exception(f"Error generating tests: {e}")
            return jsonify({'error': f'Failed to generate tests: {str(e)}'}), 500
    
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
        teacher_assistant_api.add_url_rule("/create-project-from-pdf", view_func=self.create_project_from_pdf, methods=['POST'])
        teacher_assistant_api.add_url_rule("/get-teacher-projects", view_func=self.get_teacher_projects, methods=['GET'])
        teacher_assistant_api.add_url_rule("/delete-project/<project_name>", view_func=self.delete_project, methods=['DELETE'])

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

    def create_project_from_pdf(self):
        """
        Endpoint to create a new teacher assistant project from a PDF file.
        Extracts problems from the PDF and stores them in ChromaDB.

        Returns:
            tuple: (response_json, http_status_code)
        """
        try:
            import logging
            from werkzeug.utils import secure_filename
            from pdf_processor import process_pdf_to_project

            logging.info(f"Received create-project-from-pdf request. Files: {list(request.files.keys())}, Form: {list(request.form.keys())}")

            if 'pdf_file' not in request.files:
                return jsonify({"error": "Missing 'pdf_file' in request"}), 400

            if 'project_name' not in request.form:
                return jsonify({"error": "Missing 'project_name' in request"}), 400

            pdf_file = request.files['pdf_file']
            project_name = request.form['project_name'].strip()

            if not pdf_file.filename:
                return jsonify({"error": "No file selected"}), 400

            if not project_name:
                return jsonify({"error": "Project name cannot be empty"}), 400

            # Validate file extension
            if not pdf_file.filename.lower().endswith('.pdf'):
                return jsonify({"error": "Only PDF files are supported"}), 400

            # Save uploaded PDF file
            upload_dir = os.path.join(os.getcwd(), 'resources', 'uploads', 'pdfs')
            os.makedirs(upload_dir, exist_ok=True)

            filename = secure_filename(pdf_file.filename)
            file_path = os.path.join(upload_dir, filename)

            pdf_file.save(file_path)
            logging.info(f"PDF saved to: {file_path}")

            # Process PDF and create project
            result = process_pdf_to_project(file_path, project_name)

            if result['success']:
                return jsonify({
                    "message": f"Project '{project_name}' created successfully from PDF.",
                    "problems_count": result['problems_count'],
                    "total_problems": result.get('total_problems', result['problems_count']),
                    "project_name": project_name
                }), 200
            else:
                return jsonify({
                    "error": result.get('error', 'Failed to process PDF'),
                    "problems_count": result.get('problems_count', 0)
                }), 400

        except Exception as e:
            import logging
            logging.exception(f"Error in create_project_from_pdf: {e}")
            return jsonify({"error": f"Failed to create project from PDF: {str(e)}"}), 500

    def get_teacher_projects(self):
        """
        Endpoint to retrieve all teacher assistant projects.
        Returns list of project names from ChromaDB collections that have documents with type='problem'.

        Returns:
            tuple: (response_json, http_status_code)
        """
        try:
            import logging

            logging.info("Retrieving teacher assistant projects")

            # Get all collections from ChromaDB
            all_collections = chroma_client.list_collections()
            logging.info(f"Total collections in database: {len(all_collections)}")

            # Filter collections that have documents with type='problem' metadata
            teacher_projects = []
            for collection in all_collections:
                try:
                    # Get collection data
                    col_data = collection.get()
                    item_count = len(col_data.get('ids', []))

                    # If collection is empty, still check collection metadata
                    if item_count == 0:
                        # Check collection-level metadata
                        collection_meta = collection.metadata or {}
                        if collection_meta.get('type') == 'teacher_assistant':
                            teacher_projects.append({
                                'name': collection.name,
                                'problems_count': 0
                            })
                            logging.info(f"Added empty teacher project: {collection.name}")
                        continue

                    # Check if this collection has documents with type='problem' in metadata
                    metadatas = col_data.get('metadatas', [])
                    if metadatas and len(metadatas) > 0:
                        # Check first document's metadata for type='problem'
                        first_metadata = metadatas[0] or {}
                        if first_metadata.get('type') == 'problem':
                            teacher_projects.append({
                                'name': collection.name,
                                'problems_count': item_count
                            })
                            logging.info(f"Added teacher project: {collection.name} with {item_count} problems")

                except Exception as col_error:
                    logging.warning(f"Error checking collection {collection.name}: {col_error}")
                    continue

            logging.info(f"Found {len(teacher_projects)} teacher assistant projects")

            return jsonify({
                "projects": teacher_projects,
                "count": len(teacher_projects)
            }), 200

        except Exception as e:
            import logging
            logging.exception(f"Error in get_teacher_projects: {e}")
            return jsonify({"error": f"Failed to retrieve projects: {str(e)}"}), 500

    def delete_project(self, project_name):
        """
        Endpoint to delete a teacher assistant project.
        Deletes the ChromaDB collection for the specified project.

        Args:
            project_name (str): The name of the project to delete

        Returns:
            tuple: (response_json, http_status_code)
        """
        try:
            import logging

            logging.info(f"Attempting to delete project: {project_name}")

            # Check if collection exists
            existing_collections = [c.name for c in chroma_client.list_collections()]
            if project_name not in existing_collections:
                return jsonify({
                    "error": f"Project '{project_name}' does not exist."
                }), 404

            # Check if it's a teacher assistant project
            collection = chroma_client.get_collection(name=project_name)
            col_data = collection.get()

            is_teacher_project = False

            # Check collection metadata
            if collection.metadata and collection.metadata.get('type') == 'teacher_assistant':
                is_teacher_project = True

            # Check document metadata if collection has items
            if not is_teacher_project and col_data.get('metadatas') and len(col_data['metadatas']) > 0:
                first_metadata = col_data['metadatas'][0] or {}
                if first_metadata.get('type') == 'problem':
                    is_teacher_project = True

            if not is_teacher_project:
                return jsonify({
                    "error": f"Project '{project_name}' is not a teacher assistant project and cannot be deleted."
                }), 400

            # Delete the collection
            chroma_client.delete_collection(name=project_name)
            logging.info(f"Successfully deleted project: {project_name}")

            return jsonify({
                "message": f"Project '{project_name}' deleted successfully.",
                "project_name": project_name
            }), 200

        except Exception as e:
            import logging
            logging.exception(f"Error deleting project {project_name}: {e}")
            return jsonify({"error": f"Failed to delete project: {str(e)}"}), 500
