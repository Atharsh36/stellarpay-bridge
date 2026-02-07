# Contract Deployment Instructions

## Prerequisites
1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Soroban CLI:
```bash
cargo install --locked soroban-cli
```

3. Add WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

## Build Contract
```bash
cargo build --target wasm32-unknown-unknown --release
```

## Deploy to Testnet
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source-account YOUR_SECRET_KEY \
  --network testnet
```

## Test Contract
```bash
cargo test
```

The contract will be deployed and return a contract address to use in your backend.