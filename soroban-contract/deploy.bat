@echo off
echo ========================================
echo   StellarPay Contract Deployment
echo ========================================
echo.

echo Building contract...
cargo build --target wasm32-unknown-unknown --release

if errorlevel 1 (
    echo Contract build failed!
    pause
    exit /b 1
)

echo.
echo Contract built successfully!
echo WASM file location: target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm
echo.
echo Next steps:
echo 1. Install Soroban CLI: cargo install --locked soroban-cli
echo 2. Configure network: soroban network add testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"
echo 3. Deploy contract: soroban contract deploy --wasm target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm --network testnet --source YOUR_SECRET_KEY
echo.
echo For detailed deployment instructions, see DEPLOYMENT.md
echo.
pause