import { app, BrowserWindow, ipcMain, shell, dialog, Menu, Tray } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as si from 'systeminformation';
import { StoreManager } from './store-manager';
import { DockerManager } from './docker-manager';
import { EnvironmentManager } from './environment-manager';
import { ProcessManager } from './process-manager';
import { AutoUpdater } from './auto-updater';

const isDev = process.env.NODE_ENV === 'development';

class SpiceGardenLauncher {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private storeManager: StoreManager;
  private dockerManager: DockerManager;
  private envManager: EnvironmentManager;
  private processManager: ProcessManager;
  private appPath: string;
  private autoUpdater: AutoUpdater;

  constructor() {
    this.appPath = app.getAppPath();
    this.storeManager = new StoreManager();
    this.dockerManager = new DockerManager(this.storeManager);
    this.envManager = new EnvironmentManager(this.storeManager);
    this.processManager = new ProcessManager(this.storeManager, this.dockerManager);
    this.autoUpdater = new AutoUpdater();
  }

  async initialize(): Promise<void> {
    await app.whenReady();
    this.createMainWindow();
    this.createTray();
    this.registerIPC();
    this.setupMenu();
    this.envManager.checkAndGenerateEnv();
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
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
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private createTray(): void {
    const iconPath = path.join(this.appPath, 'assets', 'icon.ico');
    this.tray = new Tray(iconPath);
    this.updateTrayMenu();
  }

  private updateTrayMenu(): void {
    const menu = Menu.buildFromTemplate([
      { label: 'Show SpiceGarden Launcher', click: () => this.mainWindow?.show() },
      { type: 'separator' },
      { label: 'Start All Services', click: () => this.processManager.startAll() },
      { label: 'Stop All Services', click: () => this.processManager.stopAll() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);
    this.tray?.setContextMenu(menu);
  }

  private setupMenu(): void {
    const menu = Menu.buildFromTemplate([
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
    Menu.setApplicationMenu(menu);
  }

  private showAbout(): void {
    dialog.showMessageBox({
      type: 'info',
      title: 'About SpiceGarden Launcher',
      message: 'SpiceGarden Launcher v1.0.0',
      detail: 'Enterprise launcher for SpiceGarden Food Delivery Platform\nPowered by Electron',
      buttons: ['OK']
    });
  }

  private registerIPC(): void {
    ipcMain.handle('check-prerequisites', async () => {
      return await this.envManager.checkPrerequisites();
    });

    ipcMain.handle('start-all', async () => {
      return await this.processManager.startAll();
    });

    ipcMain.handle('stop-all', async () => {
      return await this.processManager.stopAll();
    });

    ipcMain.handle('restart-services', async () => {
      return await this.processManager.restart();
    });

    ipcMain.handle('get-service-status', async () => {
      return await this.processManager.getStatus();
    });

    ipcMain.handle('get-system-info', async () => {
      return await this.getSystemInfo();
    });

    ipcMain.handle('get-docker-status', async () => {
      return await this.dockerManager.getStatus();
    });

    ipcMain.handle('open-url', async (_, url: string) => {
      await shell.openExternal(url);
      return { success: true };
    });

    ipcMain.handle('generate-env', async () => {
      return await this.envManager.generateEnv();
    });

    ipcMain.handle('reset-database', async () => {
      return await this.dockerManager.resetDatabases();
    });

    ipcMain.handle('check-ports', async () => {
      return await this.envManager.checkPorts();
    });

    ipcMain.handle('get-logs', async (_, service: string) => {
      return await this.processManager.getLogs(service);
    });
  }

  private async getSystemInfo(): Promise<any> {
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

  run(): void {
    app.whenReady().then(() => this.initialize());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.processManager.stopAll();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.processManager.stopAll();
    });
  }
}

const launcher = new SpiceGardenLauncher();
launcher.run();