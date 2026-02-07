@echo off
echo Installing Rust and building Soroban contract...

echo Step 1: Install Rust
echo Downloading Rust installer...
curl --proto "=https" --tlsv1.2 -sSf https://win.rustup.rs/x86_64 -o rustup-init.exe
rustup-init.exe -y
call "%USERPROFILE%\.cargo\env.bat"

echo.
echo Step 2: Add WASM target
rustup target add wasm32-unknown-unknown

echo.
echo Step 3: Install Soroban CLI
cargo install --locked soroban-cli

echo.
echo Step 4: Build contract
cargo build --target wasm32-unknown-unknown --release

echo.
echo Contract built successfully!
echo WASM file: target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm
echo.
echo To deploy:
echo soroban contract deploy --wasm target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm --source-account YOUR_SECRET_KEY --network testnet
pause