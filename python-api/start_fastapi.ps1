# Start FastAPI Server
# Run this from the python-api directory

Set-Location $PSScriptRoot

if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    & .\.venv\Scripts\Activate.ps1
    Write-Host "Starting FastAPI server on http://127.0.0.1:8000" -ForegroundColor Green
    uvicorn main:app --reload --port 8000
} else {
    Write-Host "❌ Virtual environment not found. Run: python -m venv .venv" -ForegroundColor Red
}

