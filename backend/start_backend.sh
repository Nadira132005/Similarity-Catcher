#!/bin/bash
set -e

# Change to backend directory
cd "$(dirname "$0")/src"

# Activate venv
if [ -f "backend_venv/Scripts/activate" ]; then
    source backend_venv/Scripts/activate
else
    python -m venv backend_venv
    source backend_venv/Scripts/activate
    pip install -r requirements.txt
fi

export FLASK_APP=main.py
export FLASK_ENV=development
export PYTHONPATH=./src 

flask run --host=0.0.0.0 --port=8000
