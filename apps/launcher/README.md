# SpiceGarden Launcher

Enterprise Windows .exe launcher for the SpiceGarden Food Delivery Platform.

## Project Structure

```
apps/launcher/
├── package.json              # Electron dependencies and build config
├── tsconfig.main.json        # TypeScript config for main process
├── tsconfig.renderer.json    # TypeScript config for renderer process
├── webpack.renderer.config.js  # Webpack config for UI bundling
├── assets/
│   └── icon.ico              # Application icon (auto-generated placeholder)
├── src/
│   ├── main/
│   │   ├── main.ts           # Main Electron process entry
│   │   ├── preload.ts        # Preload script for IPC
│   │   ├── store-manager.ts  # Configuration and secrets management
│   │   ├── docker-manager.ts   # Docker integration
│   │   ├── process-manager.ts  # Node processes management
│   │   ├── error-handler.ts    # Error detection and handling
│   │   └── auto-updater.ts    # Auto-updater support
│   └── renderer/
│       ├── index.tsx         # React entry point
│       ├── index.html        # HTML template
│       ├── styles.css        # Application styles
│       ├── components/
│       │   └── ServiceStatusCard.tsx
│       └── pages/
│           └── Dashboard.tsx
└── scripts/
    ├── installer.nsh         # NSIS installer custom script
    └── generate-icon.js      # Icon generator script
```

## Setup Instructions

### Prerequisites
- Windows 10/11
- Docker Desktop for Windows
- Node.js 18+ installed
- 4GB RAM minimum (8GB recommended)

### Installation

1. **Clone the repository**
   ```powershell
   cd SpiceGarden
   ```

2. **Install launcher dependencies**
   ```powershell
   cd apps/launcher
   npm install
   ```

3. **Generate environment configuration**
   ```powershell
   npm run generate-env
   ```
   This creates `.env` and `secrets/` with secure random values.

4. **Build the launcher**
   ```powershell
   npm run build
   ```

5. **Run in development mode**
   ```powershell
   npm run dev
   ```

6. **Build production .exe**
   ```powershell
   npm run dist
   ```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development mode with hot reload |
| `npm run build` | Build all packages |
| `npm run dist` | Create NSIS installer |
| `npm run dist:portable` | Create portable .exe |

## Features

### One-click Startup
- Start all services with single "Start All" button
- Auto-verifies Docker Desktop installation
- Auto-checks port availability
- Verifies Node.js version >= 18
- Validates environment variables

### Service Management Dashboard
Shows real-time status of:
- Backend API (NestJS)
- PostgreSQL database
- Redis cache
- MongoDB database
- OpenSearch
- Prometheus monitoring
- Grafana dashboards
- AlertManager

### Health Monitoring
- CPU usage monitoring
- RAM consumption display
- Service health indicators
- Auto-refresh every 5 seconds
- Logs folder access

### Environment Setup Wizard
Auto-generates:
- `.env` with all required variables
- `secrets/jwt_secret.txt` - JWT signing key
- `secrets/encryption_secret.txt` - Data encryption key
- `secrets/db_password.txt` - Database password
- `secrets/stripe_secret.txt` - Stripe API key
- `secrets/opensearch_admin_password.txt` - OpenSearch admin password
- `secrets/grafana_admin_password.txt` - Grafana admin password

### One-click Actions
- **Start All** - Launches entire infrastructure
- **Stop All** - Halts all services gracefully
- **Restart Services** - Restarts infrastructure and apps
- **Open Customer App** - Opens http://localhost:3001
- **Open Restaurant Dashboard** - Opens http://localhost:3002
- **Open Admin Dashboard** - Opens http://localhost:3003
- **Open Logs** - Opens logs folder
- **Reset Database** - Destroys and recreates all databases

## Ports Used

| Service | Port |
|---------|------|
| Backend API | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| MongoDB | 27017 |
| OpenSearch | 9200 |
| Prometheus | 9090 |
| Grafana | 3000 |
| AlertManager | 9093 |
| OpenSearch Dashboards | 5601 |

## Troubleshooting

### Docker not detected
1. Install Docker Desktop from https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
2. Restart computer after installation
3. Ensure Docker Desktop is running

### Port conflicts
Run the launcher - it will detect port conflicts and suggest solutions.

### Missing dependencies
Run `npm install` in the root directory and each app folder.

## Production Build

### Windows (Build Machine Required)
Run on Windows with Docker Desktop installed:
```powershell
cd apps\launcher
npm install
npm run build
npm run dist   # Creates .exe in dist/
```

### Alternative: Build from ZIP
If electron-builder fails in workspace context:

1. Download the full project as ZIP
2. Extract to standalone folder (not in monorepo)
3. Run `npm install --ignore-scripts` 
4. Install electron-builder globally: `npm install -g electron-builder`
5. Then run `npx electron-builder --win`

### Cross-platform Limitations
electron-builder requires Windows for NSIS/portable targets. On non-Windows, it can only build for the current platform.

## Build Status

✅ **Successfully built!** All TypeScript compiled and Webpack bundled:
- `dist/main/*.js` - Compiled Electron main process
- `dist/renderer/index.html` - Rendered UI entry point
- `dist/renderer/renderer.js` - Bundled React application