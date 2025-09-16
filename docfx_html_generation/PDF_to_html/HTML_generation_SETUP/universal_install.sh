#!/bin/bash

# Universal HTML Documentation Setup Installer
# This script adapts the setup to any C# project structure

echo "=== Universal HTML Documentation Setup Installer ==="

# Check if project directory is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <project-directory>"
    echo "Example: $0 /path/to/your/project"
    exit 1
fi

PROJECT_DIR="$1"
DOCFX_DIR="$PROJECT_DIR/docfx"

echo "Installing HTML documentation setup to: $PROJECT_DIR"

# Analyze project structure
echo "Analyzing project structure..."

# Find all .csproj files
CSPROJ_FILES=$(find "$PROJECT_DIR" -name "*.csproj" -not -path "*/bin/*" -not -path "*/obj/*" 2>/dev/null)
CSPROJ_COUNT=$(echo "$CSPROJ_FILES" | wc -l)

if [ -z "$CSPROJ_FILES" ]; then
    echo "❌ No .csproj files found in $PROJECT_DIR"
    echo "This doesn't appear to be a .NET project directory."
    exit 1
fi

echo "✅ Found $CSPROJ_COUNT C# projects"

# Determine source directory pattern
SRC_PATTERN="src/**/*.csproj"
if [ -d "$PROJECT_DIR/src" ]; then
    echo "✅ Using standard 'src/' directory structure"
    SRC_PATTERN="src/**/*.csproj"
elif [ -d "$PROJECT_DIR/source" ]; then
    echo "✅ Using 'source/' directory structure" 
    SRC_PATTERN="source/**/*.csproj"
else
    echo "✅ Using root directory structure"
    SRC_PATTERN="**/*.csproj"
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$DOCFX_DIR"
mkdir -p "$DOCFX_DIR/docs"

# Generate custom docfx.json
echo "Generating custom docfx.json..."
cat > "$DOCFX_DIR/docfx.json" << EOF
{
  "metadata": [
    {
      "src": [
        {
          "files": [
            "$SRC_PATTERN"
          ],
          "src": "../"
        }
      ],
      "dest": "api",
      "outputFormat": "apiPage"
    }
  ],
  "build": {
    "content": [
      {
        "files": [
          "**/*.{md,yml}"
        ],
        "exclude": [
          "_site/**"
        ]
      }
    ],
    "resource": [
      {
        "files": [
          "uploads/**/*",
          "images/**/*",
          "assets/**/*"
        ],
        "src": "docs"
      }
    ],
    "output": "_site",
    "template": [
      "default",
      "modern"
    ],
    "globalMetadata": {
      "_appName": "$(basename "$PROJECT_DIR") Documentation",
      "_appTitle": "$(basename "$PROJECT_DIR") Documentation", 
      "_enableSearch": true,
      "pdf": true
    },
    "pdf": {
      "content": [
        {
          "files": [
            "api/**/*.{md,yml}",
            "docs/**/*.{md,yml}"
          ]
        }
      ],
      "resource": [
        {
          "files": [
            "uploads/**/*",
            "images/**/*",
            "assets/**/*"
          ],
          "src": "docs"
        }
      ],
      "toc": "toc.yml"
    }
  }
}
EOF

# Create main toc.yml
echo "Creating main table of contents..."
cat > "$DOCFX_DIR/toc.yml" << 'EOF'
- name: Docs
  href: docs/toc.yml
- name: API
  href: api/toc.yml
EOF

# Create docs toc.yml
echo "Creating documentation table of contents..."
cat > "$DOCFX_DIR/docs/toc.yml" << 'EOF'
- name: Getting Started
  href: getting-started.md
- name: User Guide
  href: user-guide/
  items:
  - name: Installation
    href: user-guide/installation.md
  - name: Configuration  
    href: user-guide/configuration.md
- name: Developer Guide
  href: developer-guide/
  items:
  - name: Architecture
    href: developer-guide/architecture.md
  - name: Contributing
    href: developer-guide/contributing.md
EOF

