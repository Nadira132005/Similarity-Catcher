#!/bin/bash

set -e

# 1. Check prerequisites
if ! command -v dotnet &> /dev/null; then
    echo "Error: .NET SDK is not installed."
    exit 1
fi
if ! command -v docfx &> /dev/null; then
    echo "DocFX not found. Installing DocFX as a global tool..."
    dotnet tool install -g docfx
    export PATH="$PATH:$(dotnet --list-tools | grep docfx | awk '{print $3}')/.dotnet/tools"
fi

# 2. Go to the docfx directory (adjust if needed)
cd "$(dirname "$0")/runner/docfx" || { echo "Error: Cannot find runner/docfx directory"; exit 1; }

# 3. Ensure docfx.json includes src and test projects
echo "Generating documentation from src and test projects..."
docfx docfx.json --verbose

if [ $? -eq 0 ]; then
    echo "✅ HTML documentation generated successfully!"
    echo "Output: $(pwd)/_site/"
else
    echo "⚠️  DocFX completed with warnings or errors. Check the log above."
fi