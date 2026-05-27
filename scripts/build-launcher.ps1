# SpiceGarden Launcher Build Script for Windows
# Run: .\build-launcher.ps1

Write-Host "========================================="
Write-Host "SpiceGarden Launcher Build Script"
Write-Host "========================================="

# Install dependencies
Write-Host "Installing dependencies..."
Push-Location -Path "apps\launcher"
npm install

# Check for icon
$iconPath = "assets\icon.ico"
if (-not (Test-Path $iconPath)) {
    Write-Host "Warning: icon.ico not found. Generating placeholder..."
    node scripts/generate-icon.js
}

# Build the application
Write-Host "Building main process..."
npm run build:main

Write-Host "Building renderer process..."
npm run build:renderer

Write-Host "========================================="
Write-Host "Build completed successfully!"
Write-Host "========================================="
Write-Host ""
Write-Host "To generate Windows .exe:"
Write-Host "  npm run dist"
Write-Host ""
Write-Host "Output will be in apps\launcher\dist\"

Pop-Location