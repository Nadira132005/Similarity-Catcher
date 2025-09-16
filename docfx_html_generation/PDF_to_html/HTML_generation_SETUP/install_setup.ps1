# HTML Documentation Setup Installer (PowerShell)
# This script copies all necessary files to your project structure

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectDirectory
)

Write-Host "=== HTML Documentation Setup Installer ===" -ForegroundColor Green

$PROJECT_DIR = $ProjectDirectory
$DOCFX_DIR = Join-Path $PROJECT_DIR "docfx"

Write-Host "Installing HTML documentation setup to: $PROJECT_DIR" -ForegroundColor Yellow

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $DOCFX_DIR | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $DOCFX_DIR "docs") | Out-Null

# Copy configuration files
Write-Host "Copying configuration files..." -ForegroundColor Cyan
Copy-Item "docfx.json" -Destination $DOCFX_DIR
Copy-Item "main_toc.yml" -Destination (Join-Path $DOCFX_DIR "toc.yml")
Copy-Item "docs_toc.yml" -Destination (Join-Path $DOCFX_DIR "docs\toc.yml")

# Copy scripts
Write-Host "Copying generation scripts..." -ForegroundColor Cyan
Copy-Item "generate_html_docs.sh" -Destination $PROJECT_DIR
Copy-Item "generate_html_docs.ps1" -Destination $PROJECT_DIR

# Copy documentation
Write-Host "Copying documentation..." -ForegroundColor Cyan
Copy-Item "DOCUMENTATION_GUIDE.md" -Destination $PROJECT_DIR
Copy-Item "README.md" -Destination (Join-Path $PROJECT_DIR "HTML_SETUP_README.md")

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to your project: cd $PROJECT_DIR" -ForegroundColor Gray
Write-Host "2. Run the generation script: .\generate_html_docs.ps1" -ForegroundColor Gray
Write-Host "3. Or read the guide: Get-Content DOCUMENTATION_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Your HTML documentation will be generated in: $DOCFX_DIR\_site\" -ForegroundColor Yellow
