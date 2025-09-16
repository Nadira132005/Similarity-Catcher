
from flask import jsonify
from chroma_instance import get_chroma_client


def get_projects():
    chroma_client= get_chroma_client()
    collections = chroma_client.list_collections()
    project_names = [collection.name for collection in collections]
    return jsonify({"projects": project_names}), 200