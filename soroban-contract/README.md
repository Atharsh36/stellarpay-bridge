# StellarPay Escrow Contract

## Setup

1. Install Rust and Soroban CLI:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked soroban-cli
```

2. Build contract:
```bash
cargo build --target wasm32-unknown-unknown --release
```

3. Deploy to testnet:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source-account <your-account> \
  --network testnet
```

## Contract Functions

- `create_payment(payment_id, user, merchant, amount)` - Lock XLM in escrow
- `confirm_payment(payment_id)` - Release XLM to merchant
- `refund_payment(payment_id)` - Refund XLM to user
- `get_payment(payment_id)` - Get payment details