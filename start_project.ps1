# Start All Project Services - Khel-Khoj AI
# This script starts all three services: Next.js, Express, and FastAPI

Write-Host "=== Starting Khel-Khoj AI Project ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Check Redis for FastAPI/Celery
Write-Host "Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($redisTest) {
        Write-Host "✅ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis is not running. FastAPI/Celery may not work." -ForegroundColor Yellow
        Write-Host "   Start with: docker run -d --name redis-local -p 6379:6379 redis" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Could not check Redis" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Next.js Frontend
Write-Host "🌐 Starting Next.js Frontend..." -ForegroundColor Cyan
$nextjsCmd = "cd '$projectRoot\my-next-app'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $nextjsCmd

Start-Sleep -Seconds 2

# Start Express Backend
Write-Host "⚡ Starting Express Backend..." -ForegroundColor Cyan
$expressCmd = "cd '$projectRoot\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $expressCmd

Start-Sleep -Seconds 2

# Start FastAPI + Celery (if not already running)
Write-Host "🐍 Starting FastAPI + Celery..." -ForegroundColor Cyan
$fastapiPath = "$projectRoot\python-api"
if (Test-Path "$fastapiPath\.venv\Scripts\Activate.ps1") {
    # Start Celery Worker
    $celeryCmd = "cd '$fastapiPath'; .\.venv\Scripts\Activate.ps1; Write-Host 'Celery Worker' -ForegroundColor Green; celery -A tasks worker --loglevel=info"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $celeryCmd
    
    Start-Sleep -Seconds 2
    
    # Start FastAPI
    $fastapiCmd = "cd '$fastapiPath'; .\.venv\Scripts\Activate.ps1; Write-Host 'FastAPI Server' -ForegroundColor Green; & .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fastapiCmd
} else {
    Write-Host "⚠️  Python virtual environment not found. Skipping FastAPI." -ForegroundColor Yellow
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  • Next.js Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  • Express Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "  • FastAPI:          http://localhost:8000" -ForegroundColor White
Write-Host "  • API Docs:         http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To stop services, close the PowerShell windows or press Ctrl+C" -ForegroundColor Yellow

