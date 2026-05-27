#!/bin/bash
# SpiceGarden Launcher Build Script for Windows
# Run: npm run dist

set -e

echo "========================================="
echo "SpiceGarden Launcher Build Script"
echo "========================================="

# Check if running on Windows
if [ "$(uname -s)" = "Linux" ] || [ "$(uname -s)" = "Darwin" ]; then
    echo "Warning: Building on non-Windows platform. Windows-specific features may not work."
fi

# Install dependencies
echo "Installing dependencies..."
cd apps/launcher
npm install

# Generate icon if missing
if [ ! -f "assets/icon.ico" ]; then
    echo "Generating placeholder icon..."
    node scripts/generate-icon.js || true
fi

# Build the application
echo "Building main process..."
npm run build:main

echo "Building renderer process..."
npm run build:renderer

echo "========================================="
echo "Build completed successfully!"
echo "========================================="
echo ""
echo "To generate Windows .exe:"
echo "  npm run dist"
echo ""
echo "Output will be in:"
echo "  - apps/launcher/dist/"
echo "  - SpiceGarden Launcher Setup 1.0.0.exe (installer)"
echo "  - SpiceGarden Launcher 1.0.0.exe (portable)"