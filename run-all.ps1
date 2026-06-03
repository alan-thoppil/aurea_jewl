# ==================================================
# AUREA × JEWELPRO - FULL STACK RUNNER (CUSTOMER & ADMIN)
# ==================================================

Clear-Host
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   AUREA x JEWELPRO - STARTING SYSTEM FULL STACK" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Customer Express Backend
Write-Host "[1/4] Starting Customer Express API Server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 2. Start Customer Next.js Frontend
Write-Host "[2/4] Starting Customer Next.js Web Panel on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend/aureaa-main; npm run dev"

# 3. Start Admin Express Backend
Write-Host "[3/4] Starting Admin Express API Server on port 5002..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin_module/backend; npm run dev"

# 4. Start Admin Next.js Frontend
Write-Host "[4/4] Starting Admin Next.js Web Panel on port 3002..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin_module/frontend; npm run dev"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: All four services launched in separate windows!" -ForegroundColor Green
Write-Host " (Hold Ctrl and click the links below to open)" -ForegroundColor Yellow
Write-Host " - Customer Backend : http://localhost:5000" -ForegroundColor White
Write-Host " - Customer Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " - Admin Backend    : http://localhost:5002" -ForegroundColor White
Write-Host " - Admin Frontend   : http://localhost:3002" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
