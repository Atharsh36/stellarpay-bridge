@echo off
echo Deploying to Futurenet...
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm --source deployer --network futurenet
echo Contract deployed! Copy the contract ID above to your backend.