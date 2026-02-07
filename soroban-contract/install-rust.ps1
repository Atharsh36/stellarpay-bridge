Write-Host "Installing Rust for Windows..."

# Download Rust installer
$rustupUrl = "https://win.rustup.rs/x86_64"
$rustupPath = "$env:TEMP\rustup-init.exe"

Write-Host "Downloading Rust installer..."
Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath

Write-Host "Running Rust installer..."
Start-Process -FilePath $rustupPath -ArgumentList "-y" -Wait

# Refresh environment variables
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

Write-Host "Adding WASM target..."
& "$env:USERPROFILE\.cargo\bin\rustup.exe" target add wasm32-unknown-unknown

Write-Host "Installing Soroban CLI..."
& "$env:USERPROFILE\.cargo\bin\cargo.exe" install --locked soroban-cli

Write-Host "Building contract..."
& "$env:USERPROFILE\.cargo\bin\cargo.exe" build --target wasm32-unknown-unknown --release

Write-Host "Done! Contract built at: target\wasm32-unknown-unknown\release\stellarpay_escrow.wasm"