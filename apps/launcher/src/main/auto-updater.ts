import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

export class AutoUpdater {
  private feedUrl: string;
  private autoDownload: boolean;

  constructor() {
    this.feedUrl = 'https://github.com/spicegarden/launcher-updates/releases/latest';
    this.autoDownload = true;
    this.init();
  }

  private init(): void {
    if (!app.isPackaged) return;

    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'spicegarden',
      repo: 'launcher-updates'
    });

    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of SpiceGarden Launcher is available',
        buttons: ['Download', 'Later'],
        defaultId: 0
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart to apply?',
        buttons: ['Restart', 'Later'],
        defaultId: 0
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err);
    });
  }
}