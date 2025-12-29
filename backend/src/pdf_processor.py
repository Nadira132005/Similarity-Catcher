"""
PDF Problem Extractor - Extracts problems from PDF and stores in ChromaDB
"""
import fitz  # PyMuPDF
import re
import os
import logging
import hashlib
from sentence_transformers import SentenceTransformer
from chroma_instance import get_chroma_client

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "models", "all-MiniLM-L6-v2")

embedding_model = SentenceTransformer(MODEL_PATH)
chroma_client = get_chroma_client()


def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF file page by page."""
    try:
        doc = fitz.open(pdf_path)
        text_content = []

        for page_num, page in enumerate(doc):
            text = page.get_text()
            if text.strip():  # Only add non-empty pages
                text_content.append({
                    'page': page_num + 1,
                    'text': text
                })

        doc.close()
        logging.info(f"Extracted text from {len(text_content)} pages")
        return text_content

    except Exception as e:
        logging.error(f"Error extracting text from PDF: {e}")
        raise


def extract_problems_from_text(text_content):
    """
    Extract problems/exercises from text content.
    Returns list of problems with their text and page number.
    """
    problems = []

    # Patterns for detecting problems (English and Romanian)
    problem_patterns = [
        r'(?:Problem|Exercise|Problema|Exercițiu|Exercitiu)\s*[\d\.]+\s*[:\-]?\s*(.+?)(?=(?:Problem|Exercise|Problema|Exercițiu|Exercitiu)\s*[\d\.]|\Z)',
        r'^\s*\d+\.\s+(.+?)(?=^\s*\d+\.|\Z)',
        r'(?:Question|Întrebare|Intrebare)\s*[\d\.]*\s*[:\-]?\s*(.+?)(?=(?:Question|Întrebare|Intrebare)|\Z)',
    ]

    for page_data in text_content:
        page_num = page_data['page']
        text = page_data['text']

        # Try each pattern
        for pattern in problem_patterns:
            matches = re.finditer(pattern, text, re.MULTILINE | re.DOTALL | re.IGNORECASE)
            for match in matches:
                problem_text = match.group(0).strip()
                # Filter: minimum 20 chars, not just numbers
                if len(problem_text) > 20 and not problem_text.replace('.', '').replace(' ', '').isdigit():
                    problems.append({
                        'page': page_num,
                        'text': problem_text[:500],  # Limit to 500 chars
                        'full_text': problem_text
                    })

    # If no patterns found, use more aggressive extraction
    if not problems:
        logging.warning("No pattern matches found, using aggressive paragraph extraction")
        for page_data in text_content:
            page_num = page_data['page']
            text = page_data['text']

            # Split by double newlines or single newlines if double doesn't work
            paragraphs = text.split('\n\n')
            if len(paragraphs) == 1:
                paragraphs = text.split('\n')

            for para in paragraphs:
                para = para.strip()

                # More lenient filtering - any substantial text block
                if len(para) > 50:  # Reduced from 30 to catch more content
                    # Skip headers/titles (all caps, very short, etc)
                    if para.isupper() and len(para) < 100:
                        continue

                    problems.append({
                        'page': page_num,
                        'text': para[:500],
                        'full_text': para
                    })

    # If still no problems, just split entire pages into chunks
    if not problems:
        logging.warning("Still no problems found, splitting pages into chunks")
        for page_data in text_content:
            page_num = page_data['page']
            text = page_data['text'].strip()

            if len(text) > 100:
                # Split text into chunks of ~1000 characters
                chunk_size = 1000
                for i in range(0, len(text), chunk_size):
                    chunk = text[i:i+chunk_size].strip()
                    if len(chunk) > 100:
                        problems.append({
                            'page': page_num,
                            'text': chunk[:500],
                            'full_text': chunk
                        })

    logging.info(f"Extracted {len(problems)} problems total")
    return problems


def process_pdf_to_project(pdf_path, project_name):
    """
    Main function: Extract problems from PDF and save to ChromaDB collection.

    Args:
        pdf_path: Path to PDF file
        project_name: Name of the project/collection

    Returns:
        dict with success status and problem count
    """
    try:
        logging.info(f"Processing PDF for project: {project_name}")

        # Step 1: Extract text
        text_content = extract_text_from_pdf(pdf_path)
        if not text_content:
            return {'success': False, 'error': 'No text extracted from PDF', 'problems_count': 0}

        # Step 2: Extract problems
        problems = extract_problems_from_text(text_content)

        # Step 3: Create or get ChromaDB collection (even if 0 problems for now)
        existing_collections = [c.name for c in chroma_client.list_collections()]

        if project_name in existing_collections:
            collection = chroma_client.get_collection(name=project_name)
            existing_ids = set(collection.get()['ids'])
            logging.info(f"Using existing collection '{project_name}' with {len(existing_ids)} items")
        else:
            collection = chroma_client.create_collection(
                name=project_name,
                embedding_function=None,
                metadata={"hnsw:space": "cosine", "type": "teacher_assistant"}
            )
            existing_ids = set()
            logging.info(f"Created new collection '{project_name}'")

        # If no problems extracted, return early but still success (collection exists)
        if not problems:
            return {
                'success': True,
                'error': 'No problems could be extracted from PDF. Try a different PDF with clearer text.',
                'problems_count': 0,
                'message': f"Project '{project_name}' created but no problems were extracted"
            }

        # Step 4: Prepare data with deduplication
        documents = []
        ids = []
        metadatas = []
        seen_ids_in_batch = set()  # Track IDs in current batch to avoid duplicates

        for i, problem in enumerate(problems):
            # Create unique ID based on content hash
            problem_id = hashlib.md5(problem['text'].encode()).hexdigest()[:16]

            # Skip if already in database OR already added to current batch
            if problem_id not in existing_ids and problem_id not in seen_ids_in_batch:
                documents.append(problem['full_text'])
                ids.append(problem_id)
                metadatas.append({
                    'page': str(problem['page']),
                    'preview': problem['text'],
                    'type': 'problem'
                })
                seen_ids_in_batch.add(problem_id)  # Mark as processed in this batch

        if not documents:
            return {
                'success': True,
                'message': 'All problems already exist in project',
                'problems_count': 0,
                'total_problems': len(problems)
            }

        # Step 5: Generate embeddings and add to ChromaDB
        embeddings_list = embedding_model.encode(documents).tolist()

        collection.add(
            documents=documents,
            ids=ids,
            embeddings=embeddings_list,
            metadatas=metadatas
        )

        logging.info(f"Added {len(documents)} new problems to '{project_name}'")

        return {
            'success': True,
            'problems_count': len(documents),
            'total_problems': len(problems),
            'message': f'Successfully processed {len(documents)} problems'
        }

    except Exception as e:
        logging.exception(f"Error processing PDF: {e}")
        return {
            'success': False,
            'error': str(e),
            'problems_count': 0
        }
