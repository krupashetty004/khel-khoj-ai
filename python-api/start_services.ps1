# Start Services Script for Khel-Khoj AI
# Run this from the python-api directory

Write-Host "=== Khel-Khoj AI - Service Startup ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "celery_app.py")) {
    Write-Host "❌ Error: Please run this script from the python-api directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "1. Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    & .\.venv\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "❌ Virtual environment not found. Please create it first:" -ForegroundColor Red
    Write-Host "   python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Check Redis connection
Write-Host ""
Write-Host "2. Checking Redis connection..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "✅ Redis is running on port 6379" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis is not running on port 6379" -ForegroundColor Yellow
        Write-Host "   Start Redis with one of these options:" -ForegroundColor Yellow
        Write-Host "   Option 1 (Docker): docker run -d --name redis-local -p 6379:6379 redis" -ForegroundColor Cyan
        Write-Host "   Option 2 (Windows): Download Redis from https://github.com/microsoftarchive/redis/releases" -ForegroundColor Cyan
        Write-Host "   Option 3 (WSL): wsl redis-server" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Could not check Redis. Make sure it's running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Service Commands ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start Celery worker (run in a NEW terminal):" -ForegroundColor Yellow
Write-Host "  cd python-api" -ForegroundColor White
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  celery -A tasks worker --loglevel=info" -ForegroundColor White
Write-Host ""
Write-Host "To start FastAPI server (run in a NEW terminal):" -ForegroundColor Yellow
Write-Host "  cd python-api" -ForegroundColor White
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  uvicorn main:app --reload --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "Or use the individual start scripts:" -ForegroundColor Yellow
Write-Host "  .\start_celery.ps1" -ForegroundColor White
Write-Host "  .\start_fastapi.ps1" -ForegroundColor White

