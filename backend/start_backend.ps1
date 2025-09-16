# PowerShell script to activate backend venv and start backend server
# Also renames the terminal for clarity

$host.ui.RawUI.WindowTitle = "Backend Server"

# Change to backend directory
Set-Location "$PSScriptRoot/backend"

# Activate venv
. .\backend_venv\Scripts\Activate.ps1

# Start backend with auto-reload (Flask) on port 8000 to match frontend expectations
$env:FLASK_APP = "main.py"
$env:FLASK_ENV = "development"
flask run --host=0.0.0.0 --port=8000
