# Manual Deployment Commands (SSL Fix)

## 1. Fund Account via Friendbot
```bash
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"
```

## 2. Deploy with explicit RPC URL
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer \
  --network testnet \
  --rpc-url https://soroban-testnet.stellar.org
```

## 3. Alternative: Use Futurenet
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer \
  --network futurenet
```

## 4. If SSL issues persist, use local network
```bash
# Start local Stellar network
docker run --rm -it -p 8000:8000 stellar/quickstart:latest --testnet

# Deploy to local
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer \
  --rpc-url http://localhost:8000/soroban/rpc
```

## Quick Fix Commands:
```cmd
curl "https://friendbot.stellar.org/?addr=$(soroban keys address deployer)"
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm --source deployer --network testnet --rpc-url https://soroban-testnet.stellar.org
```