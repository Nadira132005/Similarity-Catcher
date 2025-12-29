import os
from chromadb.config import Settings

class ChromaClient:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            from chromadb import PersistentClient
            # Get the directory where this script is located
            SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
            DB_PATH = os.path.join(SCRIPT_DIR, "database")
            cls._instance = PersistentClient(path=DB_PATH, settings=Settings(anonymized_telemetry=False), *args, **kwargs)
        return cls._instance


def get_chroma_client():
    return ChromaClient()