# ==================================================
# AUREA × JEWELPRO - ERP STACK RUNNER
# ==================================================

Clear-Host
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   AUREA x JEWELPRO - STARTING SYSTEM FULL STACK" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Express Backend
Write-Host "[1/2] Starting Express API Server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 2. Start Next.js Frontend
Write-Host "[2/2] Starting Next.js Web Panel on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend/aureaa-main; npm run dev"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: Both services launched in separate windows!" -ForegroundColor Green
Write-Host " (Hold Ctrl and click the links below to open)" -ForegroundColor Yellow
Write-Host " - Backend API : http://localhost:5000" -ForegroundColor White
Write-Host " - Frontend Web: http://localhost:3000" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
