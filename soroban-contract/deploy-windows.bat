@echo off
echo 🚀 Deploying StellarPay UPI Bridge Contract to Stellar Testnet

echo 📦 Building contract...
cargo build --target wasm32-unknown-unknown --release

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Contract build failed!
    pause
    exit /b 1
)

echo ✅ Contract built successfully!

echo 🔑 Generating deployment keypair...
soroban keys generate --global deployer --network testnet

echo 💰 Funding deployer account...
soroban keys fund deployer --network testnet

echo 🌟 Deploying contract to Stellar testnet...
for /f "tokens=*" %%i in ('soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm --source deployer --network testnet') do set CONTRACT_ID=%%i

echo.
echo 🎉 Contract deployed successfully!
echo 📋 Contract ID: %CONTRACT_ID%
echo.
echo 📝 Update your backend with this contract address:
echo const CONTRACT_ADDRESS = '%CONTRACT_ID%';
echo.
echo 🔗 View on Stellar Expert:
echo https://stellar.expert/explorer/testnet/contract/%CONTRACT_ID%

pause