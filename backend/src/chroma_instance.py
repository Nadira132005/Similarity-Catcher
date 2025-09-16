from chromadb.config import Settings

class ChromaClient:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            from chromadb import PersistentClient
            cls._instance = PersistentClient(path="./database",settings=Settings(anonymized_telemetry=False), *args, **kwargs)
        return cls._instance


def get_chroma_client():
    return ChromaClient()