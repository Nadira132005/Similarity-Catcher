

$host.ui.RawUI.WindowTitle = "Frontend Server"

# Change to frontend directory
Set-Location "$PSScriptRoot/frontend"

# Ensure dependencies are installed, then start frontend on port 3000
if (!(Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Start frontend on port 3000 (default) or change the port if needed
npx next dev -p 3000
