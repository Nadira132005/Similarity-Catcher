import csv
import hashlib
from chroma_instance import get_chroma_client
from sentence_transformers import SentenceTransformer

chroma_client = get_chroma_client()
embedding_model = SentenceTransformer("models/all-MiniLM-L6-v2")

def make_id(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def embed_documents(texts):
    return embedding_model.encode(texts).tolist()

def load_csv_to_chroma(csv_path: str, project_name: str):
    try:

        existing_collections = [c.name for c in chroma_client.list_collections()]
        if project_name in existing_collections:
            collection = chroma_client.get_collection(name=project_name.strip())
            existing_ids = set(collection.get()['ids'])
        else:
            # Create collection with cosine similarity config
            collection = chroma_client.create_collection(
                name=project_name.strip(),
                embedding_function=None,  
                metadata={"hnsw:space": "cosine"}  # Fixed configuration syntax
            )
            existing_ids = set()

        documents, ids = [], []
        metadata_list = []

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader, None)  # Read header row

            if not header:
                print("CSV file is empty or has no header")
                return []

            num_columns = len(header)
            for row_num, row in enumerate(reader, start=1):
                if not row or len(row) != num_columns:
                    continue

                # Build description as 'column_name: column_value' for each column
                description_parts = [f"{col_name}: {row[idx].strip()}" for idx, col_name in enumerate(header)]
                document_text = "\n".join(description_parts)

                # Build metadata dictionary for all columns
                metadata = {col_name: row[idx].strip() for idx, col_name in enumerate(header)}
                metadata["row_id"] = str(row_num)

                row_id = str(row_num)
                if row_id not in existing_ids:
                    documents.append(document_text)
                    ids.append(row_id)
                    metadata_list.append(metadata)

        if not documents:
            print("No new documents to add.")
            return []

        embeddings = embed_documents(documents)
        collection.add(documents=documents, ids=ids, embeddings=embeddings, metadatas=metadata_list)

        return documents

    except Exception as e:
        print(f"[ERROR] CSV load failed: {e}")
        return []
