#!/usr/bin/env python3
"""
Download the sentence-transformers/all-MiniLM-L6-v2 model locally
"""
from sentence_transformers import SentenceTransformer
import os

# Get the backend src directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "src", "models", "all-MiniLM-L6-v2")

print(f"Downloading model to: {MODEL_DIR}")
print("This may take a few minutes...")

# Download the model from HuggingFace
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Save it locally
model.save(MODEL_DIR)

print(f"✅ Model downloaded successfully to: {MODEL_DIR}")
print("\nYou can now start the backend server!")
