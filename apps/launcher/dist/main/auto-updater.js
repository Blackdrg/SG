"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void 0;
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
class AutoUpdater {
    feedUrl;
    autoDownload;
    constructor() {
        this.feedUrl = 'https://github.com/spicegarden/launcher-updates/releases/latest';
        this.autoDownload = true;
        this.init();
    }
    init() {
        if (!electron_1.app.isPackaged)
            return;
        electron_updater_1.autoUpdater.setFeedURL({
            provider: 'github',
            owner: 'spicegarden',
            repo: 'launcher-updates'
        });
        electron_updater_1.autoUpdater.checkForUpdates();
        electron_updater_1.autoUpdater.on('update-available', (info) => {
            electron_1.dialog.showMessageBox({
                type: 'info',
                title: 'Update Available',
                message: 'A new version of SpiceGarden Launcher is available',
                buttons: ['Download', 'Later'],
                defaultId: 0
            }).then(({ response }) => {
                if (response === 0) {
                    electron_updater_1.autoUpdater.downloadUpdate();
                }
            });
        });
        electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
            electron_1.dialog.showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: 'Update downloaded. Restart to apply?',
                buttons: ['Restart', 'Later'],
                defaultId: 0
            }).then(({ response }) => {
                if (response === 0) {
                    electron_updater_1.autoUpdater.quitAndInstall();
                }
            });
        });
        electron_updater_1.autoUpdater.on('error', (err) => {
            console.error('Auto-updater error:', err);
        });
    }
}
exports.AutoUpdater = AutoUpdater;
//# sourceMappingURL=auto-updater.js.map