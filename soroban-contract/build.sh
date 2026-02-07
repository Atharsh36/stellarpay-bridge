#!/bin/bash

echo "Building StellarBridge Escrow Contract..."

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    echo "📦 WASM file: target/wasm32-unknown-unknown/release/stellarbridge_escrow.wasm"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to testnet (optional)
echo ""
echo "To deploy to testnet, run:"
echo "soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarbridge_escrow.wasm --source-account YOUR_SECRET_KEY --network testnet"