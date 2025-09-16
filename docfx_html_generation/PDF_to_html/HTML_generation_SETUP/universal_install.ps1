# Universal HTML Documentation Setup Installer (PowerShell)
# This script adapts the setup to any C# project structure

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectDirectory
)

Write-Host "=== Universal HTML Documentation Setup Installer ===" -ForegroundColor Green

$PROJECT_DIR = $ProjectDirectory
$DOCFX_DIR = Join-Path $PROJECT_DIR "docfx"

Write-Host "Installing HTML documentation setup to: $PROJECT_DIR" -ForegroundColor Yellow

# Analyze project structure
Write-Host "Analyzing project structure..." -ForegroundColor Cyan

# Find all .csproj files
$CsprojFiles = Get-ChildItem -Path $PROJECT_DIR -Filter "*.csproj" -Recurse | 
    Where-Object { $_.FullName -notmatch "\\bin\\" -and $_.FullName -notmatch "\\obj\\" }
$CsprojCount = $CsprojFiles.Count

if ($CsprojCount -eq 0) {
    Write-Host "❌ No .csproj files found in $PROJECT_DIR" -ForegroundColor Red
    Write-Host "This doesn't appear to be a .NET project directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found $CsprojCount C# projects" -ForegroundColor Green

# Determine source directory pattern
$SrcPattern = "src/**/*.csproj"
if (Test-Path (Join-Path $PROJECT_DIR "src")) {
    Write-Host "✅ Using standard 'src/' directory structure" -ForegroundColor Green
    $SrcPattern = "src/**/*.csproj"
} elseif (Test-Path (Join-Path $PROJECT_DIR "source")) {
    Write-Host "✅ Using 'source/' directory structure" -ForegroundColor Green
    $SrcPattern = "source/**/*.csproj"
} else {
    Write-Host "✅ Using root directory structure" -ForegroundColor Green
    $SrcPattern = "**/*.csproj"
}

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $DOCFX_DIR | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $DOCFX_DIR "docs") | Out-Null

# Generate custom docfx.json
Write-Host "Generating custom docfx.json..." -ForegroundColor Cyan
$ProjectName = Split-Path $PROJECT_DIR -Leaf
$DocfxConfig = @"
{
  "metadata": [
    {
      "src": [
        {
          "files": [
            "$SrcPattern"
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
      "_appName": "$ProjectName Documentation",
      "_appTitle": "$ProjectName Documentation",
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
"@

$DocfxConfig | Out-File -FilePath (Join-Path $DOCFX_DIR "docfx.json") -Encoding utf8

# Create main toc.yml
Write-Host "Creating main table of contents..." -ForegroundColor Cyan
$MainToc = @"
- name: Docs
  href: docs/toc.yml
- name: API
  href: api/toc.yml
"@
$MainToc | Out-File -FilePath (Join-Path $DOCFX_DIR "toc.yml") -Encoding utf8

# Create docs toc.yml
Write-Host "Creating documentation table of contents..." -ForegroundColor Cyan
$DocsToc = @"
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
"@
$DocsToc | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\toc.yml") -Encoding utf8

# Create sample documentation files
Write-Host "Creating sample documentation files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path (Join-Path $DOCFX_DIR "docs\user-guide") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $DOCFX_DIR "docs\developer-guide") | Out-Null

$GettingStarted = @"
# Getting Started

Welcome to the $ProjectName documentation!

## Overview

This project contains $CsprojCount C# projects with comprehensive API documentation.

## Quick Start

1. Install dependencies
2. Build the project
3. Run the application

For detailed instructions, see the [User Guide](user-guide/).

## API Reference

Browse the [API Documentation](../api/) for detailed information about classes, methods, and interfaces.
"@
$GettingStarted | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\getting-started.md") -Encoding utf8

$Installation = @"
# Installation

## Prerequisites

- .NET SDK 6.0 or later
- Visual Studio 2022 or VS Code

## Installation Steps

1. Clone the repository
2. Restore NuGet packages: ``dotnet restore``
3. Build the solution: ``dotnet build``
4. Run tests: ``dotnet test``

## Troubleshooting

Common installation query and solutions.
"@
$Installation | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\user-guide\installation.md") -Encoding utf8

$Configuration = @"
# Configuration

## Application Settings

Configure your application using appsettings.json or environment variables.

## Connection Strings

Set up database connections and external service endpoints.

## Logging

Configure logging levels and output destinations.
"@
$Configuration | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\user-guide\configuration.md") -Encoding utf8

$Architecture = @"
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
"@
$Architecture | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\developer-guide\architecture.md") -Encoding utf8

$Contributing = @"
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
"@
$Contributing | Out-File -FilePath (Join-Path $DOCFX_DIR "docs\developer-guide\contributing.md") -Encoding utf8

# Copy scripts
Write-Host "Copying generation scripts..." -ForegroundColor Cyan
Copy-Item "generate_html_docs.sh" -Destination $PROJECT_DIR
Copy-Item "generate_html_docs.ps1" -Destination $PROJECT_DIR

# Copy documentation
Write-Host "Copying documentation..." -ForegroundColor Cyan
Copy-Item "DOCUMENTATION_GUIDE.md" -Destination $PROJECT_DIR
Copy-Item "README.md" -Destination (Join-Path $PROJECT_DIR "HTML_SETUP_README.md")
Copy-Item "QUICK_REFERENCE.md" -Destination $PROJECT_DIR

Write-Host ""
Write-Host "✅ Universal installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Analysis Results:" -ForegroundColor Cyan
Write-Host "   - Found $CsprojCount C# projects" -ForegroundColor Gray
Write-Host "   - Using pattern: $SrcPattern" -ForegroundColor Gray
Write-Host "   - Project name: $ProjectName" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Created Structure:" -ForegroundColor Cyan
Write-Host "   - $DOCFX_DIR\docfx.json (customized for your project)" -ForegroundColor Gray
Write-Host "   - $DOCFX_DIR\toc.yml (main navigation)" -ForegroundColor Gray
Write-Host "   - $DOCFX_DIR\docs\ (sample documentation)" -ForegroundColor Gray
Write-Host "   - Generation scripts in project root" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review and customize the sample documentation in $DOCFX_DIR\docs\" -ForegroundColor Gray
Write-Host "2. Enable XML documentation in your .csproj files:" -ForegroundColor Gray
Write-Host "   <GenerateDocumentationFile>true</GenerateDocumentationFile>" -ForegroundColor Yellow
Write-Host "3. Add XML comments to your C# code" -ForegroundColor Gray
Write-Host "4. Run: cd $PROJECT_DIR && .\generate_html_docs.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed guidance, see:" -ForegroundColor Cyan
Write-Host "   - HTML_SETUP_README.md" -ForegroundColor Gray
Write-Host "   - DOCUMENTATION_GUIDE.md" -ForegroundColor Gray
Write-Host "   - QUICK_REFERENCE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Your documentation will be generated in: $DOCFX_DIR\_site\" -ForegroundColor Yellow
