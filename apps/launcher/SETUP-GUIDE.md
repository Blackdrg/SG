# SpiceGarden Launcher - Complete Setup Guide

## Step 1: Install Launcher Dependencies
```powershell
cd apps\launcher
npm install
```

## Step 2: Generate Icon (Required for .exe)
```powershell
node scripts\generate-icon.js
```
This creates a placeholder `assets\icon.ico`. Replace with your custom icon for production.

## Step 3: Build the Launcher
```powershell
npm run build
```

## Step 4: Create Production Windows Executable
```powershell
npm run dist
```

**Output:**
- `dist/SpiceGarden Launcher Setup 1.0.0.exe` - NSIS installer with desktop/start menu shortcuts
- `dist/SpiceGarden Launcher 1.0.0.exe` - Portable executable

## Requirements Met

### ✅ One-click startup
- Start All button launches Docker + Node services
- Docker Desktop verification
- Port availability checks
- Node.js version validation (>=18)

### ✅ Service management dashboard
- Shows status for all 8 services
- Real-time status updates

### ✅ Health monitoring
- CPU/RAM monitoring via systeminformation
- Auto-refresh every 5 seconds
- Service health indicators

### ✅ Environment setup wizard
- Auto-generates .env file
- Auto-generates all secrets (JWT, encryption keys, passwords)

### ✅ Error handling
- Detects port conflicts
- Docker missing/not running
- Missing dependencies
- DB connection errors

### ✅ One-click actions
- Start All, Stop All, Restart Services
- Open Customer App, Restaurant Dashboard, Admin Dashboard
- Open Logs, Reset Database

### ✅ Technology requirements
- Electron + TypeScript
- child_process for running commands
- Docker integration via docker-compose
- NSIS + electron-builder packaging
- Auto-updater support

### ✅ Packaging
- .exe installer (NSIS)
- Portable .exe
- Desktop shortcut
- Start menu shortcut