# Start Celery Worker
# Run this from the python-api directory

Set-Location $PSScriptRoot

if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    & .\.venv\Scripts\Activate.ps1
    Write-Host "Starting Celery worker..." -ForegroundColor Green
    celery -A tasks worker --loglevel=info
} else {
    Write-Host "❌ Virtual environment not found. Run: python -m venv .venv" -ForegroundColor Red
}

