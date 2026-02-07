# RUST INSTALLATION REQUIRED

Rust is not installed on your system. Follow these steps:

## Option 1: Manual Installation
1. Go to: https://rustup.rs/
2. Download and run the installer
3. Restart PowerShell
4. Run: `cargo build --target wasm32-unknown-unknown --release`

## Option 2: PowerShell Script
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-rust.ps1
```

## Option 3: Skip Contract Build
For the hackathon MVP, you can skip the contract build and use a mock contract address in your backend:

In `backend\src\utils\contract.js`, set:
```javascript
const CONTRACT_ADDRESS = 'MOCK_CONTRACT_FOR_DEMO';
```

The frontend and backend will work without the actual contract deployed.