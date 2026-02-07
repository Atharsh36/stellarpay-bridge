#!/bin/bash

echo "🚀 Deploying StellarPay UPI Bridge Contract to Stellar Testnet"

# Check if Soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "❌ Soroban CLI not found. Installing..."
    cargo install --locked soroban-cli
fi

# Add WASM target if not present
rustup target add wasm32-unknown-unknown

echo "📦 Building contract..."
cargo build --target wasm32-unknown-unknown --release

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    
    # Generate a new keypair for deployment (or use existing)
    echo "🔑 Generating deployment keypair..."
    soroban keys generate --global deployer --network testnet
    
    # Fund the account
    echo "💰 Funding deployer account..."
    soroban keys fund deployer --network testnet
    
    # Deploy the contract
    echo "🌟 Deploying contract to Stellar testnet..."
    CONTRACT_ID=$(soroban contract deploy \
        --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
        --source deployer \
        --network testnet)
    
    echo "🎉 Contract deployed successfully!"
    echo "📋 Contract ID: $CONTRACT_ID"
    echo ""
    echo "📝 Update your backend with this contract address:"
    echo "const CONTRACT_ADDRESS = '$CONTRACT_ID';"
    echo ""
    echo "🔗 View on Stellar Expert:"
    echo "https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
    
else
    echo "❌ Contract build failed!"
    exit 1
fi