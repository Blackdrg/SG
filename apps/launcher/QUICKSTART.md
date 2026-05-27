# SpiceGarden Launcher - Quick Start

## Prerequisites Check
- [x] Windows 10/11
- [x] Docker Desktop
- [x] Node.js 18+
- [x] 4GB+ RAM

## Installation Steps

### 1. Install Launcher Dependencies
```powershell
cd apps\launcher
npm install
```

### 2. Generate Environment (Optional - auto-generates on first run)
```powershell
# Generates .env and secrets/
npm run generate-env
```

### 3. Build Launcher
```powershell
npm run build
```

### 4. Create Production .exe
```powershell
npm run dist
```

### Output Files
- `dist/SpiceGarden Launcher Setup 1.0.0.exe` - NSIS installer with shortcuts
- `dist/SpiceGarden Launcher 1.0.0.exe` - Portable version

## Development Mode
```powershell
npm run dev
```

## Troubleshooting

### Missing icon.ico
The launcher includes a placeholder icon generator. For production, replace:
`apps/launcher/assets/icon.ico` with your branded icon.

### Docker not found
Ensure Docker Desktop is installed and running. Check `docker-compose` is available in PATH.

### Port conflicts
Run `npm run check-ports` to see which ports are in use.