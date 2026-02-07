const fs = require('fs');
const path = require('path');

console.log('🚀 StellarBridge Escrow Contract');
console.log('================================');

// Check if WASM file exists
const wasmPath = path.join(__dirname, 'target', 'wasm32-unknown-unknown', 'release', 'stellarbridge_escrow.wasm');

if (fs.existsSync(wasmPath)) {
    const stats = fs.statSync(wasmPath);
    console.log('✅ Contract compiled successfully!');
    console.log(`📦 WASM file: ${wasmPath}`);
    console.log(`📏 Size: ${stats.size} bytes`);
    console.log('');
    
    console.log('🔧 Contract Functions:');
    console.log('- create_payment(id: u64, user: Address, merchant: Address, amount: i128) -> bool');
    console.log('- confirm_payment(id: u64, merchant: Address) -> bool');
    console.log('- get_payment(id: u64) -> Payment');
    console.log('- cancel_payment(id: u64, user: Address) -> bool');
    console.log('');
    
    console.log('🌐 To deploy to Stellar Testnet:');
    console.log('1. Install Soroban CLI: https://soroban.stellar.org/docs/getting-started/setup');
    console.log('2. Configure testnet:');
    console.log('   soroban network add testnet --rpc-url https://soroban-testnet.stellar.org --network-passphrase "Test SDF Network ; September 2015"');
    console.log('3. Deploy contract:');
    console.log('   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarbridge_escrow.wasm --source-account YOUR_SECRET_KEY --network testnet');
    console.log('');
    console.log('💡 The contract will return a contract address that you can use in your application.');
    
} else {
    console.log('❌ WASM file not found!');
    console.log('Run: cargo build --target wasm32-unknown-unknown --release');
}