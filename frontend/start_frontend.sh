#!/bin/bash
set -e

# Change to frontend directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend development server
echo "Starting frontend server on http://localhost:3000"
npm run dev
