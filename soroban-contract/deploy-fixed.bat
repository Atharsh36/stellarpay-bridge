@echo off
echo 🚀 Deploying StellarPay UPI Bridge Contract (Fixed SSL)

echo 📦 Building contract...
cargo build --target wasm32-unknown-unknown --release

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Contract build failed!
    pause
    exit /b 1
)

echo ✅ Contract built successfully!

echo 🔑 Using existing deployer keypair...

echo 💰 Funding deployer account (using Friendbot)...
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"

echo 🌟 Deploying contract to Stellar testnet...
for /f "tokens=*" %%i in ('soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm --source deployer --network testnet --rpc-url https://soroban-testnet.stellar.org') do set CONTRACT_ID=%%i

echo.
echo 🎉 Contract deployed successfully!
echo 📋 Contract ID: %CONTRACT_ID%
echo.
echo 📝 Update backend/src/utils/contract.js:
echo const CONTRACT_ADDRESS = '%CONTRACT_ID%';
echo.
echo ✅ Deployment complete!

pause