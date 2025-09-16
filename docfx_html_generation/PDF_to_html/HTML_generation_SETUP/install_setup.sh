#!/bin/bash

# HTML Documentation Setup Installer
# This script copies all necessary files to your project structure

echo "=== HTML Documentation Setup Installer ==="

# Check if project directory is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <project-directory>"
    echo "Example: $0 /path/to/your/project"
    exit 1
fi

PROJECT_DIR="$1"
DOCFX_DIR="$PROJECT_DIR/docfx"

echo "Installing HTML documentation setup to: $PROJECT_DIR"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$DOCFX_DIR"
mkdir -p "$DOCFX_DIR/docs"

# Copy configuration files
echo "Copying configuration files..."
cp docfx.json "$DOCFX_DIR/"
cp main_toc.yml "$DOCFX_DIR/toc.yml"
cp docs_toc.yml "$DOCFX_DIR/docs/toc.yml"

# Copy scripts
echo "Copying generation scripts..."
cp generate_html_docs.sh "$PROJECT_DIR/"
cp generate_html_docs.ps1 "$PROJECT_DIR/"
chmod +x "$PROJECT_DIR/generate_html_docs.sh"

# Copy documentation
echo "Copying documentation..."
cp DOCUMENTATION_GUIDE.md "$PROJECT_DIR/"
cp README.md "$PROJECT_DIR/HTML_SETUP_README.md"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Navigate to your project: cd $PROJECT_DIR"
echo "2. Run the generation script: ./generate_html_docs.sh"
echo "3. Or read the guide: cat DOCUMENTATION_GUIDE.md"
echo ""
echo "Your HTML documentation will be generated in: $DOCFX_DIR/_site/"
