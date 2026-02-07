@echo off
echo Building StellarBridge Escrow Contract...

REM Build the contract
cargo build --target wasm32-unknown-unknown --release

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Contract built successfully!
    echo 📦 WASM file: target\wasm32-unknown-unknown\release\stellarbridge_escrow.wasm
) else (
    echo ❌ Build failed!
    exit /b 1
)

echo.
echo To deploy to testnet, run:
echo soroban contract deploy --wasm target\wasm32-unknown-unknown\release\stellarbridge_escrow.wasm --source-account YOUR_SECRET_KEY --network testnet