#!/bin/bash
set -e

# Change to backend directory (in case script is run from elsewhere)
cd "$(dirname "$0")"

# Activate venv if it exists, otherwise create it
if [ -d "backend_venv" ]; then
    echo "Activating virtual environment..."
    source backend_venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv backend_venv
    source backend_venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Set environment variables
export FLASK_APP=src/main.py
export FLASK_ENV=development
export PYTHONPATH=$(pwd)/src

echo "Starting backend server on http://localhost:8000"
python src/main.py
