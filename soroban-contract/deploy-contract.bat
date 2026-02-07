@echo off
echo Deploying StellarPay Contract...

cd /d "c:\Users\athar\OneDrive\Desktop\stellarbridge pay\soroban-contract"

echo Building contract...
cargo build --target wasm32-unknown-unknown --release

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Contract built successfully!

echo Deploying to testnet...
soroban contract deploy ^
    --wasm target/wasm32-unknown-unknown/release/stellarpay_contract.wasm ^
    --source alice ^
    --network testnet

echo Deployment complete!
pause