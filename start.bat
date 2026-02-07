@echo off
echo Starting StellarBridge Pay...
echo.

echo [1/2] Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
