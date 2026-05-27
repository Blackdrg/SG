"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const si = __importStar(require("systeminformation"));
const store_manager_1 = require("./store-manager");
const docker_manager_1 = require("./docker-manager");
const environment_manager_1 = require("./environment-manager");
const process_manager_1 = require("./process-manager");
const auto_updater_1 = require("./auto-updater");
const isDev = process.env.NODE_ENV === 'development';
class SpiceGardenLauncher {
    mainWindow = null;
    tray = null;
    storeManager;
    dockerManager;
    envManager;
    processManager;
    appPath;
    autoUpdater;
    constructor() {
        this.appPath = electron_1.app.getAppPath();
        this.storeManager = new store_manager_1.StoreManager();
        this.dockerManager = new docker_manager_1.DockerManager(this.storeManager);
        this.envManager = new environment_manager_1.EnvironmentManager(this.storeManager);
        this.processManager = new process_manager_1.ProcessManager(this.storeManager, this.dockerManager);
        this.autoUpdater = new auto_updater_1.AutoUpdater();
    }
    async initialize() {
        await electron_1.app.whenReady();
        this.createMainWindow();
        this.createTray();
        this.registerIPC();
        this.setupMenu();
        this.envManager.checkAndGenerateEnv();
    }
    createMainWindow() {
        this.mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 1000,
            minHeight: 700,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true
            },
            icon: path.join(this.appPath, 'assets', 'icon.ico')
        });
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        if (isDev) {
            this.mainWindow.loadURL('http://localhost:3000');
        }
        else {
            this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        }
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    createTray() {
        const iconPath = path.join(this.appPath, 'assets', 'icon.ico');
        this.tray = new electron_1.Tray(iconPath);
        this.updateTrayMenu();
    }
    updateTrayMenu() {
        const menu = electron_1.Menu.buildFromTemplate([
            { label: 'Show SpiceGarden Launcher', click: () => this.mainWindow?.show() },
            { type: 'separator' },
            { label: 'Start All Services', click: () => this.processManager.startAll() },
            { label: 'Stop All Services', click: () => this.processManager.stopAll() },
            { type: 'separator' },
            { label: 'Quit', click: () => electron_1.app.quit() }
        ]);
        this.tray?.setContextMenu(menu);
    }
    setupMenu() {
        const menu = electron_1.Menu.buildFromTemplate([
            {
                label: 'Application',
                submenu: [
                    { label: 'About', click: () => this.showAbout() },
                    { type: 'separator' },
                    { role: 'services', label: 'Services' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            }
        ]);
        electron_1.Menu.setApplicationMenu(menu);
    }
    showAbout() {
        electron_1.dialog.showMessageBox({
            type: 'info',
            title: 'About SpiceGarden Launcher',
            message: 'SpiceGarden Launcher v1.0.0',
            detail: 'Enterprise launcher for SpiceGarden Food Delivery Platform\nPowered by Electron',
            buttons: ['OK']
        });
    }
    registerIPC() {
        electron_1.ipcMain.handle('check-prerequisites', async () => {
            return await this.envManager.checkPrerequisites();
        });
        electron_1.ipcMain.handle('start-all', async () => {
            return await this.processManager.startAll();
        });
        electron_1.ipcMain.handle('stop-all', async () => {
            return await this.processManager.stopAll();
        });
        electron_1.ipcMain.handle('restart-services', async () => {
            return await this.processManager.restart();
        });
        electron_1.ipcMain.handle('get-service-status', async () => {
            return await this.processManager.getStatus();
        });
        electron_1.ipcMain.handle('get-system-info', async () => {
            return await this.getSystemInfo();
        });
        electron_1.ipcMain.handle('get-docker-status', async () => {
            return await this.dockerManager.getStatus();
        });
        electron_1.ipcMain.handle('open-url', async (_, url) => {
            await electron_1.shell.openExternal(url);
            return { success: true };
        });
        electron_1.ipcMain.handle('generate-env', async () => {
            return await this.envManager.generateEnv();
        });
        electron_1.ipcMain.handle('reset-database', async () => {
            return await this.dockerManager.resetDatabases();
        });
        electron_1.ipcMain.handle('check-ports', async () => {
            return await this.envManager.checkPorts();
        });
        electron_1.ipcMain.handle('get-logs', async (_, service) => {
            return await this.processManager.getLogs(service);
        });
    }
    async getSystemInfo() {
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const load = await si.currentLoad();
        return {
            cpu: {
                model: cpu.model,
                cores: cpu.cores,
                speed: cpu.speed,
                usage: load.avgLoad
            },
            memory: {
                total: mem.total,
                available: mem.available,
                used: mem.used,
                usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
            },
            os: {
                platform: osInfo.platform,
                release: osInfo.release,
                arch: osInfo.arch
            }
        };
    }
    run() {
        electron_1.app.whenReady().then(() => this.initialize());
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.processManager.stopAll();
            }
        });
        electron_1.app.on('activate', () => {
            if (this.mainWindow === null) {
                this.createMainWindow();
            }
        });
        electron_1.app.on('before-quit', () => {
            this.processManager.stopAll();
        });
    }
}
const launcher = new SpiceGardenLauncher();
launcher.run();
//# sourceMappingURL=main.js.map