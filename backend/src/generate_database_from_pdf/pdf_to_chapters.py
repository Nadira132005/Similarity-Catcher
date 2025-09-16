
import sys
import os
import re
import fitz  # PyMuPDF
from bs4 import BeautifulSoup

def pdf_to_html(pdf_path, html_path):
    doc = fitz.open(pdf_path)
    html_content = "<html><body>"
    for page in doc:
        html_content += f"<div class='page'>{page.get_text('html')}</div>"
    html_content += "</body></html>"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Saved HTML to {html_path}")
    return html_path

def extract_chapters_from_html(html_path):
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        text = soup.get_text(separator="\n")
    # Split by chapters/capitols using regex
    chapter_pattern = re.compile(r'(?:Chapter|Capitol)\s+\d+.*', re.IGNORECASE)
    splits = chapter_pattern.split(text)
    headers = chapter_pattern.findall(text)
    chapters = []
    for i, chapter_text in enumerate(splits):
        if i == 0 and not headers:
            continue  # skip preface if no chapter header
        header = headers[i-1] if i > 0 and i-1 < len(headers) else f"Section {i}"
        chapters.append({"title": header.strip(), "text": chapter_text.strip()})
    return chapters

def save_chapters_to_files(chapters, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for i, chapter in enumerate(chapters):
        filename = f"chapter_{i+1}_{chapter['title'].replace(' ', '_')[:30]}.txt"
        with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
            f.write(chapter["text"])
    print(f"Saved {len(chapters)} chapters to {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python pdf_to_chapters.py <input.pdf> <output_html> <output_dir>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    html_path = sys.argv[2]
    output_dir = sys.argv[3]
    pdf_to_html(pdf_path, html_path)
    chapters = extract_chapters_from_html(html_path)
    save_chapters_to_files(chapters, output_dir)
