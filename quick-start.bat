@echo off
echo ========================================
echo    StellarPay Bridge - Quick Start
echo ========================================
echo.

echo [1/4] Setting up Backend...
cd backend
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env with your actual database credentials!
    echo Press any key to continue after editing .env...
    pause
)

echo [2/4] Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo [3/4] Setting up database...
call npm run db:generate
call npm run db:push

echo [4/4] Setting up Frontend...
cd ..\frontend
if not exist .env.local (
    echo Creating .env.local file from example...
    copy .env.example .env.local
)

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Backend: cd backend && npm run dev
echo 2. Frontend: cd frontend && npm run dev
echo 3. Contract is already built at: soroban-contract\target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm
echo.
echo Demo Flow:
echo 1. Register as MERCHANT with email: merchant@test.com
echo 2. Register as USER with email: user@test.com  
echo 3. User creates payment to merchant@test.com
echo 4. Merchant confirms payment
echo 5. XLM transferred automatically
echo.
pause