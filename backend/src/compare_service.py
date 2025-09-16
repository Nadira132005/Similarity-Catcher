import uuid
import logging
import hashlib
from flask import request, jsonify
from chroma_instance import get_chroma_client
from sentence_transformers import SentenceTransformer
from llm import summary_generator

model = SentenceTransformer("models/all-MiniLM-L6-v2")

def make_id(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def handle_compare(request, _, results_dict, results_lock):
    user_id = request.form.get('user_id', 'anonymous')
    logging.info(f"User {user_id}: compare_query called")

    if 'query' not in request.form:
        return jsonify({'error': 'New inquiry is required.'}), 400

    if 'project_name' not in request.form:
        return jsonify({'error': 'Project name is required.'}), 400
    
    project_name = request.form['project_name'].strip()
    query = request.form['query']
    request_id = str(uuid.uuid4())

    try:
        client = get_chroma_client()
        collection = client.get_collection(name=project_name)

        try:
            query_embedding = model.encode([query]).tolist()
        except Exception as encode_error:
            print(f"embedding error {encode_error}")
            return jsonify({'error':'encode error'}),500
            

        results = collection.query(query_embeddings=query_embedding, n_results=5)

        top_matches = [
            {
                'id': results["ids"][0][i] if results["ids"][0] else None,
                'content': text,
                'metadata': results["metadatas"][0][i] if results["metadatas"][0] else None,
                'match':  dist,
                'project_name': project_name    
            }
            for i, (text, dist) in enumerate(zip(results["documents"][0], results["distances"][0]))
        ]

        # Sort top_matches by match score in descending order (highest similarity first)
        top_matches.sort(key=lambda x: x['match'] if x['match'] is not None else 0, reverse=True)

        with results_lock:
            results_dict[request_id] = {
                'status': 'completed',
                'top_matches': top_matches
            }

        return jsonify({
            'summary': summary_generator(query, top_matches),
            'request_id': request_id,
            'status': 'completed',
            'top_matches': top_matches,
            'project_name': project_name,
        }), 200

    except Exception as e:
        logging.exception(f"Error processing compare_query: {e}")
        with results_lock:
            results_dict[request_id] = {
                'status': 'failed',
                'error': str(e)
            }
        return jsonify({'error': 'Invalid CSV format or internal error.'}), 400
