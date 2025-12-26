# Start All Services - Khel-Khoj AI
# This script starts Celery and FastAPI in separate PowerShell windows

Write-Host "=== Starting Khel-Khoj AI Services ===" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check Redis
Write-Host "Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($redisTest) {
        Write-Host "✅ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis is not running. Please start Redis first:" -ForegroundColor Red
        Write-Host "   docker run -d --name redis-local -p 6379:6379 redis" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Could not check Redis connection" -ForegroundColor Red
    exit 1
}

# Check virtual environment
if (-Not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found. Please create it first:" -ForegroundColor Red
    Write-Host "   python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Celery Worker in new window
Write-Host "📦 Starting Celery worker..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\.venv\Scripts\Activate.ps1; Write-Host 'Celery Worker - Press Ctrl+C to stop' -ForegroundColor Green; celery -A tasks worker --loglevel=info"

Start-Sleep -Seconds 2

# Start FastAPI in new window
Write-Host "🚀 Starting FastAPI server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\.venv\Scripts\Activate.ps1; Write-Host 'FastAPI Server - Press Ctrl+C to stop' -ForegroundColor Green; Write-Host 'API Docs: http://127.0.0.1:8000/docs' -ForegroundColor Yellow; uvicorn main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  • Celery Worker: Running in new window" -ForegroundColor White
Write-Host "  • FastAPI: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  • API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To stop services, close the PowerShell windows or press Ctrl+C" -ForegroundColor Yellow