# Create sample documentation files
echo "Creating sample documentation files..."
mkdir -p "$DOCFX_DIR/docs/user-guide"
mkdir -p "$DOCFX_DIR/docs/developer-guide"

cat > "$DOCFX_DIR/docs/getting-started.md" << EOF
# Getting Started

Welcome to the $(basename "$PROJECT_DIR") documentation!

## Overview

This project contains $CSPROJ_COUNT C# projects with comprehensive API documentation.

## Quick Start

1. Install dependencies
2. Build the project
3. Run the application

For detailed instructions, see the [User Guide](user-guide/).

## API Reference

Browse the [API Documentation](../api/) for detailed information about classes, methods, and interfaces.
EOF

cat > "$DOCFX_DIR/docs/user-guide/installation.md" << 'EOF'
# Installation

## Prerequisites

- .NET SDK 6.0 or later
- Visual Studio 2022 or VS Code

## Installation Steps

1. Clone the repository
2. Restore NuGet packages: `dotnet restore`
3. Build the solution: `dotnet build`
4. Run tests: `dotnet test`

## Troubleshooting

Common installation query and solutions.
EOF

cat > "$DOCFX_DIR/docs/user-guide/configuration.md" << 'EOF'
# Configuration

## Application Settings

Configure your application using appsettings.json or environment variables.

## Connection Strings

Set up database connections and external service endpoints.

## Logging

Configure logging levels and output destinations.
EOF

cat > "$DOCFX_DIR/docs/developer-guide/architecture.md" << 'EOF'
# Architecture

## Overview

This section describes the overall architecture and design patterns used in the project.

## Components

### Core Components
- Business Logic Layer
- Data Access Layer
- Presentation Layer

### External Dependencies
- Database connections
- External APIs
- Third-party libraries

## Design Patterns

Key design patterns and architectural decisions.
EOF

cat > "$DOCFX_DIR/docs/developer-guide/contributing.md" << 'EOF'
# Contributing

## Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Code Standards

- Follow C# coding conventions
- Write unit tests for new features
- Update documentation as needed

## Testing

- Run all tests before submitting
- Ensure code coverage meets requirements
- Add integration tests for new features
EOF

# Copy scripts
echo "Copying generation scripts..."
cp generate_html_docs.sh "$PROJECT_DIR/"
cp generate_html_docs.ps1 "$PROJECT_DIR/"
chmod +x "$PROJECT_DIR/generate_html_docs.sh"

# Copy documentation
echo "Copying documentation..."
cp DOCUMENTATION_GUIDE.md "$PROJECT_DIR/"
cp README.md "$PROJECT_DIR/HTML_SETUP_README.md"
cp QUICK_REFERENCE.md "$PROJECT_DIR/"

echo ""
echo "✅ Universal installation complete!"
echo ""
echo "📋 Analysis Results:"
echo "   - Found $CSPROJ_COUNT C# projects"
echo "   - Using pattern: $SRC_PATTERN"
echo "   - Project name: $(basename "$PROJECT_DIR")"
echo ""
echo "📁 Created Structure:"
echo "   - $DOCFX_DIR/docfx.json (customized for your project)"
echo "   - $DOCFX_DIR/toc.yml (main navigation)"
echo "   - $DOCFX_DIR/docs/ (sample documentation)"
echo "   - Generation scripts in project root"
echo ""
echo "🚀 Next Steps:"
echo "1. Review and customize the sample documentation in $DOCFX_DIR/docs/"
echo "2. Enable XML documentation in your .csproj files:"
echo "   <GenerateDocumentationFile>true</GenerateDocumentationFile>"
echo "3. Add XML comments to your C# code"
echo "4. Run: cd $PROJECT_DIR && ./generate_html_docs.sh"
echo ""
echo "📖 For detailed guidance, see:"
echo "   - HTML_SETUP_README.md"
echo "   - DOCUMENTATION_GUIDE.md"
echo "   - QUICK_REFERENCE.md"
echo ""
echo "🎉 Your documentation will be generated in: $DOCFX_DIR/_site/"
