# 🚀 Smart Contract Deployment Guide

## Prerequisites
1. **Install Rust**: https://rustup.rs/
2. **Install Soroban CLI**: `cargo install --locked soroban-cli`
3. **Add WASM target**: `rustup target add wasm32-unknown-unknown`

## Quick Deploy

### Windows:
```cmd
.\deploy-windows.bat
```

### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps

### 1. Build Contract
```bash
cargo build --target wasm32-unknown-unknown --release
```

### 2. Generate Keypair
```bash
soroban keys generate --global deployer --network testnet
```

### 3. Fund Account
```bash
soroban keys fund deployer --network testnet
```

### 4. Deploy Contract
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer \
  --network testnet
```

### 5. Update Backend
Copy the returned contract ID to `backend/src/utils/contract.js`:
```javascript
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ID_HERE';
```

## Contract Functions

- `create_payment(payment_id, user, merchant, amount, upi_id)` - Lock XLM
- `confirm_upi_payment(payment_id)` - Merchant confirms UPI payment
- `release_xlm(payment_id)` - Release XLM to merchant
- `get_payment(payment_id)` - Get payment details

## Verification

After deployment, test the contract:
```bash
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- get_payment --payment_id test
```

Your contract is now live on Stellar testnet! 🎉